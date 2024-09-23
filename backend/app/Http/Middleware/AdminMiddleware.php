<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AdminMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        if (Auth::check() && Auth::user()->is_admin) {
            return $next($request); // Dozvoli pristup ako je korisnik admin
        }

        return response()->json(['message' => 'Unauthorized.'], 403); // Zabranjen pristup
    }
}
