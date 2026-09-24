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
     * Store and log reported error from client or server.
     */
    public function reportError(Request $request)
    {
        $message = $request->input('message', 'Unspecified Error');
        $severity = $request->input('severity', 'error');
        $exceptionClass = $request->input('exception_class', 'ClientException');
        $file = $request->input('file', 'frontend');
        $line = $request->input('line', 1);
        $url = $request->input('url', $request->fullUrl());
        $stackTrace = $request->input('stack_trace', '');
        $userId = $request->user()?->id ?? ($request->input('user.id') ?? null);

        // Record in SQLite / MySQL Database
        $errorLog = ErrorLog::create([
            'user_id' => $userId,
            'message' => substr($message, 0, 1000),
            'severity' => in_array($severity, ['critical', 'error', 'warning', 'info']) ? $severity : 'error',
            'status' => 'unresolved',
            'exception_class' => $exceptionClass,
            'file' => $file,
            'line' => (int)$line,
            'url' => $url,
            'method' => $request->method(),
            'stack_trace' => $stackTrace,
        ]);

        // Also append to server log file
        try {
            $logDir = storage_path('logs/errors');
            if (!File::exists($logDir)) {
                File::makeDirectory($logDir, 0755, true);
            }
            $logFile = $logDir . '/error.log';
            $logLine = sprintf("[%s] [%s] [%s] %s in %s:%s (URL: %s)\n", date('Y-m-d H:i:s'), strtoupper($severity), $exceptionClass, $message, $file, $line, $url);
            File::append($logFile, $logLine);
        } catch (\Throwable $t) {}

        return response()->json([
            'success' => true,
            'message' => 'Error successfully logged to system database',
            'data' => $errorLog,
        ]);
    }

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
        $systemMode = SystemSetting::get('system_mode', 'online');
        $isMaintenance = SystemSetting::get('maintenance_mode', 'false') === 'true' || $systemMode === 'maintenance';
        $maintenanceMessage = SystemSetting::get('maintenance_message', 'SalvageReef is currently undergoing scheduled maintenance.');
        $temporaryClosedMessage = SystemSetting::get('temporary_closed_message', 'SalvageReef operations are temporarily closed for standard maintenance and operational update.');

        return response()->json([
            'success' => true,
            'stats' => [
                'total_errors' => $totalErrors,
                'unresolved_errors' => $unresolvedCount,
                'resolved_errors' => $resolvedCount,
                'today_errors' => $todayCount,
                'critical_errors' => $criticalCount,
                'system_mode' => $systemMode,
                'is_maintenance' => $isMaintenance,
                'maintenance_message' => $maintenanceMessage,
                'temporary_closed_message' => $temporaryClosedMessage,
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
     * Stream raw server error logs for Admin Console live terminal.
     */
    public function getRawLogs(Request $request)
    {
        $fileParam = preg_replace('/[^a-z_]/', '', strtolower($request->query('file', 'error')));
        $linesParam = min((int)$request->query('lines', 300), 1000);

        $allowedFiles = ['error', 'access', 'security', 'upload', 'fatal', 'php_native'];
        if (!in_array($fileParam, $allowedFiles, true)) {
            $fileParam = 'error';
        }

        $logDir = storage_path('logs/errors');
        $logFile = $logDir . '/' . $fileParam . '.log';

        if (!File::exists($logFile) || File::size($logFile) === 0) {
            $logFile = storage_path('logs/laravel.log');
        }

        if (!File::exists($logFile)) {
            return response()->json([
                'success' => true,
                'logs' => "[SERVER LOG ACTIVE]\n[" . date('Y-m-d H:i:s') . "] No uncaught errors logged. Platform operating normally.",
                'count' => 0,
                'file' => $fileParam,
            ]);
        }

        $lines = file($logFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        $recentLines = array_slice($lines, -$linesParam);

        return response()->json([
            'success' => true,
            'logs' => implode("\n", $recentLines),
            'count' => count($lines),
            'file' => $fileParam,
        ]);
    }

    /**
     * Public system status endpoint.
     */
    public function getSystemStatus()
    {
        $systemMode = SystemSetting::get('system_mode', 'online');
        $isMaintenance = SystemSetting::get('maintenance_mode', 'false') === 'true' || $systemMode === 'maintenance';
        $mMsg = SystemSetting::get('maintenance_message', 'SalvageReef is currently undergoing scheduled maintenance. We will be back shortly!');
        $tcMsg = SystemSetting::get('temporary_closed_message', 'SalvageReef operations are temporarily closed for standard maintenance and upgrades.');

        $displayMessage = '';
        if ($systemMode === 'maintenance') $displayMessage = $mMsg;
        if ($systemMode === 'temporary_closed') $displayMessage = $tcMsg;

        return response()->json([
            'success' => true,
            'status' => $systemMode,
            'system_mode' => $systemMode,
            'maintenance_mode' => $isMaintenance,
            'message' => $displayMessage,
            'maintenance_message' => $mMsg,
            'temporary_closed_message' => $tcMsg,
            'timestamp' => now()->toIso8601String(),
        ]);
    }

    /**
     * Toggle Maintenance Mode (Admin only).
     */
    public function toggleMaintenance(Request $request)
    {
        $systemMode = $request->input('system_mode');
        $maintenanceModeInput = $request->input('maintenance_mode');

        if ($systemMode && in_array($systemMode, ['online', 'maintenance', 'temporary_closed'], true)) {
            $isMaintenance = ($systemMode === 'maintenance');
        } else {
            $isMaintenance = filter_var($maintenanceModeInput, FILTER_VALIDATE_BOOLEAN);
            $systemMode = $isMaintenance ? 'maintenance' : 'online';
        }

        SystemSetting::set('system_mode', $systemMode);
        SystemSetting::set('maintenance_mode', $isMaintenance ? 'true' : 'false');

        if ($request->filled('maintenance_message')) {
            SystemSetting::set('maintenance_message', $request->input('maintenance_message'));
        }
        if ($request->filled('message')) {
            SystemSetting::set('maintenance_message', $request->input('message'));
        }
        if ($request->filled('temporary_closed_message')) {
            SystemSetting::set('temporary_closed_message', $request->input('temporary_closed_message'));
        }

        return response()->json([
            'success' => true,
            'message' => "System operational mode updated to '{$systemMode}'.",
            'system_mode' => $systemMode,
            'maintenance_mode' => $isMaintenance,
            'maintenance_message' => SystemSetting::get('maintenance_message', 'SalvageReef is currently undergoing scheduled maintenance.'),
            'temporary_closed_message' => SystemSetting::get('temporary_closed_message', 'SalvageReef operations are temporarily closed for standard maintenance.'),
        ]);
    }
}
