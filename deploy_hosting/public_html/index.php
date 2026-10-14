<?php
// SalvageReef Root Fallback — Serves React SPA directly without 500 error
if (file_exists(__DIR__ . '/index.html')) {
    include __DIR__ . '/index.html';
    exit();
}
