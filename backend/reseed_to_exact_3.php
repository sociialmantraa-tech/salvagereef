<?php
$dbPath = __DIR__ . '/database/database.sqlite';
$pdo = new PDO('sqlite:' . $dbPath);
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

// Delete other auctions, keep only 999, 101, 102
$pdo->exec("DELETE FROM auctions WHERE id NOT IN (999, 101, 102)");
$pdo->exec("DELETE FROM auction_images WHERE auction_id NOT IN (999, 101, 102)");
$pdo->exec("DELETE FROM bids WHERE auction_id NOT IN (999, 101, 102)");
$pdo->exec("DELETE FROM enquiry_or_interests WHERE auction_id NOT IN (999, 101, 102)");

// Delete other classifieds, keep only 304, 303, 302
$pdo->exec("DELETE FROM classifieds WHERE id NOT IN (304, 303, 302)");
$pdo->exec("DELETE FROM classified_images WHERE classified_id NOT IN (304, 303, 302)");

echo "=== RESEEDED TO EXACT 3 AUCTIONS & 3 CLASSIFIEDS ===\n";
echo "Auctions Count: " . $pdo->query("SELECT COUNT(*) FROM auctions")->fetchColumn() . "\n";
echo "Classifieds Count: " . $pdo->query("SELECT COUNT(*) FROM classifieds")->fetchColumn() . "\n";
