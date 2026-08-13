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
        $isMaintenance = SystemSetting::get('maintenance_mode', 'false') === 'true';

        if ($isMaintenance) {
            // Check if request is system status check or maintenance toggle
            if ($request->is('api/v1/system/status') || $request->is('api/v1/admin/maintenance/*') || $request->is('api/v1/auth/login')) {
                return $next($request);
            }

            // Allow authenticated admin users to bypass maintenance mode
            if ($request->user() && $request->user()->role === 'admin') {
                return $next($request);
            }

            $message = SystemSetting::get('maintenance_message', 'SalvageReef is currently undergoing scheduled maintenance. We will be back shortly!');

            if ($request->expectsJson() || $request->is('api/*')) {
                return response()->json([
                    'success' => false,
                    'status' => 'maintenance',
                    'message' => $message,
                ], 503);
            }
        }

        return $next($request);
    }
}
