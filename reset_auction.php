<?php
$dbPath = __DIR__ . '/deploy_hosting/public_html/backend/database/database.sqlite';
$pdo = new PDO('sqlite:' . $dbPath);
$pdo->exec("UPDATE auctions SET status = 'live', current_highest_bid = 750000, end_time = datetime('now', '+7 days') WHERE id = 999");
echo "Auction 999 successfully reset to live!\n";
