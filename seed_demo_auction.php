<?php
foreach (['backend/database/database.sqlite', 'deploy_hosting/public_html/backend/database/database.sqlite'] as $dbRel) {
    $dbPath = __DIR__ . '/' . $dbRel;
    if (!file_exists($dbPath)) continue;
    $pdo = new PDO('sqlite:' . $dbPath);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $cols = $pdo->query('PRAGMA table_info(auctions)')->fetchAll(PDO::FETCH_ASSOC);
    $colNames = array_column($cols, 'name');

    $pdo->exec("DELETE FROM auctions WHERE id = 999");
    $pdo->exec("DELETE FROM auction_images WHERE auction_id = 999");
    $pdo->exec("DELETE FROM bids WHERE auction_id = 999");

    $insertData = [
        'id' => 999,
        'title' => '⚡ 7-Day Live Demo Auction: Industrial Copper Armoured Cables & Heavy Melting Steel Scrap Lot',
        'slug' => 'live-demo-auction-industrial-copper-cables',
        'description' => 'Official 7-Day Demo Auction Lot for live system testing, PDF spec sheet generation, 2-minute dynamic anti-sniping validation, and multi-user bidding verification. Lot contains sorted commercial grade heavy melting steel (HMS 1 & 2) and high-conductivity copper armoured power cables.',
        'category_id' => 2,
        'auction_type' => 'public',
        'status' => 'live',
        'quantity' => 45,
        'unit' => 'MT',
        'starting_price' => 500000,
        'emd_amount' => 50000,
        'current_highest_bid' => 750000,
        'bid_increment' => 10000,
        'location_city' => 'Mumbai',
        'location_state' => 'Maharashtra',
        'created_by' => 1,
        'winner_confirmed' => 0
    ];

    $availableData = [];
    foreach ($insertData as $k => $v) {
        if (in_array($k, $colNames)) {
            $availableData[$k] = $v;
        }
    }

    $fields = array_keys($availableData);
    $placeholders = array_fill(0, count($fields), '?');

    $sql = "INSERT INTO auctions (" . implode(', ', $fields) . ", start_time, end_time) VALUES (" . implode(', ', $placeholders) . ", datetime('now'), datetime('now', '+7 days'))";
    $stmt = $pdo->prepare($sql);
    $stmt->execute(array_values($availableData));

    $pdo->exec("INSERT INTO auction_images (auction_id, image_path, is_primary) VALUES 
        (999, 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80', 1),
        (999, 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&auto=format&fit=crop&q=80', 0),
        (999, 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80', 0)
    ");

    $pdo->exec("INSERT INTO bids (auction_id, user_id, amount, status, created_at) VALUES 
        (999, 2, 750000, 'approved', datetime('now', '-2 hours'))
    ");

    echo "✔ Successfully inserted 1-Week Demo Auction into " . $dbRel . "\n";
}

