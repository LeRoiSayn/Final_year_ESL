<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\Teacher;
use App\Models\Course;
use App\Models\Department;
use App\Models\Faculty;
use App\Models\Enrollment;
use App\Models\Payment;
use App\Models\StudentFee;
use App\Models\ClassModel;
use App\Models\Attendance;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function adminStats()
    {
        // 7 COUNTs → 2 queries using conditional aggregation (PostgreSQL FILTER syntax)
        $studentRow = DB::selectOne("
            SELECT COUNT(*) AS total,
                   COUNT(*) FILTER (WHERE status = 'active') AS active
            FROM students
        ");
        $teacherRow = DB::selectOne("
            SELECT COUNT(*) AS total,
                   COUNT(*) FILTER (WHERE status = 'active') AS active
            FROM teachers
        ");
        $miscRow = DB::selectOne("
            SELECT
                (SELECT COUNT(*) FROM courses)     AS total_courses,
                (SELECT COUNT(*) FROM departments) AS total_departments,
                (SELECT COUNT(*) FROM faculties)   AS total_faculties
        ");

        $stats = [
            'total_students'    => (int) ($studentRow->total    ?? 0),
            'active_students'   => (int) ($studentRow->active   ?? 0),
            'total_teachers'    => (int) ($teacherRow->total    ?? 0),
            'active_teachers'   => (int) ($teacherRow->active   ?? 0),
            'total_courses'     => (int) ($miscRow->total_courses     ?? 0),
            'total_departments' => (int) ($miscRow->total_departments ?? 0),
            'total_faculties'   => (int) ($miscRow->total_faculties   ?? 0),
        ];

        // Enrollment trends (last 6 months)
        $enrollmentTrends = Student::selectRaw("TO_CHAR(enrollment_date, 'YYYY-MM') as month, COUNT(*) as count")
            ->where('enrollment_date', '>=', now()->subMonths(6))
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        // Students by department
        $studentsByDepartment = Department::withCount('students')
            ->where('is_active', true)
            ->get()
            ->map(fn($d) => ['name' => $d->name, 'count' => $d->students_count]);

        // Students by level
        $studentsByLevel = Student::selectRaw('level, COUNT(*) as count')
            ->groupBy('level')
            ->get();

        // Recent students
        $recentStudents = Student::with(['user', 'department'])
            ->latest()
            ->take(5)
            ->get();

        return $this->success([
            'stats' => $stats,
            'enrollment_trends' => $enrollmentTrends,
            'students_by_department' => $studentsByDepartment,
            'students_by_level' => $studentsByLevel,
            'recent_students' => $recentStudents,
        ]);
    }

    public function studentStats(Request $request)
    {
        $student = $request->user()->student;

        if (!$student) {
            return $this->error('Student profile not found', 404);
        }

        $enrollments = $student->enrollments()
            ->with(['class.course', 'class.teacher.user'])
            ->where('status', 'enrolled')
            ->get();

        $attendanceRate = $student->attendance_rate;

        $fees = $student->fees()
            ->with('feeType')
            ->get();

        $pendingFees = $fees->where('status', '!=', 'paid')->sum('balance');

        $nextFee = $fees->where('status', '!=', 'paid')
            ->filter(fn($f) => $f->due_date !== null)
            ->sortBy('due_date')
            ->first();
        $daysUntilDue = $nextFee
            ? (int) now()->startOfDay()->diffInDays($nextFee->due_date->startOfDay(), false)
            : null;

        return $this->success([
            'enrolled_courses' => $enrollments->count(),
            'attendance_rate' => $attendanceRate,
            'pending_fees' => $pendingFees,
            'total_credits' => $enrollments->sum(fn($e) => $e->class->course->credits ?? 0),
            'courses' => $enrollments,
            'fees_summary' => [
                'total' => $fees->sum('amount'),
                'paid' => $fees->sum('paid_amount'),
                'pending' => $pendingFees,
                'next_due_date' => $nextFee?->due_date?->toDateString(),
                'days_until_due' => $daysUntilDue,
            ],
        ]);
    }

    public function teacherStats(Request $request)
    {
        $teacher = $request->user()->teacher;

        if (!$teacher) {
            return $this->error('Teacher profile not found', 404);
        }

        $classes = $teacher->classes()
            ->with(['course', 'enrollments'])
            ->where('is_active', true)
            ->get();

        $totalStudents = $classes->sum(fn($c) => $c->enrollments->where('status', 'enrolled')->count());

        return $this->success([
            'total_classes' => $classes->count(),
            'total_students' => $totalStudents,
            'classes' => $classes,
        ]);
    }

    public function financeStats()
    {
        // 4 separate SUM queries → 1 query with conditional aggregation
        $payRow = DB::selectOne("
            SELECT
                COALESCE(SUM(amount), 0)                                                              AS total_revenue,
                COALESCE(SUM(amount) FILTER (WHERE payment_date::date = CURRENT_DATE), 0)             AS today_collection,
                COALESCE(SUM(amount) FILTER (
                    WHERE DATE_TRUNC('month', payment_date) = DATE_TRUNC('month', NOW())
                ), 0)                                                                                  AS monthly_revenue
            FROM payments
        ");

        $pendingFees = StudentFee::where('status', '!=', 'paid')
            ->sum(DB::raw('amount - paid_amount'));

        // Revenue by fee type
        $revenueByType = DB::table('payments')
            ->join('student_fees', 'payments.student_fee_id', '=', 'student_fees.id')
            ->join('fee_types', 'student_fees.fee_type_id', '=', 'fee_types.id')
            ->selectRaw('fee_types.name, SUM(payments.amount) as total')
            ->groupBy('fee_types.id', 'fee_types.name')
            ->get();

        // Monthly trends
        $monthlyTrends = Payment::selectRaw("TO_CHAR(payment_date, 'YYYY-MM') as month, SUM(amount) as total")
            ->where('payment_date', '>=', now()->subMonths(6))
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        // Recent payments
        $recentPayments = Payment::with(['studentFee.student.user', 'studentFee.feeType', 'receivedBy'])
            ->latest()
            ->take(10)
            ->get();

        return $this->success([
            'total_revenue'   => (float) ($payRow->total_revenue   ?? 0),
            'pending_fees'    => (float) $pendingFees,
            'today_collection'=> (float) ($payRow->today_collection ?? 0),
            'monthly_revenue' => (float) ($payRow->monthly_revenue  ?? 0),
            // legacy aliases kept for frontend compatibility
            'today_payments'  => (float) ($payRow->today_collection ?? 0),
            'revenue_by_type' => $revenueByType,
            'monthly_trends'  => $monthlyTrends,
            'recent_payments' => $recentPayments,
        ]);
    }

    public function registrarStats()
    {
        // 4 separate COUNTs → 1 query
        $row = DB::selectOne("
            SELECT
                COUNT(*)                                                              AS total_students,
                COUNT(*) FILTER (WHERE status = 'active')                            AS active_students,
                COUNT(*) FILTER (
                    WHERE DATE_TRUNC('month', enrollment_date) = DATE_TRUNC('month', NOW())
                )                                                                     AS new_this_month
            FROM students
        ");
        $totalTeachers = Teacher::count();

        $stats = [
            'total_students'  => (int) ($row->total_students  ?? 0),
            'active_students' => (int) ($row->active_students ?? 0),
            'new_this_month'  => (int) ($row->new_this_month  ?? 0),
            'total_teachers'  => (int) $totalTeachers,
        ];

        // Students by level
        $studentsByLevel = Student::selectRaw('level, COUNT(*) as count')
            ->groupBy('level')
            ->get();

        // Recent registrations
        $recentStudents = Student::with(['user', 'department'])
            ->latest()
            ->take(10)
            ->get();

        return $this->success([
            'stats' => $stats,
            'students_by_level' => $studentsByLevel,
            'recent_students' => $recentStudents,
        ]);
    }
}
