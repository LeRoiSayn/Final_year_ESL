<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\FacultyController;
use App\Http\Controllers\Api\DepartmentController;
use App\Http\Controllers\Api\StudentController;
use App\Http\Controllers\Api\TeacherController;
use App\Http\Controllers\Api\CourseController;
use App\Http\Controllers\Api\ClassController;
use App\Http\Controllers\Api\EnrollmentController;
use App\Http\Controllers\Api\GradeController;
use App\Http\Controllers\Api\AttendanceController;
use App\Http\Controllers\Api\FeeTypeController;
use App\Http\Controllers\Api\StudentFeeController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\ScheduleController;
use App\Http\Controllers\Api\AnnouncementController;
use App\Http\Controllers\Api\ActivityLogController;
use App\Http\Controllers\Api\ChatbotController;
use App\Http\Controllers\Api\ELearningController;
use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\SettingsController;
use App\Http\Controllers\Api\NotificationController;

// Public routes
Route::post('/login', [AuthController::class, 'login']);
// Public settings (lightweight) for anonymous visitors
Route::get('/settings/public', [SettingsController::class, 'publicSettings']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::put('/profile', [AuthController::class, 'updateProfile']);
    Route::put('/change-password', [AuthController::class, 'changePassword']);

    // Dashboard
    Route::prefix('dashboard')->group(function () {
        Route::get('/admin', [DashboardController::class, 'adminStats']);
        Route::get('/student', [DashboardController::class, 'studentStats']);
        Route::get('/teacher', [DashboardController::class, 'teacherStats']);
        Route::get('/finance', [DashboardController::class, 'financeStats']);
        Route::get('/registrar', [DashboardController::class, 'registrarStats']);
    });

    // Faculties
    Route::apiResource('faculties', FacultyController::class);
    Route::post('/faculties/{faculty}/toggle', [FacultyController::class, 'toggle']);

    // Departments
    Route::apiResource('departments', DepartmentController::class);
    Route::post('/departments/{department}/toggle', [DepartmentController::class, 'toggle']);

    // Students
    Route::apiResource('students', StudentController::class);
    Route::post('/students/{student}/auto-enroll', [StudentController::class, 'autoEnroll']);
    Route::post('/students/auto-enroll-all', [StudentController::class, 'autoEnrollAll']);
    Route::get('/students/{student}/courses', [StudentController::class, 'courses']);
    Route::get('/students/{student}/grades', [StudentController::class, 'grades']);
    Route::get('/students/{student}/attendance', [StudentController::class, 'attendance']);
    Route::get('/students/{student}/fees', [StudentController::class, 'fees']);

    // Teachers
    Route::apiResource('teachers', TeacherController::class);
    Route::get('/teachers/{teacher}/classes', [TeacherController::class, 'classes']);
    Route::get('/teachers/{teacher}/students', [TeacherController::class, 'students']);

    // Courses
    Route::apiResource('courses', CourseController::class);
    Route::post('/courses/{course}/toggle', [CourseController::class, 'toggle']);

    // Classes
    Route::apiResource('classes', ClassController::class);
    Route::get('/classes/{class}/students', [ClassController::class, 'students']);
    Route::post('/classes/{class}/assign-teacher', [ClassController::class, 'assignTeacher']);

    // Enrollments
    Route::apiResource('enrollments', EnrollmentController::class);
    Route::put('/enrollments/{enrollment}/status', [EnrollmentController::class, 'updateStatus']);

    // Grades
    Route::apiResource('grades', GradeController::class);
    Route::get('/grades/class/{classId}', [GradeController::class, 'byClass']);
    Route::post('/grades/bulk', [GradeController::class, 'bulkUpdate']);
    Route::post('/grades/submit-class/{classId}', [GradeController::class, 'submitToAdmin']);

    // Attendance
    Route::apiResource('attendance', AttendanceController::class);
    Route::get('/attendance/class/{classId}', [AttendanceController::class, 'byClass']);
    Route::post('/attendance/bulk', [AttendanceController::class, 'bulkMark']);
    Route::get('/attendance/class/{classId}/statistics', [AttendanceController::class, 'statistics']);

    // Fee Types
    Route::apiResource('fee-types', FeeTypeController::class);
    Route::post('/fee-types/{feeType}/toggle', [FeeTypeController::class, 'toggle']);

    // Student Fees
    Route::apiResource('student-fees', StudentFeeController::class);
    Route::get('/student-fees/student/{studentId}', [StudentFeeController::class, 'byStudent']);
    Route::post('/student-fees/assign-all', [StudentFeeController::class, 'assignToAll']);

    // Payments (Old)
    Route::apiResource('payments', PaymentController::class)->except(['update']);
    Route::get('/payments/{payment}/receipt', [PaymentController::class, 'receipt']);
    Route::get('/payments-today', [PaymentController::class, 'todayCollection']);

    // Schedules
    Route::apiResource('schedules', ScheduleController::class);
    Route::get('/schedules/student/{studentId}', [ScheduleController::class, 'byStudent']);
    Route::get('/schedules/teacher/{teacherId}', [ScheduleController::class, 'byTeacher']);

    // Announcements
    Route::apiResource('announcements', AnnouncementController::class);
    Route::get('/announcements-active', [AnnouncementController::class, 'active']);

    // Activity Logs
    Route::get('/activity-logs', [ActivityLogController::class, 'index']);
    Route::get('/activity-logs/actions', [ActivityLogController::class, 'actions']);
    Route::get('/activity-logs/{activityLog}', [ActivityLogController::class, 'show']);

    // ==================== NEW FEATURES ====================

    // Notifications (role-based)
    Route::get('/notifications', [NotificationController::class, 'index']);

    // Chatbot AI with role-based access
    Route::prefix('chatbot')->group(function () {
        Route::post('/', [ChatbotController::class, 'chat']);
        Route::get('/history', [ChatbotController::class, 'getHistory']);
        Route::get('/search-student', [ChatbotController::class, 'searchStudent']); // Admin only
        Route::get('/student/{id}', [ChatbotController::class, 'getStudentDetails']); // Admin only
    });

    // E-Learning Platform
    Route::prefix('elearning')->group(function () {
        // Teacher's classes/courses
        Route::get('/teacher/classes', [ELearningController::class, 'getTeacherClasses']);

        // Online Courses
        Route::get('/courses/teacher', [ELearningController::class, 'getTeacherCourses']);
        Route::get('/courses/student', [ELearningController::class, 'getStudentCourses']);
        Route::post('/courses', [ELearningController::class, 'createOnlineCourse']);
        Route::post('/courses/{id}/join', [ELearningController::class, 'joinOnlineCourse']);
        Route::post('/courses/{id}/leave', [ELearningController::class, 'leaveOnlineCourse']);
        Route::post('/courses/{id}/start', [ELearningController::class, 'startOnlineCourse']);
        Route::put('/courses/{id}', [ELearningController::class, 'updateOnlineCourse']);

        // Course Materials
        Route::post('/materials', [ELearningController::class, 'uploadMaterial']);
        Route::get('/materials/course/{courseId}', [ELearningController::class, 'getCourseMaterials']);
        Route::get('/materials/{id}/download', [ELearningController::class, 'downloadMaterial']);
        Route::delete('/materials/{id}', [ELearningController::class, 'deleteMaterial']);

        // Quizzes
        Route::post('/quizzes', [ELearningController::class, 'createQuiz']);
        Route::get('/quizzes/course/{courseId}', [ELearningController::class, 'getCourseQuizzes']);
        Route::post('/quizzes/{id}/start', [ELearningController::class, 'startQuiz']);
        Route::post('/quizzes/{id}/publish', [ELearningController::class, 'publishQuiz']);
        Route::get('/quizzes/{id}/results', [ELearningController::class, 'getQuizResults']);
        Route::delete('/quizzes/{id}', [ELearningController::class, 'deleteQuiz']);
        Route::post('/quizzes/attempt/{attemptId}/submit', [ELearningController::class, 'submitQuiz']);
        Route::post('/quizzes/attempt/{attemptId}/tab-switch', [ELearningController::class, 'reportTabSwitch']);

        // Assignments
        Route::post('/assignments', [ELearningController::class, 'createAssignment']);
        Route::get('/assignments/course/{courseId}', [ELearningController::class, 'getCourseAssignments']);
        Route::post('/assignments/{id}/submit', [ELearningController::class, 'submitAssignment']);
        Route::post('/assignments/{id}/publish', [ELearningController::class, 'publishAssignment']);
        Route::get('/assignments/{id}/submissions', [ELearningController::class, 'getAssignmentSubmissions']);
        Route::delete('/assignments/{id}', [ELearningController::class, 'deleteAssignment']);
        Route::post('/assignments/submission/{submissionId}/grade', [ELearningController::class, 'gradeSubmission']);
        Route::get('/assignments/submission/{submissionId}/download', [ELearningController::class, 'downloadSubmission']);
    });

    // Admin Management
    Route::prefix('admin')->middleware('role:admin')->group(function () {
        // Student Search & Management
        Route::get('/students/search', [AdminController::class, 'searchStudents']);
        Route::get('/students/{id}/details', [AdminController::class, 'getStudentDetails']);
        
        // Grade Management
        Route::get('/grades/overview', [GradeController::class, 'adminOverview']);
        Route::post('/grades/validate-class/{classId}', [GradeController::class, 'validateClass']);
        Route::post('/grades/reject-class/{classId}', [GradeController::class, 'rejectClass']);
        Route::put('/grades/{gradeId}', [AdminController::class, 'updateGrade']);
        Route::get('/grades/{gradeId}/history', [AdminController::class, 'getGradeHistory']);
        
        // Course Management for Students
        Route::get('/students/{studentId}/courses', [AdminController::class, 'getStudentCourses']);
        Route::post('/students/{studentId}/courses', [AdminController::class, 'addStudentCourse']);
        Route::delete('/students/{studentId}/courses/{courseId}', [AdminController::class, 'removeStudentCourse']);
        
        // Course Equivalences
        Route::post('/students/{studentId}/equivalences', [AdminController::class, 'addCourseEquivalence']);
        Route::put('/equivalences/{equivalenceId}/review', [AdminController::class, 'reviewEquivalence']);
        
        // Analytics
        Route::get('/kpis', [AdminController::class, 'getKPIs']);
        Route::get('/alerts', [AdminController::class, 'getStudentAlerts']);
    });

    // Online Payments
    Route::prefix('payment')->group(function () {
        Route::get('/summary', [PaymentController::class, 'getFeeSummary']);
        Route::get('/history', [PaymentController::class, 'getPaymentHistory']);
        Route::post('/initialize', [PaymentController::class, 'initializePayment']);
        Route::get('/status/{reference}', [PaymentController::class, 'checkPaymentStatus']);
        Route::get('/receipt/{paymentId}', [PaymentController::class, 'downloadReceipt']);
    });

    // User Settings & Personalization
    Route::prefix('settings')->group(function () {
        Route::get('/', [SettingsController::class, 'getSettings']);
        Route::put('/', [SettingsController::class, 'updateSettings']);
        Route::post('/reset', [SettingsController::class, 'resetSettings']);
        Route::get('/widgets', [SettingsController::class, 'getAvailableWidgets']);
    });
});

// Payment Webhook (for external payment providers)
Route::post('/payment/webhook', [PaymentController::class, 'confirmPayment']);

// ==================== UNIFIED MANAGEMENT MODULES (ADDITIVE) ====================

Route::middleware('auth:sanctum')->group(function () {
    
    // Unified Student Management (Admin)
    Route::prefix('student-management')->group(function () {
        // Full profile view with all details
        Route::get('/{student}/profile', [StudentController::class, 'getFullProfile']);
        
        // Course management for students (transfer students use case)
        Route::get('/{student}/available-courses', [StudentController::class, 'getAvailableCourses']);
        Route::get('/{student}/enrollment-history', [StudentController::class, 'getEnrollmentHistory']);
        Route::post('/{student}/assign-course', [StudentController::class, 'assignCourse']);
        Route::post('/{student}/bulk-assign-courses', [StudentController::class, 'bulkAssignCourses']);
        Route::delete('/{student}/remove-course/{enrollmentId}', [StudentController::class, 'removeCourse']);
    });

    // Unified Teacher Management (Admin)
    Route::prefix('teacher-management')->group(function () {
        // Full profile view with all details
        Route::get('/{teacher}/profile', [TeacherController::class, 'getFullProfile']);
        
        // Course assignment management (Admin controlled)
        Route::get('/{teacher}/available-courses', [TeacherController::class, 'getAvailableCourses']);
        Route::get('/{teacher}/assigned-courses', [TeacherController::class, 'getAssignedCourses']);
        Route::get('/{teacher}/workload', [TeacherController::class, 'getWorkload']);
        Route::post('/{teacher}/assign-course', [TeacherController::class, 'assignCourse']);
        Route::post('/{teacher}/bulk-assign-courses', [TeacherController::class, 'bulkAssignCourses']);
        Route::delete('/{teacher}/remove-course/{classId}', [TeacherController::class, 'removeCourse']);
    });
});
