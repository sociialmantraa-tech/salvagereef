<?php
// =============================================================================
// SALVAGEREEF — REAL-TIME DATABASE DIAGNOSTIC & AUTO-CONFIG TOOL
// Access this directly in browser at: https://salvagereef.com/backend/test_db.php
// =============================================================================

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

$results = [
    'timestamp' => date('Y-m-d H:i:s T'),
    'php_version' => PHP_VERSION,
    'pdo_mysql_extension' => extension_loaded('pdo_mysql'),
    'pdo_sqlite_extension' => extension_loaded('pdo_sqlite'),
    'env_file_found' => file_exists(__DIR__ . '/.env'),
    'env_content' => [],
    'connection_tests' => [],
    'active_working_connection' => null,
];

// Read .env if present
if (file_exists(__DIR__ . '/.env')) {
    $lines = file(__DIR__ . '/.env', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        $line = trim($line);
        if ($line === '' || str_starts_with($line, '#')) continue;
        if (str_contains($line, '=')) {
            [$k, $v] = explode('=', $line, 2);
            $k = trim($k);
            $v = trim($v, " \t\n\r\0\x0B\"'");
            if (in_array($k, ['DB_CONNECTION', 'DB_HOST', 'DB_PORT', 'DB_DATABASE', 'DB_USERNAME'], true)) {
                $results['env_content'][$k] = $v;
            } else if ($k === 'DB_PASSWORD') {
                $results['env_content'][$k] = substr($v, 0, 3) . '***' . substr($v, -2);
            }
        }
    }
}

$candidates = [
    [
        'label' => 'Standard cPanel Socket (localhost | scrab | scrab_user)',
        'host' => 'localhost',
        'port' => '3306',
        'dbname' => 'scrab',
        'user' => 'scrab_user',
        'pass' => 'scrabRoot@123',
    ],
    [
        'label' => 'cPanel Prefixed Socket (localhost | md1ofov5ad9b_scrab | md1ofov5ad9b_scrab_user)',
        'host' => 'localhost',
        'port' => '3306',
        'dbname' => 'md1ofov5ad9b_scrab',
        'user' => 'md1ofov5ad9b_scrab_user',
        'pass' => 'scrabRoot@123',
    ],
    [
        'label' => 'Standard cPanel TCP (127.0.0.1 | scrab | scrab_user)',
        'host' => '127.0.0.1',
        'port' => '3306',
        'dbname' => 'scrab',
        'user' => 'scrab_user',
        'pass' => 'scrabRoot@123',
    ],
    [
        'label' => 'cPanel Prefixed TCP (127.0.0.1 | md1ofov5ad9b_scrab | md1ofov5ad9b_scrab_user)',
        'host' => '127.0.0.1',
        'port' => '3306',
        'dbname' => 'md1ofov5ad9b_scrab',
        'user' => 'md1ofov5ad9b_scrab_user',
        'pass' => 'scrabRoot@123',
    ],
];

if (!empty($results['env_content']['DB_HOST'])) {
    array_unshift($candidates, [
        'label' => 'Configured .env Settings (' . ($results['env_content']['DB_HOST'] ?? '') . ')',
        'host' => $results['env_content']['DB_HOST'] ?? 'localhost',
        'port' => $results['env_content']['DB_PORT'] ?? '3306',
        'dbname' => $results['env_content']['DB_DATABASE'] ?? 'scrab',
        'user' => $results['env_content']['DB_USERNAME'] ?? 'scrab_user',
        'pass' => 'scrabRoot@123',
    ]);
}

foreach ($candidates as $c) {
    $dsn = "mysql:host={$c['host']};port={$c['port']};dbname={$c['dbname']};charset=utf8mb4";
    $testResult = [
        'candidate' => $c['label'],
        'dsn' => "mysql:host={$c['host']};port={$c['port']};dbname={$c['dbname']}",
        'user' => $c['user'],
        'status' => 'FAILED',
        'error' => null,
        'tables_found' => 0,
    ];

    if (!extension_loaded('pdo_mysql')) {
        $testResult['error'] = 'PDO MySQL extension not loaded in PHP.';
        $results['connection_tests'][] = $testResult;
        continue;
    }

    try {
        $pdo = new PDO($dsn, $c['user'], $c['pass'], [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_TIMEOUT => 2,
        ]);
        $tables = $pdo->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);
        $testResult['status'] = 'SUCCESS';
        $testResult['tables_found'] = count($tables);
        $testResult['tables_list'] = array_slice($tables, 0, 10);
        
        if (!$results['active_working_connection']) {
            $results['active_working_connection'] = [
                'host' => $c['host'],
                'dbname' => $c['dbname'],
                'user' => $c['user'],
                'table_count' => count($tables),
            ];
        }
    } catch (Exception $e) {
        $testResult['error'] = $e->getMessage();
    }

    $results['connection_tests'][] = $testResult;
}

echo json_encode($results, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
