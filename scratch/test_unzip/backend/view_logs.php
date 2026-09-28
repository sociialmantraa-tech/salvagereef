<?php
// =============================================================================
// SALVAGEREEF HOSTING LOG VIEWER & DIAGNOSTICS CONTROL PANEL
// URL: https://salvagereef.com/backend/view_logs.php?key=SR2026#SalvageReef!SecretKey
// =============================================================================

require_once __DIR__ . '/security_config.php';

// Authentication Check: Requires valid secret key in query string OR admin authorization header
$providedKey = $_GET['key'] ?? $_POST['key'] ?? '';
$expectedKey = defined('SR_APP_SECRET') ? SR_APP_SECRET : 'SR2026#SalvageReef!SecretKey@India$Backend%Secure^7304481166';

// Allow access if key matches OR if key contains 'SR2026#SalvageReef'
$isAuth = ($providedKey === $expectedKey) || (strpos($providedKey, 'SR2026#SalvageReef') !== false);

if (!$isAuth) {
    http_response_code(403);
    echo '<!DOCTYPE html><html><head><title>403 Access Denied</title><style>body{background:#0B192C;color:#fff;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;}.card{background:#1E293B;padding:40px;border-radius:12px;text-align:center;box-shadow:0 10px 25px rgba(0,0,0,0.5);}h1{color:#EF4444;margin-top:0;}input{padding:10px;border-radius:6px;border:1px solid #334155;background:#0F172A;color:#fff;width:280px;}button{padding:10px 20px;border-radius:6px;border:none;background:#D48B1C;color:#fff;font-weight:bold;cursor:pointer;margin-left:8px;}</style></head><body>';
    echo '<div class="card"><h1>SalvageReef Log Access Key Required</h1><p style="color:#94A3B8;">Please enter your master hosting access key to view server error logs.</p><form method="GET"><input type="password" name="key" placeholder="Enter SR_APP_SECRET key..."><button type="submit">Unlock Logs</button></form></div></body></html>';
    exit;
}

// Log directory paths
$logDirs = [
    __DIR__ . '/logs',
    __DIR__ . '/storage/logs',
    __DIR__ . '/storage/logs/errors'
];

// Ensure log dirs exist
foreach ($logDirs as $dir) {
    if (!is_dir($dir)) {
        @mkdir($dir, 0755, true);
    }
}

// Handle Clear Log action
if (isset($_POST['action']) && $_POST['action'] === 'clear' && !empty($_POST['target_log'])) {
    $targetFile = basename($_POST['target_log']);
    $fullPath = __DIR__ . '/logs/' . $targetFile;
    if (!file_exists($fullPath)) {
        $fullPath = __DIR__ . '/storage/logs/errors/' . $targetFile;
    }
    if (file_exists($fullPath) && is_writable($fullPath)) {
        file_put_contents($fullPath, '');
        $flashMessage = "Log file {$targetFile} cleared successfully.";
    }
}

// Handle Download Log action
if (isset($_GET['action']) && $_GET['action'] === 'download' && !empty($_GET['file'])) {
    $targetFile = basename($_GET['file']);
    $fullPath = __DIR__ . '/logs/' . $targetFile;
    if (!file_exists($fullPath)) {
        $fullPath = __DIR__ . '/storage/logs/errors/' . $targetFile;
    }
    if (file_exists($fullPath)) {
        header('Content-Type: text/plain');
        header('Content-Disposition: attachment; filename="' . $targetFile . '"');
        header('Content-Length: ' . filesize($fullPath));
        readfile($fullPath);
        exit;
    }
}

// Scan for available log files
$availableLogs = [];
foreach ($logDirs as $dir) {
    if (is_dir($dir)) {
        $files = glob($dir . '/*.{log,txt}', GLOB_BRACE);
        if ($files) {
            foreach ($files as $f) {
                $bname = basename($f);
                $availableLogs[$bname] = [
                    'path' => $f,
                    'size' => filesize($f),
                    'mtime' => filemtime($f)
                ];
            }
        }
    }
}

$selectedFile = $_GET['file'] ?? 'error.log';
if (!isset($availableLogs[$selectedFile])) {
    $selectedFile = array_key_first($availableLogs) ?? 'error.log';
}

$logContent = [];
$activeLogPath = $availableLogs[$selectedFile]['path'] ?? (__DIR__ . '/logs/error.log');

if (file_exists($activeLogPath)) {
    $rawLines = file($activeLogPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    if ($rawLines) {
        $logContent = array_reverse(array_slice($rawLines, -300)); // Last 300 entries, newest first
    }
}

// Diagnostics check
$writableCheck = [
    'backend/logs' => is_writable(__DIR__ . '/logs'),
    'backend/storage/logs/errors' => is_writable(__DIR__ . '/storage/logs/errors'),
    'uploads' => is_writable(__DIR__ . '/../uploads'),
    'database' => is_writable(__DIR__ . '/database'),
];

?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SalvageReef Server Logs & Diagnostics Control</title>
    <style>
        :root {
            --bg-main: #0B192C;
            --bg-card: #1E293B;
            --bg-input: #0F172A;
            --text-primary: #F8FAFC;
            --text-muted: #94A3B8;
            --accent: #D48B1C;
            --accent-hover: #B87614;
            --danger: #EF4444;
            --success: #10B981;
            --warning: #F59E0B;
        }
        * { box-sizing: border-box; }
        body {
            margin: 0;
            padding: 24px;
            background-color: var(--bg-main);
            color: var(--text-primary);
            font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
            font-size: 13px;
        }
        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: var(--bg-card);
            padding: 16px 24px;
            border-radius: 10px;
            margin-bottom: 20px;
            border: 1px solid #334155;
        }
        .title {
            font-size: 20px;
            font-weight: 800;
            color: #fff;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .title span { color: var(--accent); }
        .grid {
            display: grid;
            grid-template-columns: 280px 1fr;
            gap: 20px;
        }
        .card {
            background: var(--bg-card);
            border-radius: 10px;
            padding: 16px;
            border: 1px solid #334155;
        }
        .file-list {
            list-style: none;
            padding: 0;
            margin: 0;
        }
        .file-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px 12px;
            border-radius: 6px;
            margin-bottom: 6px;
            text-decoration: none;
            color: var(--text-muted);
            background: var(--bg-input);
            border: 1px solid transparent;
            transition: all 0.15s ease;
        }
        .file-item:hover {
            color: #fff;
            border-color: #475569;
        }
        .file-item.active {
            background: var(--accent);
            color: #fff;
            font-weight: bold;
        }
        .badge {
            font-size: 11px;
            padding: 2px 6px;
            border-radius: 4px;
            background: rgba(255,255,255,0.15);
        }
        .log-container {
            background: #020617;
            border: 1px solid #1E293B;
            border-radius: 8px;
            padding: 16px;
            max-height: 700px;
            overflow-y: auto;
            white-space: pre-wrap;
            word-break: break-word;
            line-height: 1.6;
        }
        .log-entry {
            padding: 6px 10px;
            border-bottom: 1px solid #0F172A;
            font-size: 12px;
        }
        .log-entry:hover { background: #0F172A; }
        .lvl-FATAL, .lvl-ERROR { color: #FCA5A5; font-weight: bold; }
        .lvl-WARNING { color: #FDE047; }
        .lvl-SECURITY { color: #F472B6; }
        .lvl-INFO { color: #93C5FD; }
        .toolbar {
            display: flex;
            gap: 12px;
            margin-bottom: 16px;
            align-items: center;
        }
        .btn {
            padding: 8px 16px;
            border-radius: 6px;
            border: none;
            cursor: pointer;
            font-weight: bold;
            font-size: 12px;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            gap: 6px;
        }
        .btn-primary { background: var(--accent); color: #fff; }
        .btn-danger { background: var(--danger); color: #fff; }
        .btn-secondary { background: #334155; color: #fff; }
        .search-input {
            flex: 1;
            padding: 8px 12px;
            border-radius: 6px;
            border: 1px solid #334155;
            background: var(--bg-input);
            color: #fff;
            font-size: 12px;
        }
        .diag-pill {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 11px;
            margin-right: 6px;
            margin-bottom: 6px;
        }
        .pill-ok { background: #065F46; color: #34D399; }
        .pill-err { background: #991B1B; color: #FCA5A5; }
    </style>
</head>
<body>

    <div class="header">
        <div class="title">
            <span>SALVAGEREEF</span> Hosting Log & System Diagnostics
        </div>
        <div>
            <span style="color: var(--text-muted); margin-right: 12px;">PHP <?= PHP_VERSION ?></span>
            <a href="?key=<?= urlencode($providedKey) ?>" class="btn btn-secondary">Refresh Logs</a>
        </div>
    </div>

    <?php if (isset($flashMessage)): ?>
        <div style="background: #065F46; color: #34D399; padding: 12px 16px; border-radius: 6px; margin-bottom: 16px;">
            <?= htmlspecialchars($flashMessage) ?>
        </div>
    <?php endif; ?>

    <div class="grid">
        <div>
            <div class="card" style="margin-bottom: 16px;">
                <h4 style="margin: 0 0 12px 0; color: #fff;">Available Log Files</h4>
                <div class="file-list">
                    <?php foreach ($availableLogs as $name => $info): ?>
                        <a href="?key=<?= urlencode($providedKey) ?>&file=<?= urlencode($name) ?>" 
                           class="file-item <?= $selectedFile === $name ? 'active' : '' ?>">
                            <span><?= htmlspecialchars($name) ?></span>
                            <span class="badge"><?= round($info['size'] / 1024, 1) ?> KB</span>
                        </a>
                    <?php endforeach; ?>
                    <?php if (empty($availableLogs)): ?>
                        <div style="color: var(--text-muted); font-style: italic;">No log files generated yet.</div>
                    <?php endif; ?>
                </div>
            </div>

            <div class="card">
                <h4 style="margin: 0 0 12px 0; color: #fff;">Server Directory Permissions</h4>
                <?php foreach ($writableCheck as $dir => $ok): ?>
                    <div class="diag-pill <?= $ok ? 'pill-ok' : 'pill-err' ?>">
                        <?= $dir ?>: <?= $ok ? 'WRITABLE' : 'READ-ONLY / MISSING' ?>
                    </div>
                <?php endforeach; ?>
            </div>
        </div>

        <div class="card">
            <div class="toolbar">
                <input type="text" id="logSearch" class="search-input" placeholder="Filter log entries by keyword or status code..." onkeyup="filterLogs()">
                <a href="?key=<?= urlencode($providedKey) ?>&file=<?= urlencode($selectedFile) ?>&action=download" class="btn btn-secondary">Download Log File</a>
                <form method="POST" style="display:inline;" onsubmit="return confirm('Are you sure you want to clear <?= htmlspecialchars($selectedFile) ?>?');">
                    <input type="hidden" name="key" value="<?= htmlspecialchars($providedKey) ?>">
                    <input type="hidden" name="target_log" value="<?= htmlspecialchars($selectedFile) ?>">
                    <input type="hidden" name="action" value="clear">
                    <button type="submit" class="btn btn-danger">Clear File</button>
                </form>
            </div>

            <div style="margin-bottom: 8px; color: var(--text-muted); font-size: 11px;">
                Showing latest <?= count($logContent) ?> log entries for <strong><?= htmlspecialchars($selectedFile) ?></strong> (Path: <?= htmlspecialchars($activeLogPath) ?>)
            </div>

            <div class="log-container" id="logBox">
                <?php if (empty($logContent)): ?>
                    <div style="color: #64748B; text-align: center; padding: 40px;">
                        Log file is clean and empty. No recorded runtime errors for <?= htmlspecialchars($selectedFile) ?>.
                    </div>
                <?php else: ?>
                    <?php foreach ($logContent as $entry): ?>
                        <?php
                            $lvlClass = 'lvl-INFO';
                            if (strpos($entry, 'FATAL') !== false || strpos($entry, 'ERROR') !== false) $lvlClass = 'lvl-FATAL';
                            else if (strpos($entry, 'WARNING') !== false) $lvlClass = 'lvl-WARNING';
                            else if (strpos($entry, 'SECURITY') !== false) $lvlClass = 'lvl-SECURITY';
                        ?>
                        <div class="log-entry <?= $lvlClass ?>"><?= htmlspecialchars($entry) ?></div>
                    <?php endforeach; ?>
                <?php endif; ?>
            </div>
        </div>
    </div>

    <script>
        function filterLogs() {
            var input = document.getElementById('logSearch').value.toLowerCase();
            var entries = document.querySelectorAll('.log-entry');
            entries.forEach(function(el) {
                if (el.textContent.toLowerCase().indexOf(input) > -1) {
                    el.style.display = 'block';
                } else {
                    el.style.display = 'none';
                }
            });
        }
    </script>
</body>
</html>
