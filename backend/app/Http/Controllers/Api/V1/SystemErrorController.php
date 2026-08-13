<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\ErrorLog;
use App\Models\SystemSetting;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;

class SystemErrorController extends Controller
{
    /**
     * Get paginated error logs with filtering & search.
     */
    public function index(Request $request)
    {
        $query = ErrorLog::with('user:id,name,email,role')->orderBy('created_at', 'desc');

        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->filled('severity') && $request->severity !== 'all') {
            $query->where('severity', $request->severity);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('message', 'like', "%{$search}%")
                  ->orWhere('file', 'like', "%{$search}%")
                  ->orWhere('url', 'like', "%{$search}%")
                  ->orWhere('exception_class', 'like', "%{$search}%");
            });
        }

        $perPage = $request->input('per_page', 15);
        $logs = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $logs,
        ]);
    }

    /**
     * Get error statistics summary for admin metrics card.
     */
    public function stats()
    {
        $today = Carbon::today();

        $totalErrors = ErrorLog::count();
        $unresolvedCount = ErrorLog::where('status', 'unresolved')->count();
        $resolvedCount = ErrorLog::where('status', 'resolved')->count();
        $todayCount = ErrorLog::where('created_at', '>=', $today)->count();
        $criticalCount = ErrorLog::where('severity', 'critical')->count();
        $isMaintenance = SystemSetting::get('maintenance_mode', 'false') === 'true';
        $maintenanceMessage = SystemSetting::get('maintenance_message', 'SalvageReef is currently undergoing scheduled maintenance.');

        return response()->json([
            'success' => true,
            'stats' => [
                'total_errors' => $totalErrors,
                'unresolved_errors' => $unresolvedCount,
                'resolved_errors' => $resolvedCount,
                'today_errors' => $todayCount,
                'critical_errors' => $criticalCount,
                'is_maintenance' => $isMaintenance,
                'maintenance_message' => $maintenanceMessage,
            ],
        ]);
    }

    /**
     * Update error status (mark as resolved or unresolved).
     */
    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:unresolved,resolved',
        ]);

        $log = ErrorLog::findOrFail($id);
        $log->status = $request->status;
        $log->save();

        return response()->json([
            'success' => true,
            'message' => "Error log status updated to {$log->status}.",
            'log' => $log,
        ]);
    }

    /**
     * Clear error log database records.
     */
    public function clearLogs(Request $request)
    {
        $mode = $request->input('mode', 'resolved');

        if ($mode === 'all') {
            ErrorLog::truncate();
            $message = 'All system error logs have been cleared.';
        } else {
            ErrorLog::where('status', 'resolved')->delete();
            $message = 'All resolved error logs have been deleted.';
        }

        return response()->json([
            'success' => true,
            'message' => $message,
        ]);
    }

    /**
     * Download raw error log file from storage/logs/errors/error.log.
     */
    public function downloadLogFile()
    {
        $errorLogPath = storage_path('logs/errors/error.log');
        $laravelLogPath = storage_path('logs/laravel.log');

        if (File::exists($errorLogPath) && File::size($errorLogPath) > 0) {
            return response()->download($errorLogPath, 'salvagereef_error_logs_' . date('Y-m-d') . '.log');
        }

        if (File::exists($laravelLogPath)) {
            return response()->download($laravelLogPath, 'salvagereef_system_logs_' . date('Y-m-d') . '.log');
        }

        return response()->json([
            'success' => false,
            'message' => 'No log file found on the server.',
        ], 404);
    }

    /**
     * Public system status endpoint.
     */
    public function getSystemStatus()
    {
        $isMaintenance = SystemSetting::get('maintenance_mode', 'false') === 'true';
        $message = SystemSetting::get('maintenance_message', 'SalvageReef is currently undergoing scheduled maintenance. We will be back shortly!');

        return response()->json([
            'success' => true,
            'status' => $isMaintenance ? 'maintenance' : 'online',
            'maintenance_mode' => $isMaintenance,
            'message' => $message,
            'timestamp' => now()->toIso8601String(),
        ]);
    }

    /**
     * Toggle Maintenance Mode (Admin only).
     */
    public function toggleMaintenance(Request $request)
    {
        $request->validate([
            'maintenance_mode' => 'required|boolean',
            'message' => 'nullable|string|max:500',
        ]);

        $mode = $request->maintenance_mode ? 'true' : 'false';
        SystemSetting::set('maintenance_mode', $mode);

        if ($request->has('message') && !empty($request->message)) {
            SystemSetting::set('maintenance_message', $request->message);
        }

        return response()->json([
            'success' => true,
            'message' => $request->maintenance_mode ? 'Maintenance mode enabled.' : 'Maintenance mode disabled.',
            'maintenance_mode' => $request->maintenance_mode,
            'maintenance_message' => SystemSetting::get('maintenance_message'),
        ]);
    }
}
