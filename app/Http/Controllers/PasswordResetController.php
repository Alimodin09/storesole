<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class PasswordResetController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'email' => ['required', 'email', 'exists:users,email'],
        ]);

        $plainToken = Str::random(64);

        DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $validated['email']],
            [
                'token' => Hash::make($plainToken),
                'created_at' => now(),
            ]
        );

        return response()->json([
            'message' => 'Password reset token generated successfully.',
            'reset_token' => $plainToken,
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'email' => ['required', 'email', 'exists:users,email'],
            'token' => ['required', 'string'],
            'password' => ['required', 'string', 'min:6', 'confirmed'],
        ]);

        $resetRow = DB::table('password_reset_tokens')
            ->where('email', $validated['email'])
            ->first();

        if (!$resetRow || !Hash::check($validated['token'], $resetRow->token)) {
            return response()->json(['message' => 'Invalid or expired reset token.'], 422);
        }

        if (now()->diffInMinutes($resetRow->created_at) > 60) {
            return response()->json(['message' => 'Reset token has expired. Please request a new one.'], 422);
        }

        $user = User::where('email', $validated['email'])->first();
        $user->password = $validated['password'];
        $user->save();

        DB::table('password_reset_tokens')->where('email', $validated['email'])->delete();

        return response()->json([
            'message' => 'Password reset successfully. You can now login with your new password.',
        ]);
    }
}
