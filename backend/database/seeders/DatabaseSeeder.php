<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Faculty;
use App\Models\Department;
use App\Models\Course;
use App\Models\FeeType;
use App\Models\Student;
use App\Models\Teacher;
use App\Models\ClassModel;
use App\Models\Enrollment;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Create default users
        $this->createDefaultUsers();

        // Create faculty and departments
        $faculty = $this->createFacultyAndDepartments();

        // Create courses
        $this->createCourses($faculty);

        // Create fee types
        $this->createFeeTypes();

        // Create sample students and teachers
        $this->createSampleStudentsAndTeachers($faculty);
    }

    private function createDefaultUsers(): void
    {
        // Admin
        User::create([
            'username' => 'admin',
            'email' => 'admin@esl.local',
            'password' => Hash::make('admin123'),
            'first_name' => 'System',
            'last_name' => 'Administrator',
            'role' => 'admin',
            'phone' => '+241 01 23 45 67',
            'is_active' => true,
        ]);

        // Finance
        User::create([
            'username' => 'finance1',
            'email' => 'finance1@esl.local',
            'password' => Hash::make('password123'),
            'first_name' => 'Marie',
            'last_name' => 'Finance',
            'role' => 'finance',
            'phone' => '+241 01 23 45 68',
            'is_active' => true,
        ]);

        // Registrar
        User::create([
            'username' => 'registrar1',
            'email' => 'registrar1@esl.local',
            'password' => Hash::make('password123'),
            'first_name' => 'Jean',
            'last_name' => 'Registrar',
            'role' => 'registrar',
            'phone' => '+241 01 23 45 69',
            'is_active' => true,
        ]);
    }

    private function createFacultyAndDepartments(): Faculty
    {
        $faculty = Faculty::create([
            'name' => 'Faculty of Sciences',
            'code' => 'FSCI',
            'description' => 'Faculty of Sciences offering Biology and Immunology programs',
            'dean_name' => 'Prof. Emmanuel Ndong',
            'is_active' => true,
        ]);

        Department::create([
            'faculty_id' => $faculty->id,
            'name' => 'Biology',
            'code' => 'BIO',
            'description' => 'Department of Biology - Study of living organisms',
            'head_name' => 'Dr. Pascale Mbou',
            'is_active' => true,
        ]);

        Department::create([
            'faculty_id' => $faculty->id,
            'name' => 'Immunology',
            'code' => 'IMM',
            'description' => 'Department of Immunology - Study of immune systems',
            'head_name' => 'Dr. Claude Ondo',
            'is_active' => true,
        ]);

        return $faculty;
    }

    private function createCourses(Faculty $faculty): void
    {
        $biologyDept = Department::where('code', 'BIO')->first();
        $immunologyDept = Department::where('code', 'IMM')->first();

        // Biology L1 courses
        $bioL1 = [
            ['code' => 'BIO101', 'name' => 'General Biology', 'credits' => 15],
            ['code' => 'BIO102', 'name' => 'Cell Biology I', 'credits' => 15],
            ['code' => 'CHM101', 'name' => 'General Chemistry', 'credits' => 15],
            ['code' => 'MTH101', 'name' => 'Mathematics Applied to Biological Sciences', 'credits' => 15],
            ['code' => 'PHY101', 'name' => 'Physics for Biologists', 'credits' => 10],
            ['code' => 'MTH102', 'name' => 'University Work Methodology', 'credits' => 10],
            ['code' => 'INF101', 'name' => 'Basic Computer Science', 'credits' => 10],
            ['code' => 'ENG101', 'name' => 'Scientific English', 'credits' => 10],
        ];

        // Biology L2 courses
        $bioL2 = [
            ['code' => 'BIO201', 'name' => 'Cell Biology II', 'credits' => 15],
            ['code' => 'BIO202', 'name' => 'General Genetics', 'credits' => 15],
            ['code' => 'BCH201', 'name' => 'Biochemistry I', 'credits' => 15],
            ['code' => 'MIC201', 'name' => 'General Microbiology', 'credits' => 15],
            ['code' => 'STA201', 'name' => 'Statistics Applied to Biology', 'credits' => 10],
            ['code' => 'BIO203', 'name' => 'Animal Physiology', 'credits' => 15],
            ['code' => 'BIO204', 'name' => 'Plant Physiology', 'credits' => 15],
            ['code' => 'BIO205', 'name' => 'Laboratory Techniques', 'credits' => 10],
        ];

        // Biology L3 courses
        $bioL3 = [
            ['code' => 'BIO301', 'name' => 'Molecular Genetics', 'credits' => 20],
            ['code' => 'BIO302', 'name' => 'Molecular Biology', 'credits' => 20],
            ['code' => 'BCH301', 'name' => 'Biochemistry II', 'credits' => 15],
            ['code' => 'ECO301', 'name' => 'General Ecology', 'credits' => 15],
            ['code' => 'BIO303', 'name' => 'Evolution and Biodiversity', 'credits' => 15],
            ['code' => 'BIO304', 'name' => 'Biotechnology', 'credits' => 15],
            ['code' => 'BIO399', 'name' => 'End of Cycle Project (Thesis)', 'credits' => 20],
        ];

        // Immunology L1 courses
        $immL1 = [
            ['code' => 'IMM-BIO101', 'name' => 'General Biology', 'credits' => 15],
            ['code' => 'IMM-BIO102', 'name' => 'Cell Biology', 'credits' => 15],
            ['code' => 'IMM-CHM101', 'name' => 'General Chemistry', 'credits' => 15],
            ['code' => 'IMM-MTH101', 'name' => 'Applied Mathematics', 'credits' => 15],
            ['code' => 'IMM-BCH101', 'name' => 'Basic Biochemistry', 'credits' => 10],
            ['code' => 'IMM-INF101', 'name' => 'Computer Science', 'credits' => 10],
            ['code' => 'IMM-ENG101', 'name' => 'Scientific English', 'credits' => 10],
        ];

        // Immunology L2 courses
        $immL2 = [
            ['code' => 'IMM201', 'name' => 'Fundamental Immunology', 'credits' => 20],
            ['code' => 'IMM-BIO201', 'name' => 'Genetics', 'credits' => 15],
            ['code' => 'IMM-MIC201', 'name' => 'Medical Microbiology', 'credits' => 15],
            ['code' => 'IMM-BCH201', 'name' => 'Biochemistry', 'credits' => 15],
            ['code' => 'IMM-PHY201', 'name' => 'Human Physiology', 'credits' => 15],
            ['code' => 'IMM-LAB201', 'name' => 'Biomedical Analysis Methods', 'credits' => 10],
            ['code' => 'IMM-STA201', 'name' => 'Biomedical Statistics', 'credits' => 10],
        ];

        // Immunology L3 courses
        $immL3 = [
            ['code' => 'IMM301', 'name' => 'Cellular and Molecular Immunology', 'credits' => 20],
            ['code' => 'IMM302', 'name' => 'Immunopathology', 'credits' => 15],
            ['code' => 'VIR301', 'name' => 'Virology', 'credits' => 15],
            ['code' => 'PAR301', 'name' => 'Parasitology', 'credits' => 15],
            ['code' => 'IMM303', 'name' => 'Clinical Immunology', 'credits' => 15],
            ['code' => 'IMM304', 'name' => 'Vaccinology', 'credits' => 10],
            ['code' => 'IMM-LAB301', 'name' => 'Advanced Laboratory Techniques', 'credits' => 10],
            ['code' => 'IMM399', 'name' => 'End of Cycle Project (Thesis)', 'credits' => 20],
        ];

        // Create Biology courses
        foreach ($bioL1 as $course) {
            Course::create([
                'department_id' => $biologyDept->id,
                'code' => $course['code'],
                'name' => $course['name'],
                'credits' => $course['credits'],
                'level' => 'L1',
                'hours_per_week' => 3,
                'is_active' => true,
            ]);
        }

        foreach ($bioL2 as $course) {
            Course::create([
                'department_id' => $biologyDept->id,
                'code' => $course['code'],
                'name' => $course['name'],
                'credits' => $course['credits'],
                'level' => 'L2',
                'hours_per_week' => 3,
                'is_active' => true,
            ]);
        }

        foreach ($bioL3 as $course) {
            Course::create([
                'department_id' => $biologyDept->id,
                'code' => $course['code'],
                'name' => $course['name'],
                'credits' => $course['credits'],
                'level' => 'L3',
                'hours_per_week' => 3,
                'is_active' => true,
            ]);
        }

        // Create Immunology courses
        foreach ($immL1 as $course) {
            Course::create([
                'department_id' => $immunologyDept->id,
                'code' => $course['code'],
                'name' => $course['name'],
                'credits' => $course['credits'],
                'level' => 'L1',
                'hours_per_week' => 3,
                'is_active' => true,
            ]);
        }

        foreach ($immL2 as $course) {
            Course::create([
                'department_id' => $immunologyDept->id,
                'code' => $course['code'],
                'name' => $course['name'],
                'credits' => $course['credits'],
                'level' => 'L2',
                'hours_per_week' => 3,
                'is_active' => true,
            ]);
        }

        foreach ($immL3 as $course) {
            Course::create([
                'department_id' => $immunologyDept->id,
                'code' => $course['code'],
                'name' => $course['name'],
                'credits' => $course['credits'],
                'level' => 'L3',
                'hours_per_week' => 3,
                'is_active' => true,
            ]);
        }
    }

    private function createFeeTypes(): void
    {
        FeeType::create([
            'name' => 'Tuition Fee',
            'description' => 'Annual tuition fee',
            'amount' => 500000,
            'is_mandatory' => true,
            'is_active' => true,
        ]);

        FeeType::create([
            'name' => 'Registration Fee',
            'description' => 'One-time registration fee',
            'amount' => 50000,
            'is_mandatory' => true,
            'is_active' => true,
        ]);

        FeeType::create([
            'name' => 'Laboratory Fee',
            'description' => 'Laboratory equipment and materials',
            'amount' => 75000,
            'is_mandatory' => true,
            'is_active' => true,
        ]);

        FeeType::create([
            'name' => 'Library Fee',
            'description' => 'Library access and resources',
            'amount' => 25000,
            'is_mandatory' => false,
            'is_active' => true,
        ]);

        FeeType::create([
            'name' => 'Sports Fee',
            'description' => 'Sports facilities access',
            'amount' => 15000,
            'is_mandatory' => false,
            'is_active' => true,
        ]);
    }

    private function createSampleStudentsAndTeachers(Faculty $faculty): void
    {
        $biologyDept = Department::where('code', 'BIO')->first();
        $immunologyDept = Department::where('code', 'IMM')->first();
        
        $faker = \Faker\Factory::create('fr_FR');
        $academicYear = '2025-2026';
        $semester = '1';

        // ==================== CREATE TEACHERS ====================
        $teachers = [];
        
        for ($i = 0; $i < 15; $i++) {
            $dept = $i % 2 === 0 ? $biologyDept : $immunologyDept;
            
            $teacherUser = User::create([
                'username' => "teacher_" . ($i + 1),
                'email' => "teacher{$i}@unilak.ac.ke",
                'password' => Hash::make('password'),
                'first_name' => $faker->firstName('male'),
                'last_name' => $faker->lastName(),
                'role' => 'teacher',
                'phone' => $faker->phoneNumber(),
                'gender' => 'male',
                'is_active' => true,
            ]);

            $teacher = Teacher::create([
                'user_id' => $teacherUser->id,
                'department_id' => $dept->id,
                'employee_id' => 'EMP-' . str_pad($i + 1, 5, '0', STR_PAD_LEFT),
                'qualification' => $faker->randomElement(['Master', 'PhD', 'Bachelor']),
                'specialization' => $faker->word(),
                'hire_date' => $faker->dateTimeBetween('-10 years')->format('Y-m-d'),
                'salary' => rand(500000, 1500000),
                'status' => 'active',
            ]);
            
            $teachers[] = $teacher;
        }

        // ==================== CREATE STUDENTS ====================
        $bioL1Courses = Course::where('department_id', $biologyDept->id)
            ->where('level', 'L1')
            ->limit(5)
            ->get();

        $immL1Courses = Course::where('department_id', $immunologyDept->id)
            ->where('level', 'L1')
            ->limit(5)
            ->get();
        
        // Create 40 students
        for ($i = 0; $i < 40; $i++) {
            $dept = $i % 2 === 0 ? $biologyDept : $immunologyDept;
            $courses = $i % 2 === 0 ? $bioL1Courses : $immL1Courses;
            
            $studentUser = User::create([
                'username' => "student_" . ($i + 1),
                'email' => "student{$i}@unilak.ac.ke",
                'password' => Hash::make('password'),
                'first_name' => $faker->firstName(),
                'last_name' => $faker->lastName(),
                'role' => 'student',
                'phone' => $faker->phoneNumber(),
                'gender' => $faker->randomElement(['male', 'female']),
                'date_of_birth' => $faker->dateTimeBetween('-25 years', '-18 years')->format('Y-m-d'),
                'is_active' => true,
            ]);

            $student = Student::create([
                'user_id' => $studentUser->id,
                'department_id' => $dept->id,
                'student_id' => 'STU-' . str_pad($i + 1, 5, '0', STR_PAD_LEFT),
                'level' => 'L1',
                'enrollment_date' => now()->subDays(rand(1, 30)),
                'guardian_name' => $faker->name(),
                'guardian_phone' => $faker->phoneNumber(),
                'status' => 'active',
            ]);

            // Auto-enroll in 5 courses with automatic class creation if needed
            foreach ($courses as $course) {
                // Find or create class for this course
                $class = ClassModel::where('course_id', $course->id)
                    ->where('academic_year', $academicYear)
                    ->where('semester', $semester)
                    ->first();
                
                if (!$class) {
                    $randomTeacher = $teachers[array_rand($teachers)];
                    $class = ClassModel::create([
                        'course_id' => $course->id,
                        'teacher_id' => $randomTeacher->id,
                        'section' => chr(65 + rand(0, 2)), // A, B, C
                        'room' => 'Room ' . rand(101, 210),
                        'capacity' => 50,
                        'academic_year' => $academicYear,
                        'semester' => $semester,
                        'is_active' => true,
                    ]);
                }

                // Check if already enrolled
                $alreadyEnrolled = Enrollment::where('student_id', $student->id)
                    ->where('class_id', $class->id)
                    ->exists();

                if (!$alreadyEnrolled) {
                    Enrollment::create([
                        'student_id' => $student->id,
                        'class_id' => $class->id,
                        'enrollment_date' => now(),
                        'status' => 'enrolled',
                    ]);
                }
            }
        }
    }
}
