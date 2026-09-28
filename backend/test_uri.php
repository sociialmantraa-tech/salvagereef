<?php
$test = [
    '/api/v1/classifieds',
    '/backend/api/v1/classifieds',
    '/backend/server.php/api/v1/classifieds',
    '/public_html/backend/server.php/api/v1/classifieds',
    '/server.php/api/v1/classifieds'
];

foreach ($test as $rawUri) {
    // Current regex:
    $uri1 = preg_replace('#^(/public_html)?(/backend)?(/server\.php)?#', '', $rawUri);
    // Robust normalize:
    $pos = strpos($rawUri, '/api/v1');
    $uri2 = ($pos !== false) ? substr($rawUri, $pos) : $rawUri;
    
    echo "$rawUri\n  Current: $uri1\n  Robust:  $uri2\n\n";
}
