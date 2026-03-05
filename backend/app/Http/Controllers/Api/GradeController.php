<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Grade;
use App\Models\Enrollment;
use App\Models\ActivityLog;
use Illuminate\Http\Request;

class GradeController extends Controller
{
    public function index(Request $request)
    {
        $query = Grade::with(['enrollment.student.user', 'enrollment.class.course', 'gradedBy']);

        if ($request->has('enrollment_id')) {
            $query->where('enrollment_id', $request->enrollment_id);
        }

        if ($request->has('class_id')) {
            $query->whereHas('enrollment', function ($q) use ($request) {
                $q->where('class_id', $request->class_id);
            });
        }

        $grades = $query->orderBy('created_at', 'desc')->paginate($request->per_page ?? 15);

        return $this->success($grades);
    }

    public function store(Request $request)
    {
        $request->validate([
            'enrollment_id' => 'required|exists:enrollments,id',
            'continuous_assessment' => 'nullable|numeric|min:0|max:100',
            'exam_score' => 'nullable|numeric|min:0|max:100',
            'remarks' => 'nullable|string',
        ]);

        $ca = $request->continuous_assessment ?? 0;
        $exam = $request->exam_score ?? 0;
        $finalGrade = Grade::calculateFinalGrade($ca, $exam);
        $letterGrade = Grade::calculateLetterGrade($finalGrade);

        $grade = Grade::create([
            'enrollment_id' => $request->enrollment_id,
            'continuous_assessment' => $request->continuous_assessment,
            'exam_score' => $request->exam_score,
            'final_grade' => $finalGrade,
            'letter_grade' => $letterGrade,
            'remarks' => $request->remarks,
            'graded_by' => auth()->id(),
            'graded_at' => now(),
        ]);

        ActivityLog::log('create', 'Grade recorded', $grade);

        return $this->success(
            $grade->load(['enrollment.student.user', 'enrollment.class.course']),
            'Grade recorded successfully',
            201
        );
    }

    public function show(Grade $grade)
    {
        $grade->load(['enrollment.student.user', 'enrollment.class.course', 'gradedBy']);
        
        return $this->success($grade);
    }

    public function update(Request $request, Grade $grade)
    {
        $request->validate([
            'continuous_assessment' => 'nullable|numeric|min:0|max:100',
            'exam_score' => 'nullable|numeric|min:0|max:100',
            'remarks' => 'nullable|string',
        ]);

        $ca = $request->continuous_assessment ?? $grade->continuous_assessment ?? 0;
        $exam = $request->exam_score ?? $grade->exam_score ?? 0;
        $finalGrade = Grade::calculateFinalGrade($ca, $exam);
        $letterGrade = Grade::calculateLetterGrade($finalGrade);

        $grade->update([
            'continuous_assessment' => $request->continuous_assessment ?? $grade->continuous_assessment,
            'exam_score' => $request->exam_score ?? $grade->exam_score,
            'final_grade' => $finalGrade,
            'letter_grade' => $letterGrade,
            'remarks' => $request->remarks ?? $grade->remarks,
            'graded_by' => auth()->id(),
            'graded_at' => now(),
        ]);

        ActivityLog::log('update', 'Grade updated', $grade);

        return $this->success($grade->load(['enrollment.student.user', 'enrollment.class.course']), 'Grade updated successfully');
    }

    public function destroy(Grade $grade)
    {
        ActivityLog::log('delete', 'Grade deleted', $grade);
        
        $grade->delete();

        return $this->success(null, 'Grade deleted successfully');
    }

    public function byClass(int $classId)
    {
        $enrollments = Enrollment::with(['student.user', 'grades'])
            ->where('class_id', $classId)
            ->where('status', 'enrolled')
            ->get();

        return $this->success($enrollments);
    }

    public function bulkUpdate(Request $request)
    {
        $request->validate([
            'grades' => 'required|array',
            'grades.*.enrollment_id' => 'required|exists:enrollments,id',
            'grades.*.continuous_assessment' => 'nullable|numeric|min:0|max:100',
            'grades.*.exam_score' => 'nullable|numeric|min:0|max:100',
        ]);

        $updated = 0;
        foreach ($request->grades as $gradeData) {
            $ca = $gradeData['continuous_assessment'] ?? 0;
            $exam = $gradeData['exam_score'] ?? 0;
            $finalGrade = Grade::calculateFinalGrade($ca, $exam);
            $letterGrade = Grade::calculateLetterGrade($finalGrade);

            Grade::updateOrCreate(
                ['enrollment_id' => $gradeData['enrollment_id']],
                [
                    'continuous_assessment' => $gradeData['continuous_assessment'] ?? null,
                    'exam_score' => $gradeData['exam_score'] ?? null,
                    'final_grade' => $finalGrade,
                    'letter_grade' => $letterGrade,
                    'graded_by' => auth()->id(),
                    'graded_at' => now(),
                ]
            );
            $updated++;
        }

        ActivityLog::log('bulk_update', "Bulk updated {$updated} grades");

        return $this->success(['updated' => $updated], "Updated {$updated} grades successfully");
    }
}
