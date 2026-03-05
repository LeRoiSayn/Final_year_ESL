<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Schedule;
use App\Models\ActivityLog;
use Illuminate\Http\Request;

class ScheduleController extends Controller
{
    public function index(Request $request)
    {
        $query = Schedule::with(['class.course', 'class.teacher.user']);

        if ($request->has('class_id')) {
            $query->where('class_id', $request->class_id);
        }

        if ($request->has('day_of_week')) {
            $query->where('day_of_week', $request->day_of_week);
        }

        $schedules = $query->orderByRaw("FIELD(day_of_week, 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday')")
            ->orderBy('start_time')
            ->get();

        return $this->success($schedules);
    }

    public function store(Request $request)
    {
        $request->validate([
            'class_id' => 'required|exists:classes,id',
            'day_of_week' => 'required|in:monday,tuesday,wednesday,thursday,friday,saturday',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'room' => 'nullable|string|max:50',
        ]);

        // Check for conflicts
        $conflict = Schedule::where('class_id', $request->class_id)
            ->where('day_of_week', $request->day_of_week)
            ->where(function ($q) use ($request) {
                $q->whereBetween('start_time', [$request->start_time, $request->end_time])
                    ->orWhereBetween('end_time', [$request->start_time, $request->end_time]);
            })
            ->exists();

        if ($conflict) {
            return $this->error('Schedule conflict detected', 400);
        }

        $schedule = Schedule::create($request->all());

        ActivityLog::log('create', 'Schedule created', $schedule);

        return $this->success($schedule->load(['class.course']), 'Schedule created successfully', 201);
    }

    public function show(Schedule $schedule)
    {
        $schedule->load(['class.course', 'class.teacher.user']);
        
        return $this->success($schedule);
    }

    public function update(Request $request, Schedule $schedule)
    {
        $request->validate([
            'day_of_week' => 'sometimes|in:monday,tuesday,wednesday,thursday,friday,saturday',
            'start_time' => 'sometimes|date_format:H:i',
            'end_time' => 'sometimes|date_format:H:i|after:start_time',
            'room' => 'nullable|string|max:50',
        ]);

        $schedule->update($request->all());

        ActivityLog::log('update', 'Schedule updated', $schedule);

        return $this->success($schedule->load(['class.course']), 'Schedule updated successfully');
    }

    public function destroy(Schedule $schedule)
    {
        ActivityLog::log('delete', 'Schedule deleted', $schedule);
        
        $schedule->delete();

        return $this->success(null, 'Schedule deleted successfully');
    }

    public function byStudent(int $studentId)
    {
        $enrollmentIds = \App\Models\Enrollment::where('student_id', $studentId)
            ->where('status', 'enrolled')
            ->pluck('class_id');

        $schedules = Schedule::with(['class.course', 'class.teacher.user'])
            ->whereIn('class_id', $enrollmentIds)
            ->orderByRaw("FIELD(day_of_week, 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday')")
            ->orderBy('start_time')
            ->get();

        return $this->success($schedules);
    }

    public function byTeacher(int $teacherId)
    {
        $classIds = \App\Models\ClassModel::where('teacher_id', $teacherId)
            ->where('is_active', true)
            ->pluck('id');

        $schedules = Schedule::with(['class.course'])
            ->whereIn('class_id', $classIds)
            ->orderByRaw("FIELD(day_of_week, 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday')")
            ->orderBy('start_time')
            ->get();

        return $this->success($schedules);
    }
}
