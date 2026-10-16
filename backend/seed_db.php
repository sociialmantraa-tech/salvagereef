<?php

$dbPath = __DIR__ . '/database/database.sqlite';
$pdo = new PDO("sqlite:" . $dbPath);
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

echo "SalvageReef strict zero-mock policy active: preserving all authentic user uploaded images.\n";
