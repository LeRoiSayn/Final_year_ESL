<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\User;
use App\Models\Course;
use App\Models\ClassModel;
use App\Models\Enrollment;
use App\Models\Teacher;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class StudentController extends Controller
{
    public function index(Request $request)
    {
        $query = Student::with(['user', 'department.faculty']);

        if ($request->filled('department_id')) {
            $query->where('department_id', $request->department_id);
        }

        if ($request->filled('level')) {
            $query->where('level', $request->level);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->whereHas('user', function ($uq) use ($search) {
                    $uq->where('first_name', 'like', "%{$search}%")
                        ->orWhere('last_name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('username', 'like', "%{$search}%");
                })->orWhere('student_id', 'like', "%{$search}%");
            });
        }

        $students = $query->orderBy('created_at', 'desc')->paginate($request->per_page ?? 15);

        return $this->success($students);
    }

    public function store(Request $request)
    {
        $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'username' => 'required|string|unique:users',
            'password' => 'required|string|min:6',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'date_of_birth' => 'nullable|date',
            'gender' => 'nullable|in:male,female,other',
            'department_id' => 'required|exists:departments,id',
            'level' => 'required|in:L1,L2,L3,M1,M2,D1,D2,D3',
            'enrollment_date' => 'required|date',
            'guardian_name' => 'nullable|string|max:255',
            'guardian_phone' => 'nullable|string|max:20',
            'guardian_email' => 'nullable|email',
        ]);

        DB::beginTransaction();
        try {
            // Create user
            $user = User::create([
                'first_name' => $request->first_name,
                'last_name' => $request->last_name,
                'email' => $request->email,
                'username' => $request->username,
                'password' => Hash::make($request->password),
                'phone' => $request->phone,
                'address' => $request->address,
                'date_of_birth' => $request->date_of_birth,
                'gender' => $request->gender,
                'role' => 'student',
            ]);

            // Generate student ID
            $lastStudent = Student::orderBy('id', 'desc')->first();
            $studentNumber = $lastStudent ? intval(substr($lastStudent->student_id, 4)) + 1 : 1;
            $studentId = 'STU-' . str_pad($studentNumber, 5, '0', STR_PAD_LEFT);

            // Create student
            $student = Student::create([
                'user_id' => $user->id,
                'department_id' => $request->department_id,
                'student_id' => $studentId,
                'level' => $request->level,
                'enrollment_date' => $request->enrollment_date,
                'guardian_name' => $request->guardian_name,
                'guardian_phone' => $request->guardian_phone,
                'guardian_email' => $request->guardian_email,
            ]);

            // Auto-enroll in courses
            $enrolledCount = $this->autoEnrollStudent($student);

            DB::commit();

            ActivityLog::log('create', "Created student: {$user->full_name} and auto-enrolled in {$enrolledCount} courses", $student);

            return $this->success(
                $student->load(['user', 'department.faculty', 'enrollments.class.course']),
                "Student created and enrolled in {$enrolledCount} courses",
                201
            );
        } catch (\Exception $e) {
            DB::rollBack();
            return $this->error('Failed to create student: ' . $e->getMessage(), 500);
        }
    }

    public function show(Student $student)
    {
        $student->load([
            'user',
            'department.faculty',
            'enrollments.class.course',
            'enrollments.class.teacher.user',
            'fees.feeType',
            'fees.payments',
        ]);

        return $this->success($student);
    }

    public function update(Request $request, Student $student)
    {
        $request->validate([
            'first_name' => 'sometimes|string|max:255',
            'last_name' => 'sometimes|string|max:255',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'date_of_birth' => 'nullable|date',
            'gender' => 'nullable|in:male,female,other',
            'department_id' => 'sometimes|exists:departments,id',
            'level' => 'sometimes|in:L1,L2,L3,M1,M2,D1,D2,D3',
            'guardian_name' => 'nullable|string|max:255',
            'guardian_phone' => 'nullable|string|max:20',
            'guardian_email' => 'nullable|email',
            'status' => 'sometimes|in:active,inactive,graduated,suspended',
        ]);

        DB::beginTransaction();
        try {
            // Update user
            $student->user->update($request->only(['first_name', 'last_name', 'phone', 'address', 'date_of_birth', 'gender']));

            // Update student
            $student->update($request->only([
                'department_id', 'level', 'guardian_name', 'guardian_phone', 'guardian_email', 'status'
            ]));

            DB::commit();

            ActivityLog::log('update', "Updated student: {$student->user->full_name}", $student);

            return $this->success($student->load(['user', 'department.faculty']), 'Student updated successfully');
        } catch (\Exception $e) {
            DB::rollBack();
            return $this->error('Failed to update student: ' . $e->getMessage(), 500);
        }
    }

    public function destroy(Student $student)
    {
        $name = $student->user->full_name;
        
        $student->user->delete(); // This will cascade delete the student

        ActivityLog::log('delete', "Deleted student: {$name}");

        return $this->success(null, 'Student deleted successfully');
    }

    public function autoEnroll(Student $student)
    {
        $enrolledCount = $this->autoEnrollStudent($student);

        return $this->success(
            $student->load(['enrollments.class.course']),
            "Student enrolled in {$enrolledCount} courses"
        );
    }

    private function autoEnrollStudent(Student $student): int
    {
        // Determine current academic semester (3 semesters per year)
        // Semester 1: Sep-Dec, Semester 2: Jan-Apr, Semester 3: May-Aug
        $month = (int) date('n');
        if ($month >= 9 && $month <= 12) {
            $currentSemester = '1';
        } elseif ($month >= 1 && $month <= 4) {
            $currentSemester = '2';
        } else {
            $currentSemester = '3';
        }

        $academicYear = $month >= 9 ? date('Y') . '-' . (date('Y') + 1) : (date('Y') - 1) . '-' . date('Y');

        // Get courses for student's department, level AND current semester
        $courses = Course::where('department_id', $student->department_id)
            ->where('level', $student->level)
            ->where('semester', $currentSemester)
            ->where('is_active', true)
            ->get();

        $enrolledCount = 0;

        // Get available teachers from the same department for auto-assignment
        $departmentTeachers = Teacher::where('department_id', $student->department_id)
            ->where('status', 'active')
            ->get();

        foreach ($courses as $course) {
            // Find or create class for this course in current semester
            $class = ClassModel::firstOrCreate(
                [
                    'course_id' => $course->id,
                    'academic_year' => $academicYear,
                    'semester' => $currentSemester,
                    'section' => 'A',
                ],
                [
                    'room' => 'TBD',
                    'capacity' => 50,
                    'is_active' => true,
                ]
            );

            // Auto-assign a teacher if the class has none and teachers are available
            if (!$class->teacher_id && $departmentTeachers->isNotEmpty()) {
                // Pick the teacher with the fewest classes (load balancing)
                $teacher = $departmentTeachers->sortBy(function ($t) {
                    return ClassModel::where('teacher_id', $t->id)->count();
                })->first();

                $class->update(['teacher_id' => $teacher->id]);
            }

            // Check if already enrolled
            $existingEnrollment = Enrollment::where('student_id', $student->id)
                ->where('class_id', $class->id)
                ->first();

            if (!$existingEnrollment) {
                Enrollment::create([
                    'student_id' => $student->id,
                    'class_id' => $class->id,
                    'enrollment_date' => now(),
                    'status' => 'enrolled',
                ]);
                $enrolledCount++;
            }
        }

        return $enrolledCount;
    }

    public function autoEnrollAll()
    {
        // First, fix any existing classes without a teacher assigned
        $this->assignTeachersToOrphanedClasses();

        $students = Student::where('status', 'active')->get();
        $totalEnrolled = 0;

        foreach ($students as $student) {
            $totalEnrolled += $this->autoEnrollStudent($student);
        }

        ActivityLog::log('auto_enroll', "Auto-enrolled all students. Total new enrollments: {$totalEnrolled}");

        return $this->success([
            'students_processed' => $students->count(),
            'total_enrollments' => $totalEnrolled,
        ], 'Auto-enrollment completed');
    }

    /**
     * Assign teachers to classes that have no teacher_id.
     * Picks a teacher from the same department with the fewest classes.
     */
    private function assignTeachersToOrphanedClasses(): void
    {
        $orphanedClasses = ClassModel::whereNull('teacher_id')
            ->with('course')
            ->get();

        foreach ($orphanedClasses as $class) {
            $departmentId = $class->course->department_id ?? null;
            if (!$departmentId) continue;

            $teacher = Teacher::where('department_id', $departmentId)
                ->where('status', 'active')
                ->withCount('classes')
                ->orderBy('classes_count', 'asc')
                ->first();

            if ($teacher) {
                $class->update(['teacher_id' => $teacher->id]);
            }
        }
    }

    public function courses(Student $student)
    {
        $enrollments = $student->enrollments()
            ->with(['class.course', 'class.teacher.user', 'class.schedules', 'latestGrade'])
            ->where('status', 'enrolled')
            ->get();

        return $this->success($enrollments);
    }

    public function grades(Student $student)
    {
        $enrollments = $student->enrollments()
            ->with(['class.course', 'grades' => function ($q) {
                $q->whereNotNull('validated_at');
            }])
            ->get();

        return $this->success($enrollments);
    }

    public function attendance(Student $student)
    {
        $enrollments = $student->enrollments()
            ->with(['class.course', 'attendance'])
            ->get();

        return $this->success($enrollments);
    }

    public function fees(Student $student)
    {
        $fees = $student->fees()
            ->with(['feeType', 'payments'])
            ->get();

        return $this->success([
            'fees' => $fees,
            'summary' => [
                'total' => $fees->sum('amount'),
                'paid' => $fees->sum('paid_amount'),
                'balance' => $fees->sum('balance'),
            ],
        ]);
    }

    // ==================== UNIFIED STUDENT MANAGEMENT (ADDITIVE) ====================

    /**
     * Get complete student profile with all details for admin view
     */
    public function getFullProfile(Student $student)
    {
        $student->load([
            'user',
            'department.faculty',
            'enrollments.class.course.department',
            'enrollments.class.teacher.user',
            'enrollments.class.schedules',
            'fees.feeType',
            'fees.payments',
        ]);

        // Get grades separately for better organization
        $grades = \App\Models\Grade::whereHas('enrollment', function ($q) use ($student) {
            $q->where('student_id', $student->id);
        })->with(['enrollment.class.course'])->get();

        // Calculate statistics
        $totalCredits = $student->enrollments->sum(function ($enrollment) {
            return $enrollment->class->course->credits ?? 0;
        });

        $gradeAverage = $grades->count() > 0 ? $grades->avg('score') : null;

        return $this->success([
            'student' => $student,
            'grades' => $grades,
            'statistics' => [
                'total_courses' => $student->enrollments->count(),
                'total_credits' => $totalCredits,
                'grade_average' => $gradeAverage ? round($gradeAverage, 2) : null,
                'attendance_rate' => $this->calculateAttendanceRate($student),
            ],
        ]);
    }

    /**
     * Calculate attendance rate for a student
     */
    private function calculateAttendanceRate(Student $student): ?float
    {
        $attendance = \App\Models\Attendance::whereHas('enrollment', function ($q) use ($student) {
            $q->where('student_id', $student->id);
        })->get();

        if ($attendance->count() === 0) {
            return null;
        }

        $present = $attendance->where('status', 'present')->count();
        return round(($present / $attendance->count()) * 100, 1);
    }

    /**
     * Get all available courses for a student (for adding new courses)
     */
    public function getAvailableCourses(Student $student)
    {
        // Get courses the student is already enrolled in
        $enrolledCourseIds = $student->enrollments()
            ->with('class')
            ->get()
            ->pluck('class.course_id')
            ->unique();

        // Get all active courses from the student's department OR any department
        $availableCourses = Course::with(['department.faculty'])
            ->where('is_active', true)
            ->whereNotIn('id', $enrolledCourseIds)
            ->orderBy('department_id')
            ->orderBy('level')
            ->orderBy('name')
            ->get();

        return $this->success([
            'available_courses' => $availableCourses,
            'enrolled_count' => $enrolledCourseIds->count(),
        ]);
    }

    /**
     * Manually assign a course to a student (for transfer students)
     */
    public function assignCourse(Request $request, Student $student)
    {
        $request->validate([
            'course_id' => 'required|exists:courses,id',
            'notes' => 'nullable|string|max:500',
        ]);

        $course = Course::findOrFail($request->course_id);

        // Check if already enrolled in this course
        $existingEnrollment = $student->enrollments()
            ->whereHas('class', function ($q) use ($course) {
                $q->where('course_id', $course->id);
            })->first();

        if ($existingEnrollment) {
            return $this->error('Student is already enrolled in this course', 422);
        }

        DB::beginTransaction();
        try {
            // Find or create a class for this course using its defined semester
            $month = (int) date('n');
            $academicYear = $month >= 9 ? date('Y') . '-' . (date('Y') + 1) : (date('Y') - 1) . '-' . date('Y');
            $courseSemester = $course->semester ?? '1';

            $class = ClassModel::firstOrCreate(
                [
                    'course_id' => $course->id,
                    'academic_year' => $academicYear,
                    'semester' => $courseSemester,
                    'section' => 'A',
                ],
                [
                    'room' => 'TBD',
                    'capacity' => 50,
                    'is_active' => true,
                ]
            );

            // Create enrollment
            $enrollment = Enrollment::create([
                'student_id' => $student->id,
                'class_id' => $class->id,
                'enrollment_date' => now(),
                'status' => 'enrolled',
            ]);

            DB::commit();

            ActivityLog::log(
                'course_assigned',
                "Assigned course '{$course->name}' to student {$student->user->full_name}" . 
                ($request->notes ? " - Notes: {$request->notes}" : ''),
                $student
            );

            return $this->success(
                $enrollment->load(['class.course', 'class.teacher.user']),
                "Course '{$course->name}' assigned successfully"
            );
        } catch (\Exception $e) {
            DB::rollBack();
            return $this->error('Failed to assign course: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Remove a course from a student (for transfer students with already completed courses)
     */
    public function removeCourse(Request $request, Student $student, $enrollmentId)
    {
        $enrollment = Enrollment::where('id', $enrollmentId)
            ->where('student_id', $student->id)
            ->with(['class.course'])
            ->first();

        if (!$enrollment) {
            return $this->error('Enrollment not found', 404);
        }

        $courseName = $enrollment->class->course->name;
        $reason = $request->input('reason', 'Course removed by administrator');

        // Soft delete or mark as dropped
        $enrollment->update([
            'status' => 'dropped',
            'drop_date' => now(),
        ]);

        ActivityLog::log(
            'course_removed',
            "Removed course '{$courseName}' from student {$student->user->full_name} - Reason: {$reason}",
            $student
        );

        return $this->success(null, "Course '{$courseName}' removed successfully");
    }

    /**
     * Get student's enrollment history (including dropped courses)
     */
    public function getEnrollmentHistory(Student $student)
    {
        $enrollments = $student->enrollments()
            ->with(['class.course.department', 'class.teacher.user'])
            ->orderBy('created_at', 'desc')
            ->get();

        $grouped = [
            'active' => $enrollments->where('status', 'enrolled'),
            'completed' => $enrollments->where('status', 'completed'),
            'dropped' => $enrollments->where('status', 'dropped'),
        ];

        return $this->success($grouped);
    }

    /**
     * Bulk assign multiple courses to a student
     */
    public function bulkAssignCourses(Request $request, Student $student)
    {
        $request->validate([
            'course_ids' => 'required|array|min:1',
            'course_ids.*' => 'exists:courses,id',
        ]);

        $month = (int) date('n');
        $academicYear = $month >= 9 ? date('Y') . '-' . (date('Y') + 1) : (date('Y') - 1) . '-' . date('Y');
        $assignedCourses = [];
        $skippedCourses = [];

        DB::beginTransaction();
        try {
            foreach ($request->course_ids as $courseId) {
                $course = Course::find($courseId);

                // Check if already enrolled
                $existingEnrollment = $student->enrollments()
                    ->whereHas('class', function ($q) use ($courseId) {
                        $q->where('course_id', $courseId);
                    })->first();

                if ($existingEnrollment) {
                    $skippedCourses[] = $course->name;
                    continue;
                }

                $courseSemester = $course->semester ?? '1';

                // Find or create class
                $class = ClassModel::firstOrCreate(
                    [
                        'course_id' => $courseId,
                        'academic_year' => $academicYear,
                        'semester' => $courseSemester,
                        'section' => 'A',
                    ],
                    [
                        'room' => 'TBD',
                        'capacity' => 50,
                        'is_active' => true,
                    ]
                );

                // Create enrollment
                Enrollment::create([
                    'student_id' => $student->id,
                    'class_id' => $class->id,
                    'enrollment_date' => now(),
                    'status' => 'enrolled',
                ]);

                $assignedCourses[] = $course->name;
            }

            DB::commit();

            ActivityLog::log(
                'bulk_course_assigned',
                "Bulk assigned " . count($assignedCourses) . " courses to student {$student->user->full_name}",
                $student
            );

            return $this->success([
                'assigned' => $assignedCourses,
                'skipped' => $skippedCourses,
            ], count($assignedCourses) . ' courses assigned successfully');
        } catch (\Exception $e) {
            DB::rollBack();
            return $this->error('Failed to assign courses: ' . $e->getMessage(), 500);
        }
    }
}
