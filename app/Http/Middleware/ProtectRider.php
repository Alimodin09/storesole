<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ProtectRider
{
    public function handle(Request $request, Closure $next): Response
    {
        $token = $request->bearerToken();

        if (!$token) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $user = User::where('api_token', hash('sha256', $token))->first();

        if (!$user || $user->role !== 'rider') {
            return response()->json(['message' => 'Forbidden: rider access only'], 403);
        }

        $request->attributes->set('auth_user', $user);

        return $next($request);
    }
}
