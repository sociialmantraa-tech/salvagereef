<?php
$dbPath = __DIR__ . '/database/database.sqlite';
if (!file_exists($dbPath)) {
    $dbPath = __DIR__ . '/database.sqlite';
}
$pdo = new PDO('sqlite:' . $dbPath);
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
$pdo->exec("UPDATE auctions SET status = 'live', current_highest_bid = starting_price, winner_user_id = NULL, winner_h1_user_id = NULL, winner_h2_user_id = NULL, winner_h3_user_id = NULL, awarded_winner_id = NULL, awarded_winner_type = NULL, winner_confirmed = 0, end_time = datetime('now', '+7 days') WHERE id IN (999, 101)");
$pdo->exec("DELETE FROM bids WHERE auction_id IN (999, 101)");
echo "Auctions 999 and 101 reset to live successfully\n";
