<?php
$dbPath = __DIR__ . '/database/database.sqlite';
$pdo = new PDO('sqlite:' . $dbPath);
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

echo "Reseeding database with EXACT 7 verified lots and 4 verified classifieds...\n";

// Clear existing auctions, classifieds, images, bids
$pdo->exec("DELETE FROM bids");
$pdo->exec("DELETE FROM auction_images");
$pdo->exec("DELETE FROM auctions");
$pdo->exec("DELETE FROM classified_images");
$pdo->exec("DELETE FROM classifieds");

// 1. Insert 7 Auctions
$stmtAuc = $pdo->prepare("INSERT INTO auctions (id, title, slug, description, category_id, auction_type, status, quantity, unit, starting_price, current_highest_bid, bid_increment, start_time, end_time, location_city, location_state, is_group, created_by, winner_confirmed) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now', '-1 hour'), datetime('now', '+3 days'), ?, ?, ?, 1, 0)");

$stmtImg = $pdo->prepare("INSERT INTO auction_images (auction_id, image_path, is_primary) VALUES (?, ?, 1)");
$stmtBid = $pdo->prepare("INSERT INTO bids (id, auction_id, user_id, amount, status, created_at) VALUES (?, ?, ?, ?, 'approved', datetime('now', '-10 minutes'))");

// Lot 1: #999 (2-Minute Express Demo)
$stmtAuc->execute([999, '⚡ 2-Minute Express Demo Auction: 15 MT Industrial Copper Scrap', '2-minute-express-demo-copper-scrap', 'Special 2-minute express live auction demo with top 3 bidders (H1, H2, H3). Test winner selection desk in Admin Panel.', 2, 'public', 'live', 15, 'MT', 500000, 750000, 10000, 'Mumbai', 'Maharashtra', 0]);
$stmtImg->execute([999, 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80']);
$stmtBid->execute([901, 999, 2, 750000]);
$stmtBid->execute([902, 999, 1, 720000]);
$stmtBid->execute([903, 999, 4, 690000]);

// Lot 2: #101 (50 MT Copper Cable)
$stmtAuc->execute([101, '50 MT Industrial Copper Cable Scrap - Grade A Clean Wire', '50-mt-industrial-copper-cable-scrap-grade-a', 'Bulk lot of high-grade copper cables stripped from power sub-station dismantling. Inspection invited at Thane scrap yard. Purity verified at 99.2% Cu.', 2, 'public', 'live', 50, 'MT', 3500000, 4150000, 10000, 'Mumbai', 'Maharashtra', 0]);
$stmtImg->execute([101, 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80']);
$stmtBid->execute([501, 101, 2, 4150000]);
$stmtBid->execute([502, 101, 1, 3900000]);

// Lot 3: #102 (CNC Milling Machine)
$stmtAuc->execute([102, 'CNC Milling Machine 5-Axis (Industrial Plant Dismantling Surplus)', 'cnc-milling-machine-5-axis-surplus-equipment', 'Heavy duty Japanese manufactured 5-axis CNC Milling machine in prime working condition. Includes original control panel, tool changers, and coolant system.', 1, 'public', 'live', 2, 'nos', 8000000, 9200000, 25000, 'Mumbai', 'Maharashtra', 0]);
$stmtImg->execute([102, 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&auto=format&fit=crop&q=80']);
$stmtBid->execute([504, 102, 2, 9200000]);

// Lot 4: #103 (Private Tender 120 MT HMS)
$stmtAuc->execute([103, 'Private Corporate Tender: 120 MT Heavy Melting Steel (HMS 1 & 2)', 'private-corporate-tender-120-mt-hms-scrap', 'Confidential private tender for 120 MT HMS scrap generated from chemical plant dismantling near Pune. Corporate buyers must request access to bid.', 3, 'private', 'live', 120, 'MT', 4200000, 4800000, 15000, 'Pune', 'Maharashtra', 0]);
$stmtImg->execute([103, 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?w=800&auto=format&fit=crop&q=80']);

// Lot 5: #104 (Group Lot Textile Plant)
$stmtAuc->execute([104, 'Group Lot: Textile Plant Dismantling Motors & Boilers Lot', 'group-lot-textile-plant-dismantling-motors-boilers', 'Combined group lot tender comprising 50 heavy electric induction motors and 1 high pressure industrial boiler vessel. Can be bid as a whole lot.', 5, 'group', 'live', 1, 'Lot', 1500000, 1750000, 10000, 'Gujarat', 'Gujarat', 1]);
$stmtImg->execute([104, 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop&q=80']);
$stmtBid->execute([506, 104, 2, 1750000]);

// Lot 6: #105 (15 Tons Transformer Copper Coil)
$stmtAuc->execute([105, '15 Tons Electrical Transformer Copper Coil Scrap', '15-tons-electrical-transformer-copper-coil-scrap', 'Upcoming tender for 15 MT oil immersed power transformer core and copper coil scrap from power distribution company.', 2, 'public', 'upcoming', 15, 'Ton', 850000, 850000, 5000, 'Mumbai', 'Maharashtra', 0]);
$stmtImg->execute([105, 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=800&auto=format&fit=crop&q=80']);

// Lot 7: #108 (High-Voltage Substation Transformer Core)
$stmtAuc->execute([108, '⚡ High-Voltage Substation Transformer Core Scrap (Demo Auction)', 'high-voltage-substation-transformer-core-scrap-demo', 'DEMO AUCTION ITEM: 40 MT silicon steel laminations & high-voltage copper winding transformer core scrap from power grid substation upgrade.', 1, 'public', 'live', 40, 'MT', 1850000, 2100000, 10000, 'Navi Mumbai', 'Maharashtra', 0]);
$stmtImg->execute([108, 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80']);
$stmtBid->execute([511, 108, 2, 2100000]);

// 2. Insert 4 Classifieds
$stmtClass = $pdo->prepare("INSERT INTO classifieds (id, title, slug, description, category_id, price, quantity, unit, location_city, location_state, status, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'available', 1)");
$stmtClassImg = $pdo->prepare("INSERT INTO classified_images (classified_id, image_path, is_primary) VALUES (?, ?, 1)");

$stmtClass->execute([301, 'Heavy Duty Lathe Machine 10 Feet Bed (Running Condition)', 'heavy-duty-lathe-machine-10-feet-bed', '10 feet bed length heavy duty industrial lathe machine. Good spindle precision and motor condition. Available for immediate factory pick up in Thane west industrial zone.', 1, 185000, 1, 'nos', 'Mumbai', 'Maharashtra']);
$stmtClassImg->execute([301, 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80']);

$stmtClass->execute([302, 'Mixed Brass Shell & Valve Scrap - 3 Tons Lot', 'mixed-brass-shell-valve-scrap-3-tons', 'Clean sorted brass shell scrap, plumbing valves, and turning chips. Minimum order 1 MT or take complete 3 MT lot. High brass alloy percentage.', 2, 1250000, 3, 'MT', 'Bhiwandi', 'Maharashtra']);
$stmtClassImg->execute([302, 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?w=800&auto=format&fit=crop&q=80']);

$stmtClass->execute([303, 'Used 50 HP Kirloskar Diesel Generator Set with Acoustic Canopy', 'used-50-hp-kirloskar-diesel-generator-set', '50 HP Silent DG set with Kirloskar engine and Stamford alternator. Self start battery kit included. 1,400 running hours on meter.', 1, 240000, 1, 'nos', 'Pune', 'Maharashtra']);
$stmtClassImg->execute([303, 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop&q=80']);

$stmtClass->execute([304, 'Server Rack E-Waste Scrap Boards & Green Motherboards', 'server-rack-e-waste-scrap-boards-bulk-lot', 'Bulk lot of telecom and server motherboard scrap for gold and precious metal recovery. Gold plated pins intact.', 4, 95000, 500, 'kg', 'Mumbai', 'Maharashtra']);
$stmtClassImg->execute([304, 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80']);

echo "Done! Exactly 7 auctions and 4 classifieds seeded.\n";
