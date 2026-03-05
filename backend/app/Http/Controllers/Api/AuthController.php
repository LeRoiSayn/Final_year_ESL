<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'username' => 'required|string',
            'password' => 'required|string',
        ]);

        $user = User::where('username', $request->username)
            ->orWhere('email', $request->username)
            ->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'username' => ['The provided credentials are incorrect.'],
            ]);
        }

        if (!$user->is_active) {
            return $this->error('Your account has been deactivated. Please contact admin.', 403);
        }

        // Update last login
        $user->update(['last_login_at' => now()]);

        // Create token
        $token = $user->createToken('auth-token')->plainTextToken;

        // Log activity
        ActivityLog::log('login', 'User logged in', $user);

        // Load relationships based on role
        if ($user->role === 'student') {
            $user->load(['student.department.faculty']);
        } elseif ($user->role === 'teacher') {
            $user->load(['teacher.department.faculty']);
        }

        return $this->success([
            'user' => $user,
            'token' => $token,
        ], 'Login successful');
    }

    public function logout(Request $request)
    {
        ActivityLog::log('logout', 'User logged out');
        
        $request->user()->currentAccessToken()->delete();

        return $this->success(null, 'Logged out successfully');
    }

    public function me(Request $request)
    {
        $user = $request->user();

        if ($user->role === 'student') {
            $user->load(['student.department.faculty']);
        } elseif ($user->role === 'teacher') {
            $user->load(['teacher.department.faculty']);
        }

        return $this->success($user);
    }

    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'first_name' => 'sometimes|string|max:255',
            'last_name' => 'sometimes|string|max:255',
            'phone' => 'sometimes|nullable|string|max:20',
            'address' => 'sometimes|nullable|string|max:255',
            'date_of_birth' => 'sometimes|nullable|date',
        ]);

        $user->update($request->only(['first_name', 'last_name', 'phone', 'address', 'date_of_birth']));

        ActivityLog::log('profile_update', 'User updated profile', $user);

        return $this->success($user, 'Profile updated successfully');
    }

    public function changePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required|string',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = $request->user();

        if (!Hash::check($request->current_password, $user->password)) {
            return $this->error('Current password is incorrect', 400);
        }

        $user->update(['password' => Hash::make($request->password)]);

        ActivityLog::log('password_change', 'User changed password', $user);

        return $this->success(null, 'Password changed successfully');
    }
}
