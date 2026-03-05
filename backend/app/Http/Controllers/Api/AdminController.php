<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\Grade;
use App\Models\GradeModification;
use App\Models\Enrollment;
use App\Models\Course;
use App\Models\CourseEquivalence;
use App\Models\User;
use App\Models\Payment;
use App\Models\Teacher;
use App\Models\Department;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    // ==================== STUDENT SEARCH & MANAGEMENT ====================

    /**
     * Search students with advanced filters
     */
    public function searchStudents(Request $request)
    {
        $query = Student::with(['user', 'department.faculty']);

        // Search by name, email, or registration number
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('registration_number', 'like', "%{$search}%")
                    ->orWhereHas('user', function ($q) use ($search) {
                        $q->where('first_name', 'like', "%{$search}%")
                            ->orWhere('last_name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                    });
            });
        }

        // Filter by department
        if ($request->has('department_id')) {
            $query->where('department_id', $request->department_id);
        }

        // Filter by level
        if ($request->has('level')) {
            $query->where('level', $request->level);
        }

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by enrollment year
        if ($request->has('enrollment_year')) {
            $query->whereYear('created_at', $request->enrollment_year);
        }

        // Filter by financial status
        if ($request->has('financial_status')) {
            if ($request->financial_status === 'paid') {
                $query->whereDoesntHave('fees', function ($q) {
                    $q->whereRaw('amount > (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE payments.student_id = student_fees.student_id AND status = "completed")');
                });
            } elseif ($request->financial_status === 'unpaid') {
                $query->whereHas('fees', function ($q) {
                    $q->whereRaw('amount > (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE payments.student_id = student_fees.student_id AND status = "completed")');
                });
            }
        }

        $students = $query->paginate($request->per_page ?? 20);

        return response()->json($students);
    }

    /**
     * Get detailed student information
     */
    public function getStudentDetails($id)
    {
        $student = Student::with([
            'user',
            'department.faculty',
            'enrollments.course',
            'grades.course',
            'grades.modifications.modifier',
            'fees',
            'payments',
            'attendance',
            'equivalences.equivalentCourse',
        ])->findOrFail($id);

        // Calculate statistics
        $grades = $student->grades;
        $gradesBySemester = $grades->groupBy('semester')->map(function ($semesterGrades) {
            return [
                'average' => round($semesterGrades->avg('grade'), 2),
                'count' => $semesterGrades->count(),
            ];
        });

        $totalFees = $student->fees->sum('amount');
        $totalPaid = $student->payments->where('status', 'completed')->sum('amount');
        
        $totalAttendance = $student->attendance->count();
        $presentCount = $student->attendance->where('status', 'present')->count();
        $attendanceRate = $totalAttendance > 0 ? round(($presentCount / $totalAttendance) * 100, 1) : 100;

        return response()->json([
            'student' => $student,
            'statistics' => [
                'overall_average' => round($grades->avg('grade') ?? 0, 2),
                'grades_by_semester' => $gradesBySemester,
                'total_credits' => $student->enrollments->sum(fn($e) => $e->course->credits ?? 0),
                'financial' => [
                    'total_fees' => $totalFees,
                    'paid' => $totalPaid,
                    'remaining' => $totalFees - $totalPaid,
                ],
                'attendance_rate' => $attendanceRate,
            ],
        ]);
    }

    // ==================== GRADE MANAGEMENT ====================

    /**
     * Update a student's grade with audit log
     */
    public function updateGrade(Request $request, $gradeId)
    {
        $request->validate([
            'grade' => 'required|numeric|min:0|max:20',
            'reason' => 'required|string|min:10|max:500',
        ]);

        $grade = Grade::findOrFail($gradeId);
        $oldValue = $grade->grade;
        $newValue = $request->grade;

        // Don't update if same value
        if ($oldValue == $newValue) {
            return response()->json([
                'message' => 'La note est déjà à cette valeur',
            ]);
        }

        // Create modification log
        GradeModification::create([
            'grade_id' => $gradeId,
            'modified_by' => $request->user()->id,
            'old_value' => $oldValue,
            'new_value' => $newValue,
            'reason' => $request->reason,
            'ip_address' => $request->ip(),
        ]);

        // Update grade
        $grade->grade = $newValue;
        $grade->save();

        return response()->json([
            'message' => 'Note mise à jour avec succès',
            'grade' => $grade->load('modifications.modifier'),
        ]);
    }

    /**
     * Get grade modification history
     */
    public function getGradeHistory($gradeId)
    {
        $modifications = GradeModification::with('modifier')
            ->where('grade_id', $gradeId)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json(['modifications' => $modifications]);
    }

    // ==================== COURSE MANAGEMENT (Transferred Students) ====================

    /**
     * Get student's enrolled courses
     */
    public function getStudentCourses($studentId)
    {
        $enrollments = Enrollment::with('course')
            ->where('student_id', $studentId)
            ->get();

        $equivalences = CourseEquivalence::with('equivalentCourse')
            ->where('student_id', $studentId)
            ->get();

        return response()->json([
            'enrollments' => $enrollments,
            'equivalences' => $equivalences,
        ]);
    }

    /**
     * Add a course to student's enrollment
     */
    public function addStudentCourse(Request $request, $studentId)
    {
        $request->validate([
            'course_id' => 'required|exists:courses,id',
            'notes' => 'nullable|string',
        ]);

        // Check if already enrolled
        $exists = Enrollment::where('student_id', $studentId)
            ->where('course_id', $request->course_id)
            ->exists();

        if ($exists) {
            return response()->json([
                'error' => 'L\'étudiant est déjà inscrit à ce cours',
            ], 422);
        }

        $enrollment = Enrollment::create([
            'student_id' => $studentId,
            'course_id' => $request->course_id,
            'enrollment_date' => now(),
            'status' => 'active',
        ]);

        return response()->json([
            'message' => 'Cours ajouté avec succès',
            'enrollment' => $enrollment->load('course'),
        ], 201);
    }

    /**
     * Remove a course from student's enrollment
     */
    public function removeStudentCourse(Request $request, $studentId, $courseId)
    {
        $enrollment = Enrollment::where('student_id', $studentId)
            ->where('course_id', $courseId)
            ->firstOrFail();

        $enrollment->delete();

        return response()->json([
            'message' => 'Cours retiré avec succès',
        ]);
    }

    /**
     * Add course equivalence for transferred student
     */
    public function addCourseEquivalence(Request $request, $studentId)
    {
        $request->validate([
            'original_course_name' => 'required|string|max:255',
            'original_institution' => 'required|string|max:255',
            'equivalent_course_id' => 'nullable|exists:courses,id',
            'original_grade' => 'nullable|numeric|min:0|max:20',
            'original_credits' => 'nullable|integer|min:1',
            'notes' => 'nullable|string',
        ]);

        $equivalence = CourseEquivalence::create([
            'student_id' => $studentId,
            'original_course_name' => $request->original_course_name,
            'original_institution' => $request->original_institution,
            'equivalent_course_id' => $request->equivalent_course_id,
            'original_grade' => $request->original_grade,
            'original_credits' => $request->original_credits,
            'status' => 'pending',
            'notes' => $request->notes,
        ]);

        return response()->json([
            'message' => 'Équivalence ajoutée avec succès',
            'equivalence' => $equivalence,
        ], 201);
    }

    /**
     * Review course equivalence
     */
    public function reviewEquivalence(Request $request, $equivalenceId)
    {
        $request->validate([
            'status' => 'required|in:approved,rejected',
            'equivalent_course_id' => 'required_if:status,approved|nullable|exists:courses,id',
            'notes' => 'nullable|string',
        ]);

        $equivalence = CourseEquivalence::findOrFail($equivalenceId);
        
        $equivalence->update([
            'status' => $request->status,
            'equivalent_course_id' => $request->equivalent_course_id,
            'reviewed_by' => $request->user()->id,
            'notes' => $request->notes,
        ]);

        // If approved, auto-enroll in equivalent course
        if ($request->status === 'approved' && $request->equivalent_course_id) {
            Enrollment::firstOrCreate([
                'student_id' => $equivalence->student_id,
                'course_id' => $request->equivalent_course_id,
            ], [
                'enrollment_date' => now(),
                'status' => 'active',
            ]);

            // Create grade if original grade provided
            if ($equivalence->original_grade) {
                Grade::firstOrCreate([
                    'student_id' => $equivalence->student_id,
                    'course_id' => $request->equivalent_course_id,
                ], [
                    'grade' => $equivalence->original_grade,
                    'grade_type' => 'equivalence',
                    'semester' => 'EQ', // Equivalence
                ]);
            }
        }

        return response()->json([
            'message' => 'Équivalence ' . ($request->status === 'approved' ? 'approuvée' : 'rejetée'),
            'equivalence' => $equivalence->load('equivalentCourse'),
        ]);
    }

    // ==================== ANALYTICS ====================

    /**
     * Get institutional KPIs
     */
    public function getKPIs()
    {
        $totalStudents = Student::count();
        $activeStudents = Student::where('status', 'active')->count();
        $totalTeachers = Teacher::count();
        $totalCourses = Course::count();

        // Financial KPIs
        $totalRevenue = Payment::where('status', 'completed')->sum('amount');
        $pendingPayments = Payment::where('status', 'pending')->sum('amount');

        // Academic KPIs
        $averageGrade = Grade::avg('grade');
        $passRate = Grade::where('grade', '>=', 10)->count() / max(Grade::count(), 1) * 100;

        // Enrollment trends (last 5 years)
        $enrollmentTrends = Student::selectRaw('YEAR(created_at) as year, COUNT(*) as count')
            ->groupBy('year')
            ->orderBy('year', 'desc')
            ->limit(5)
            ->get();

        // Department statistics
        $departmentStats = Department::withCount('students')
            ->with(['students.grades'])
            ->get()
            ->map(function ($dept) {
                $grades = $dept->students->flatMap->grades;
                return [
                    'id' => $dept->id,
                    'name' => $dept->name,
                    'student_count' => $dept->students_count,
                    'average_grade' => round($grades->avg('grade') ?? 0, 2),
                    'pass_rate' => $grades->count() > 0 
                        ? round($grades->where('grade', '>=', 10)->count() / $grades->count() * 100, 1)
                        : 0,
                ];
            });

        return response()->json([
            'overview' => [
                'total_students' => $totalStudents,
                'active_students' => $activeStudents,
                'total_teachers' => $totalTeachers,
                'total_courses' => $totalCourses,
            ],
            'financial' => [
                'total_revenue' => $totalRevenue,
                'pending_payments' => $pendingPayments,
                'collection_rate' => $totalRevenue > 0 
                    ? round($totalRevenue / ($totalRevenue + $pendingPayments) * 100, 1)
                    : 0,
            ],
            'academic' => [
                'average_grade' => round($averageGrade ?? 0, 2),
                'pass_rate' => round($passRate, 1),
            ],
            'trends' => [
                'enrollment' => $enrollmentTrends,
            ],
            'departments' => $departmentStats,
        ]);
    }

    /**
     * Get students with alerts (late payments, low grades, etc.)
     */
    public function getStudentAlerts()
    {
        // Students with payment delays
        $paymentDelays = Student::with(['user', 'fees', 'payments'])
            ->whereHas('fees', function ($q) {
                $q->whereRaw('amount > (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE payments.student_id = student_fees.student_id AND status = "completed")');
            })
            ->limit(20)
            ->get()
            ->map(function ($student) {
                $owed = $student->fees->sum('amount') - $student->payments->where('status', 'completed')->sum('amount');
                return [
                    'student' => [
                        'id' => $student->id,
                        'name' => $student->user->first_name . ' ' . $student->user->last_name,
                        'registration_number' => $student->registration_number,
                    ],
                    'amount_owed' => $owed,
                    'type' => 'payment_delay',
                ];
            });

        // Students with low grades
        $lowGrades = Student::with(['user', 'grades'])
            ->get()
            ->filter(function ($student) {
                $avg = $student->grades->avg('grade');
                return $avg !== null && $avg < 10;
            })
            ->map(function ($student) {
                return [
                    'student' => [
                        'id' => $student->id,
                        'name' => $student->user->first_name . ' ' . $student->user->last_name,
                        'registration_number' => $student->registration_number,
                    ],
                    'average' => round($student->grades->avg('grade'), 2),
                    'type' => 'low_grades',
                ];
            })
            ->values()
            ->take(20);

        return response()->json([
            'payment_delays' => $paymentDelays,
            'low_grades' => $lowGrades,
        ]);
    }
}
