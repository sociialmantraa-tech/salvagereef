<?php
// Local test router for PHP built-in web server
$uri = urldecode(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH));

// Serve static files directly if they exist
$filePath = __DIR__ . $uri;
if ($uri !== '/' && file_exists($filePath) && !is_dir($filePath)) {
    // If it's a PHP file, execute it
    if (str_ends_with($filePath, '.php')) {
        require $filePath;
        exit;
    }
    return false; // let PHP built-in server serve static file with appropriate MIME type
}

// Route backend requests
if (str_starts_with($uri, '/backend/') || str_starts_with($uri, '/api/')) {
    require __DIR__ . '/backend/server.php';
    exit;
}

// Fallback to index.html for SPA
require __DIR__ . '/index.html';
