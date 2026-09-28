<?php
$pdo = new PDO('sqlite:' . __DIR__ . '/database/database.sqlite');
$tables = $pdo->query("SELECT name, sql FROM sqlite_master WHERE type='table'")->fetchAll(PDO::FETCH_ASSOC);
foreach ($tables as $t) {
    echo "=== TABLE: " . $t['name'] . " ===\n";
    echo $t['sql'] . "\n\n";
}
