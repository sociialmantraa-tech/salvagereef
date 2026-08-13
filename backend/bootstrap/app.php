<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\File;
use App\Models\ErrorLog;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->statefulApi();
        $middleware->alias([
            'admin' => \App\Http\Middleware\EnsureIsAdmin::class,
        ]);
        $middleware->append(\App\Http\Middleware\CheckMaintenanceMode::class);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        $exceptions->reportable(function (Throwable $e) {
            try {
                // 1. Ensure error log directory exists
                $errorLogDir = storage_path('logs/errors');
                if (!File::exists($errorLogDir)) {
                    File::makeDirectory($errorLogDir, 0755, true, true);
                }

                // 2. Write to dedicated error log channel file
                Log::channel('errors')->error($e->getMessage(), [
                    'exception_class' => get_class($e),
                    'file' => $e->getFile(),
                    'line' => $e->getLine(),
                    'url' => request()->fullUrl(),
                    'method' => request()->method(),
                    'ip' => request()->ip(),
                    'trace' => $e->getTraceAsString(),
                ]);

                // 3. Persist error into error_logs database table
                $userId = null;
                if (auth()->check()) {
                    $userId = auth()->id();
                }

                ErrorLog::create([
                    'severity' => 'error',
                    'message' => substr($e->getMessage() ?: get_class($e), 0, 2000),
                    'exception_class' => get_class($e),
                    'file' => $e->getFile(),
                    'line' => $e->getLine(),
                    'url' => request()->fullUrl(),
                    'method' => request()->method(),
                    'ip_address' => request()->ip(),
                    'user_agent' => substr(request()->userAgent() ?? '', 0, 500),
                    'user_id' => $userId,
                    'stack_trace' => $e->getTraceAsString(),
                    'status' => 'unresolved',
                ]);
            } catch (Throwable $loggingError) {
                // Silently avoid recursive loop if database logging fails
            }
        });
    })->create();

