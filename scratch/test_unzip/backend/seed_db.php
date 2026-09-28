<?php

$dbPath = __DIR__ . '/database/database.sqlite';
$pdo = new PDO("sqlite:" . $dbPath);
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

echo "Re-seeding SalvageReef database with 100% working high-resolution images...\n";

// Update all auction images to working Unsplash URLs
$pdo->exec("UPDATE auction_images SET image_path = 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80' WHERE id % 4 = 1");
$pdo->exec("UPDATE auction_images SET image_path = 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&auto=format&fit=crop&q=80' WHERE id % 4 = 2");
$pdo->exec("UPDATE auction_images SET image_path = 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=800&auto=format&fit=crop&q=80' WHERE id % 4 = 3");
$pdo->exec("UPDATE auction_images SET image_path = 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80' WHERE id % 4 = 0");

// Update all classified images to working Unsplash URLs
$pdo->exec("UPDATE classified_images SET image_path = 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80' WHERE id % 4 = 1");
$pdo->exec("UPDATE classified_images SET image_path = 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&auto=format&fit=crop&q=80' WHERE id % 4 = 2");
$pdo->exec("UPDATE classified_images SET image_path = 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80' WHERE id % 4 = 3");
$pdo->exec("UPDATE classified_images SET image_path = 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800&auto=format&fit=crop&q=80' WHERE id % 4 = 0");

echo "Database image URLs updated successfully!\n";
