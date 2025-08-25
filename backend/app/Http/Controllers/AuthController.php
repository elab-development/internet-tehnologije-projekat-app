<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        return response()->json(['message' => 'User registered successfully']);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        // Attempt to authenticate the user
        if (!Auth::attempt($request->only('email', 'password'))) {
            return response()->json(['success' => false, 'message' => 'Invalid credentials.'], 401);
        }

        // Retrieve the authenticated user
        $user = Auth::user(); // Use Auth::user() to get the currently authenticated user
        $token = $user->createToken('auth_token')->plainTextToken;

        // Get the is_admin status from the user
        $is_admin = $user->is_admin;
        $role = $user->role ?? ($is_admin ? 'admin' : 'user'); // Fallback for existing users

        return response()->json([
            'success' => true,
            'token' => $token,
            'token_type' => 'Bearer',
            'is_admin' => $is_admin,
            'role' => $role,
        ]);
    }

    public function logout(Request $request)
    {
        // Ensure the user is authenticated before attempting to log out
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'User logged out']);
    }

    public function forgotPassword(Request $request)
    {
        $request->validate(['email' => 'required|email']);

        // Check if the user with the given email exists
        $user = User::where('email', $request->email)->first();
        if (!$user) {
            return response()->json(['message' => 'Email address not found.'], 404);
        }

        // Send reset link
        try {
            $status = Password::sendResetLink($request->only('email'));

            if ($status === Password::RESET_LINK_SENT) {
                return response()->json(['message' => 'Reset link sent to your email.']);
            } else {
                Log::error('Password reset link error: ' . trans($status));
                return response()->json(['message' => 'Error sending reset link.'], 500);
            }
        } catch (\Exception $e) {
            Log::error('Error sending reset link: ' . $e->getMessage());
            return response()->json(['message' => 'Error sending reset link.'], 500);
        }
    }

    public function getUser(Request $request)
    {
        $user = $request->user();
        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'is_admin' => $user->is_admin,
            'role' => $user->role ?? ($user->is_admin ? 'admin' : 'user'), // Include role
        ]);
    }

    public function resetPasswordWithToken(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string|min:8|confirmed',
            'token' => 'required'
        ]);

        // Find user by email
        $user = User::where('email', $request->email)->first();
        
        if (!$user) {
            return response()->json(['message' => 'User not found.'], 404);
        }

        // Update password
        $user->password = Hash::make($request->password);
        $user->save();

        return response()->json(['message' => 'Password has been reset successfully.']);
    }
    
}