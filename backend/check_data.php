<?php
$pdo = new PDO('sqlite:' . __DIR__ . '/database/database.sqlite');
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
$auctions = $pdo->query("SELECT id, title, starting_price, current_highest_bid, status, auction_type FROM auctions ORDER BY id ASC")->fetchAll(PDO::FETCH_ASSOC);
echo "TOTAL AUCTIONS: " . count($auctions) . "\n";
foreach ($auctions as $a) {
    echo "ID " . $a['id'] . " | " . $a['auction_type'] . " | " . $a['status'] . " | " . $a['title'] . "\n";
}
