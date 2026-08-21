<?php

namespace App\Http\Middleware;

use App\Models\SystemSetting;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckMaintenanceMode
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $systemMode = SystemSetting::get('system_mode', 'online');
        $isMaintenance = SystemSetting::get('maintenance_mode', 'false') === 'true' || $systemMode !== 'online';

        if ($isMaintenance) {
            // 1. ALWAYS allow system status, admin panel routes, and login/auth endpoints
            if (
                $request->is('api/v1/system/status') ||
                $request->is('api/v1/admin/*') ||
                $request->is('api/v1/auth/login') ||
                $request->is('api/v1/auth/me') ||
                $request->is('api/v1/auth/logout')
            ) {
                return $next($request);
            }

            // 2. Allow authenticated admin users to bypass maintenance mode via Sanctum token check
            if ($request->bearerToken()) {
                try {
                    $pat = \Laravel\Sanctum\PersonalAccessToken::findToken($request->bearerToken());
                    if ($pat && $pat->tokenable && in_array($pat->tokenable->role, ['admin', 'master_admin', 'desk_admin'], true)) {
                        return $next($request);
                    }
                } catch (\Throwable $e) {
                    // Fallthrough to maintenance block
                }
            }

            if ($request->user() && in_array($request->user()->role, ['admin', 'master_admin', 'desk_admin'], true)) {
                return $next($request);
            }

            // 3. For public visitors, select appropriate notice copy
            $mMsg = SystemSetting::get('maintenance_message', 'SalvageReef is currently undergoing scheduled maintenance. We will be back shortly!');
            $tcMsg = SystemSetting::get('temporary_closed_message', 'SalvageReef operations are temporarily closed for standard maintenance and upgrades.');

            $displayMessage = ($systemMode === 'temporary_closed') ? $tcMsg : $mMsg;

            if ($request->expectsJson() || $request->is('api/*')) {
                return response()->json([
                    'success' => false,
                    'status' => $systemMode,
                    'system_mode' => $systemMode,
                    'maintenance_mode' => true,
                    'message' => $displayMessage,
                ], 503);
            }
        }

        return $next($request);
    }
}

