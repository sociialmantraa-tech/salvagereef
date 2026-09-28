<?php
$pdo = new PDO('sqlite:backend/database/database.sqlite');
$pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);

echo "=== AUCTIONS (" . $pdo->query("SELECT COUNT(*) FROM auctions")->fetchColumn() . ") ===\n";
$aucs = $pdo->query("SELECT id, title, starting_price FROM auctions ORDER BY id DESC")->fetchAll();
foreach ($aucs as $a) {
    echo "  [#{$a['id']}] {$a['title']} - Rs. {$a['starting_price']}\n";
}

echo "\n=== CLASSIFIEDS (" . $pdo->query("SELECT COUNT(*) FROM classifieds")->fetchColumn() . ") ===\n";
$cls = $pdo->query("SELECT id, title, price FROM classifieds ORDER BY id DESC")->fetchAll();
foreach ($cls as $c) {
    echo "  [#{$c['id']}] {$c['title']} - Rs. {$c['price']}\n";
}
