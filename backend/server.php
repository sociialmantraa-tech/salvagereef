<?php

// Enable CORS for Vite frontend
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'];

// Connect to SQLite Database
$dbPath = __DIR__ . '/database/database.sqlite';
try {
    $pdo = new PDO("sqlite:" . $dbPath);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]);
    exit;
}

// Helper to send JSON response
function jsonResponse($data, $code = 200) {
    http_response_code($code);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit;
}

// Helper to authenticate user via Bearer token
function getAuthUser($pdo) {
    $headers = getallheaders();
    $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
    if (preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
        $token = $matches[1];
        $stmt = $pdo->prepare("SELECT u.* FROM users u JOIN personal_access_tokens t ON u.id = t.tokenable_id WHERE t.token = ?");
        $stmt->execute([$token]);
        return $stmt->fetch();
    }
    return null;
}

// -------------------------------------------------------------
// REST API ROUTES (/api/v1)
// -------------------------------------------------------------

// 1. Auth Register: POST /api/v1/auth/register (Generates Email OTP & Phone OTP)
if ($method === 'POST' && $uri === '/api/v1/auth/register') {
    $body = json_decode(file_get_contents('php://input'), true);
    if (empty($body['name']) || empty($body['email']) || empty($body['password']) || empty($body['phone'])) {
        jsonResponse(['message' => 'Name, email, phone, and password are required'], 422);
    }

    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$body['email']]);
    if ($stmt->fetch()) {
        jsonResponse(['message' => 'Email already registered'], 422);
    }

    $passHash = password_hash($body['password'], PASSWORD_DEFAULT);
    
    // Generate 6-digit OTPs
    $emailOtp = (string) mt_rand(100000, 999999);
    $phoneOtp = (string) mt_rand(100000, 999999);

    $stmt = $pdo->prepare("INSERT INTO users (name, email, phone, password, role, company_name, city, state, is_verified, is_email_verified, is_phone_verified, email_otp, phone_otp) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, 0, 0, ?, ?)");
    $stmt->execute([
        $body['name'],
        $body['email'],
        $body['phone'],
        $passHash,
        $body['role'] ?? 'bidder',
        $body['company_name'] ?? null,
        $body['city'] ?? 'Thane',
        $body['state'] ?? 'Maharashtra',
        $emailOtp,
        $phoneOtp
    ]);

    $userId = $pdo->lastInsertId();

    $stmtUser = $pdo->prepare("SELECT id, name, email, phone, role, company_name, city, state, is_verified, is_email_verified, is_phone_verified FROM users WHERE id = ?");
    $stmtUser->execute([$userId]);
    $user = $stmtUser->fetch();

    jsonResponse([
        'message' => 'Registration initiated. Verification OTPs sent to your Email and Phone.',
        'user' => $user,
        'email_otp' => $emailOtp,
        'phone_otp' => $phoneOtp,
        'requires_verification' => true
    ], 201);
}

// 2. Verify Email OTP: POST /api/v1/auth/verify-email-otp
if ($method === 'POST' && $uri === '/api/v1/auth/verify-email-otp') {
    $body = json_decode(file_get_contents('php://input'), true);
    $email = $body['email'] ?? '';
    $otp = trim($body['otp'] ?? '');

    $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if (!$user) jsonResponse(['message' => 'User not found'], 404);

    if ($user['email_otp'] !== $otp) {
        jsonResponse(['message' => 'Invalid Email OTP code. Please check and try again.'], 422);
    }

    $pdo->prepare("UPDATE users SET is_email_verified = 1 WHERE id = ?")->execute([$user['id']]);

    // Check if phone is also verified
    $stmtRefreshed = $pdo->prepare("SELECT * FROM users WHERE id = ?");
    $stmtRefreshed->execute([$user['id']]);
    $refreshed = $stmtRefreshed->fetch();

    $token = null;
    if ($refreshed['is_phone_verified'] == 1) {
        $pdo->prepare("UPDATE users SET is_verified = 1 WHERE id = ?")->execute([$user['id']]);
        $token = bin2hex(random_bytes(32));
        $pdo->prepare("INSERT INTO personal_access_tokens (tokenable_type, tokenable_id, name, token) VALUES ('App\\\\Models\\\\User', ?, 'auth_token', ?)")
            ->execute([$user['id'], $token]);
    }

    unset($refreshed['password']);
    jsonResponse([
        'message' => 'Email address verified successfully!',
        'user' => $refreshed,
        'token' => $token,
        'is_email_verified' => true,
        'is_phone_verified' => (bool)$refreshed['is_phone_verified'],
        'is_fully_verified' => (bool)($refreshed['is_email_verified'] && refreshed['is_phone_verified'])
    ]);
}

// 3. Verify Phone OTP: POST /api/v1/auth/verify-phone-otp
if ($method === 'POST' && $uri === '/api/v1/auth/verify-phone-otp') {
    $body = json_decode(file_get_contents('php://input'), true);
    $email = $body['email'] ?? '';
    $otp = trim($body['otp'] ?? '');

    $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if (!$user) jsonResponse(['message' => 'User not found'], 404);

    if ($user['phone_otp'] !== $otp) {
        jsonResponse(['message' => 'Invalid Phone OTP code. Please check and try again.'], 422);
    }

    $pdo->prepare("UPDATE users SET is_phone_verified = 1 WHERE id = ?")->execute([$user['id']]);

    // Check if email is also verified
    $stmtRefreshed = $pdo->prepare("SELECT * FROM users WHERE id = ?");
    $stmtRefreshed->execute([$user['id']]);
    $refreshed = $stmtRefreshed->fetch();

    $token = null;
    if ($refreshed['is_email_verified'] == 1) {
        $pdo->prepare("UPDATE users SET is_verified = 1 WHERE id = ?")->execute([$user['id']]);
        $token = bin2hex(random_bytes(32));
        $pdo->prepare("INSERT INTO personal_access_tokens (tokenable_type, tokenable_id, name, token) VALUES ('App\\\\Models\\\\User', ?, 'auth_token', ?)")
            ->execute([$user['id'], $token]);
    }

    unset($refreshed['password']);
    jsonResponse([
        'message' => 'Mobile number verified successfully!',
        'user' => $refreshed,
        'token' => $token,
        'is_phone_verified' => true,
        'is_email_verified' => (bool)$refreshed['is_email_verified'],
        'is_fully_verified' => (bool)($refreshed['is_email_verified'] && $refreshed['is_phone_verified'])
    ]);
}

// 4. Resend OTP: POST /api/v1/auth/resend-otp
if ($method === 'POST' && $uri === '/api/v1/auth/resend-otp') {
    $body = json_decode(file_get_contents('php://input'), true);
    $email = $body['email'] ?? '';

    $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if (!$user) jsonResponse(['message' => 'User not found'], 404);

    $emailOtp = (string) mt_rand(100000, 999999);
    $phoneOtp = (string) mt_rand(100000, 999999);

    $pdo->prepare("UPDATE users SET email_otp = ?, phone_otp = ? WHERE id = ?")->execute([$emailOtp, $phoneOtp, $user['id']]);

    jsonResponse([
        'message' => 'New verification OTPs generated.',
        'email_otp' => $emailOtp,
        'phone_otp' => $phoneOtp
    ]);
}

// 5. Auth Login: POST /api/v1/auth/login
if ($method === 'POST' && $uri === '/api/v1/auth/login') {
    $body = json_decode(file_get_contents('php://input'), true);
    if (empty($body['email']) || empty($body['password'])) {
        jsonResponse(['message' => 'Email and password required'], 422);
    }

    $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
    $stmt->execute([$body['email']]);
    $user = $stmt->fetch();

    if (!$user || !password_verify($body['password'], $user['password'])) {
        jsonResponse(['message' => 'Invalid email or password'], 422);
    }

    $token = bin2hex(random_bytes(32));
    $pdo->prepare("INSERT INTO personal_access_tokens (tokenable_type, tokenable_id, name, token) VALUES ('App\\\\Models\\\\User', ?, 'auth_token', ?)")
        ->execute([$user['id'], $token]);

    unset($user['password']);
    jsonResponse(['message' => 'Login successful', 'user' => $user, 'token' => $token]);
}

// 6. Auth Me: GET /api/v1/auth/me
if ($method === 'GET' && $uri === '/api/v1/auth/me') {
    $user = getAuthUser($pdo);
    if (!$user) jsonResponse(['message' => 'Unauthenticated'], 401);
    unset($user['password']);
    jsonResponse(['user' => $user]);
}

// 7. Auth Logout: POST /api/v1/auth/logout
if ($method === 'POST' && $uri === '/api/v1/auth/logout') {
    $headers = getallheaders();
    $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
    if (preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
        $pdo->prepare("DELETE FROM personal_access_tokens WHERE token = ?")->execute([$matches[1]]);
    }
    jsonResponse(['message' => 'Logged out successfully']);
}

// 8. Categories: GET /api/v1/categories
if ($method === 'GET' && $uri === '/api/v1/categories') {
    $stmt = $pdo->query("SELECT c.*, 
        (SELECT COUNT(*) FROM auctions a WHERE a.category_id = c.id) as auctions_count,
        (SELECT COUNT(*) FROM classifieds cl WHERE cl.category_id = c.id) as classifieds_count
        FROM categories c");
    jsonResponse($stmt->fetchAll());
}

// 9. Auctions List: GET /api/v1/auctions
if ($method === 'GET' && $uri === '/api/v1/auctions') {
    $sql = "SELECT a.*, c.name as category_name, c.slug as category_slug,
            img.image_path as primary_image_url,
            u.name as creator_name, u.company_name as creator_company
            FROM auctions a
            LEFT JOIN categories c ON a.category_id = c.id
            LEFT JOIN auction_images img ON img.auction_id = a.id AND img.is_primary = 1
            LEFT JOIN users u ON a.created_by = u.id
            WHERE 1=1";
    $params = [];

    if (!empty($_GET['category_id'])) {
        $sql .= " AND a.category_id = ?";
        $params[] = $_GET['category_id'];
    }
    if (!empty($_GET['auction_type'])) {
        $sql .= " AND a.auction_type = ?";
        $params[] = $_GET['auction_type'];
    }
    if (!empty($_GET['status'])) {
        $sql .= " AND a.status = ?";
        $params[] = $_GET['status'];
    }
    if (!empty($_GET['location'])) {
        $sql .= " AND (a.location_city LIKE ? OR a.location_state LIKE ?)";
        $params[] = '%' . $_GET['location'] . '%';
        $params[] = '%' . $_GET['location'] . '%';
    }
    if (!empty($_GET['search'])) {
        $sql .= " AND a.title LIKE ?";
        $params[] = '%' . $_GET['search'] . '%';
    }

    $sql .= " ORDER BY a.id DESC";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $items = $stmt->fetchAll();

    foreach ($items as &$item) {
        $item['category'] = ['id' => $item['category_id'], 'name' => $item['category_name'], 'slug' => $item['category_slug']];
        $item['primary_image'] = ['image_path' => $item['primary_image_url']];
        $item['creator'] = ['id' => $item['created_by'], 'name' => $item['creator_name'], 'company_name' => $item['creator_company']];
    }

    jsonResponse(['data' => $items, 'total' => count($items)]);
}

// 10. Auction Detail: GET /api/v1/auctions/{slug}
if ($method === 'GET' && preg_match('#^/api/v1/auctions/([^/]+)$#', $uri, $m)) {
    $identifier = urldecode($m[1]);
    $stmt = $pdo->prepare("SELECT a.*, c.name as category_name FROM auctions a LEFT JOIN categories c ON a.category_id = c.id WHERE a.slug = ? OR a.id = ?");
    $stmt->execute([$identifier, $identifier]);
    $auction = $stmt->fetch();

    if (!$auction) jsonResponse(['message' => 'Auction not found'], 404);

    $stmtImg = $pdo->prepare("SELECT * FROM auction_images WHERE auction_id = ?");
    $stmtImg->execute([$auction['id']]);
    $auction['images'] = $stmtImg->fetchAll();

    $stmtBids = $pdo->prepare("SELECT b.*, u.name as bidder_name FROM bids b JOIN users u ON b.user_id = u.id WHERE b.auction_id = ? ORDER BY b.amount DESC LIMIT 10");
    $stmtBids->execute([$auction['id']]);
    $auction['bids'] = array_map(function($b) {
        return ['id' => $b['id'], 'amount' => (float)$b['amount'], 'user' => ['name' => $b['bidder_name']], 'created_at' => $b['created_at']];
    }, $stmtBids->fetchAll());

    $auction['group_children'] = [];
    if ($auction['is_group']) {
        $stmtChild = $pdo->prepare("SELECT id, title, slug, starting_price FROM auctions WHERE group_id = ?");
        $stmtChild->execute([$auction['id']]);
        $auction['group_children'] = $stmtChild->fetchAll();
    }

    $user = getAuthUser($pdo);
    $isUnlocked = true;
    if ($auction['auction_type'] === 'private') {
        if (!$user) {
            $isUnlocked = false;
        } elseif ($user['id'] != $auction['created_by'] && $user['role'] !== 'admin') {
            $stmtInt = $pdo->prepare("SELECT id FROM enquiry_or_interests WHERE auction_id = ? AND user_id = ? AND status = 'approved'");
            $stmtInt->execute([$auction['id'], $user['id']]);
            if (!$stmtInt->fetch()) $isUnlocked = false;
        }
    }

    $auction['category'] = ['name' => $auction['category_name']];

    jsonResponse(['auction' => $auction, 'is_unlocked' => $isUnlocked, 'server_time' => date('c')]);
}

// 11. Place Bid: POST /api/v1/auctions/{id}/bid
if ($method === 'POST' && preg_match('#^/api/v1/auctions/(\d+)/bid$#', $uri, $m)) {
    $auctionId = (int)$m[1];
    $user = getAuthUser($pdo);
    if (!$user) jsonResponse(['message' => 'Unauthenticated'], 401);

    $body = json_decode(file_get_contents('php://input'), true);
    $bidAmount = (float)($body['amount'] ?? 0);

    if ($bidAmount <= 0) jsonResponse(['message' => 'Valid positive bid amount required'], 422);

    $pdo->beginTransaction();
    try {
        $stmt = $pdo->prepare("SELECT * FROM auctions WHERE id = ?");
        $stmt->execute([$auctionId]);
        $auction = $stmt->fetch();

        if (!$auction) {
            $pdo->rollBack();
            jsonResponse(['message' => 'Auction not found'], 404);
        }

        if ($auction['status'] !== 'live') {
            $pdo->rollBack();
            jsonResponse(['message' => 'Bidding is closed on this lot'], 422);
        }

        if ($user['id'] == $auction['created_by']) {
            $pdo->rollBack();
            jsonResponse(['message' => 'You cannot bid on your own auction lot'], 422);
        }

        $highest = $auction['current_highest_bid'] ? (float)$auction['current_highest_bid'] : (float)$auction['starting_price'];

        if ($bidAmount <= $highest) {
            $pdo->rollBack();
            jsonResponse(['message' => 'Your bid must be strictly higher than current highest ₹' . number_format($highest, 2)], 422);
        }

        $now = date('Y-m-d H:i:s');
        $stmtInsert = $pdo->prepare("INSERT INTO bids (auction_id, user_id, amount, created_at) VALUES (?, ?, ?, ?)");
        $stmtInsert->execute([$auctionId, $user['id'], $bidAmount, $now]);

        $stmtUpdate = $pdo->prepare("UPDATE auctions SET current_highest_bid = ? WHERE id = ?");
        $stmtUpdate->execute([$bidAmount, $auctionId]);

        $pdo->commit();

        jsonResponse([
            'message' => 'Bid placed successfully!',
            'current_highest_bid' => $bidAmount,
            'bid' => ['amount' => $bidAmount, 'bidder_name' => $user['name'], 'created_at' => $now]
        ]);
    } catch (Exception $e) {
        $pdo->rollBack();
        jsonResponse(['message' => 'Transaction error: ' . $e->getMessage()], 500);
    }
}

// 12. Express Interest: POST /api/v1/auctions/{id}/interest
if ($method === 'POST' && preg_match('#^/api/v1/auctions/(\d+)/interest$#', $uri, $m)) {
    $auctionId = (int)$m[1];
    $user = getAuthUser($pdo);
    if (!$user) jsonResponse(['message' => 'Unauthenticated'], 401);

    $body = json_decode(file_get_contents('php://input'), true);
    $msg = $body['message'] ?? 'Requesting access for private auction lot';

    $stmt = $pdo->prepare("INSERT INTO enquiry_or_interests (auction_id, user_id, message, status) VALUES (?, ?, ?, 'pending')");
    $stmt->execute([$auctionId, $user['id'], $msg]);

    jsonResponse(['message' => 'Interest submitted successfully! Pending approval.']);
}

// 13. Classifieds List: GET /api/v1/classifieds
if ($method === 'GET' && $uri === '/api/v1/classifieds') {
    $sql = "SELECT cl.*, c.name as category_name, img.image_path as primary_image_url
            FROM classifieds cl
            LEFT JOIN categories c ON cl.category_id = c.id
            LEFT JOIN classified_images img ON img.classified_id = cl.id AND img.is_primary = 1
            WHERE cl.status = 'available' ORDER BY cl.id DESC";
    $stmt = $pdo->query($sql);
    $items = $stmt->fetchAll();

    foreach ($items as &$item) {
        $item['category'] = ['name' => $item['category_name']];
        $item['primary_image'] = ['image_path' => $item['primary_image_url']];
    }

    jsonResponse(['data' => $items]);
}

// 14. Classified Detail: GET /api/v1/classifieds/{slug}
if ($method === 'GET' && preg_match('#^/api/v1/classifieds/([^/]+)$#', $uri, $m)) {
    $identifier = urldecode($m[1]);
    $stmt = $pdo->prepare("SELECT cl.*, c.name as category_name, u.name as creator_name, u.phone as creator_phone, u.email as creator_email, u.company_name as creator_company
            FROM classifieds cl
            LEFT JOIN categories c ON cl.category_id = c.id
            LEFT JOIN users u ON cl.created_by = u.id
            WHERE cl.slug = ? OR cl.id = ?");
    $stmt->execute([$identifier, $identifier]);
    $classified = $stmt->fetch();

    if (!$classified) jsonResponse(['message' => 'Classified item not found'], 404);

    $stmtImg = $pdo->prepare("SELECT * FROM classified_images WHERE classified_id = ?");
    $stmtImg->execute([$classified['id']]);
    $classified['images'] = $stmtImg->fetchAll();
    $classified['category'] = ['name' => $classified['category_name']];
    $classified['creator'] = ['name' => $classified['creator_name'], 'phone' => $classified['creator_phone'], 'email' => $classified['creator_email'], 'company_name' => $classified['creator_company']];

    jsonResponse($classified);
}

// 15. Post Classified Listing: POST /api/v1/classifieds/post-listing
if ($method === 'POST' && $uri === '/api/v1/classifieds/post-listing') {
    $user = getAuthUser($pdo);
    if (!$user) jsonResponse(['message' => 'Unauthenticated'], 401);

    $body = json_decode(file_get_contents('php://input'), true);
    if (empty($body['title']) || empty($body['price']) || empty($body['category_id'])) {
        jsonResponse(['message' => 'Title, category, and price are required'], 422);
    }

    $slug = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $body['title']))) . '-' . substr(md5(uniqid()), 0, 5);

    $stmt = $pdo->prepare("INSERT INTO classifieds (title, slug, description, category_id, price, quantity, unit, location_city, location_state, status, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'available', ?)");
    $stmt->execute([
        $body['title'],
        $slug,
        $body['description'] ?? '',
        $body['category_id'],
        $body['price'],
        $body['quantity'] ?? 1,
        $body['unit'] ?? 'nos',
        $body['location_city'] ?? 'Thane',
        $body['location_state'] ?? 'Maharashtra',
        $user['id']
    ]);

    $id = $pdo->lastInsertId();
    if (!empty($body['image_url'])) {
        $pdo->prepare("INSERT INTO classified_images (classified_id, image_path, is_primary) VALUES (?, ?, 1)")
            ->execute([$id, $body['image_url']]);
    }

    jsonResponse(['id' => $id, 'slug' => $slug, 'title' => $body['title']], 201);
}

// 16. User Dashboard Data: GET /api/v1/user/dashboard
if ($method === 'GET' && $uri === '/api/v1/user/dashboard') {
    $user = getAuthUser($pdo);
    if (!$user) jsonResponse(['message' => 'Unauthenticated'], 401);

    $stmtBids = $pdo->prepare("SELECT b.*, a.title as auction_title, a.slug as auction_slug, a.status as auction_status, a.current_highest_bid
                               FROM bids b JOIN auctions a ON b.auction_id = a.id
                               WHERE b.user_id = ? ORDER BY b.created_at DESC LIMIT 15");
    $stmtBids->execute([$user['id']]);
    $rawBids = $stmtBids->fetchAll();

    $activeCount = count(array_unique(array_column($rawBids, 'auction_id')));
    $wonCount = 0;
    $recentBidsList = [];

    foreach ($rawBids as $b) {
        $myStatus = 'active';
        if ($b['auction_status'] === 'closed') {
            if ($b['current_highest_bid'] == $b['amount']) {
                $myStatus = 'won';
                $wonCount++;
            } else {
                $myStatus = 'lost';
            }
        } else {
            if ($b['current_highest_bid'] == $b['amount']) {
                $myStatus = 'winning';
            } else {
                $myStatus = 'outbid';
            }
        }

        $recentBidsList[] = [
            'id' => $b['id'],
            'auction_id' => $b['auction_id'],
            'auction_title' => $b['auction_title'],
            'auction_slug' => $b['auction_slug'],
            'bid_amount' => (float)$b['amount'],
            'my_status' => $myStatus,
            'created_at' => $b['created_at']
        ];
    }

    $stmtListings = $pdo->prepare("SELECT * FROM classifieds WHERE created_by = ? ORDER BY id DESC");
    $stmtListings->execute([$user['id']]);
    $myListings = $stmtListings->fetchAll();

    jsonResponse([
        'stats' => ['active_bids' => $activeCount, 'auctions_won' => $wonCount, 'watchlist_count' => count($recentBidsList)],
        'recent_bids' => $recentBidsList,
        'my_listings' => $myListings
    ]);
}

// 17. Admin Stats: GET /api/v1/admin/dashboard/stats
if ($method === 'GET' && $uri === '/api/v1/admin/dashboard/stats') {
    $user = getAuthUser($pdo);
    if (!$user || $user['role'] !== 'admin') jsonResponse(['message' => 'Admin required'], 403);

    $liveCount = $pdo->query("SELECT COUNT(*) FROM auctions WHERE status = 'live'")->fetchColumn();
    $bidsToday = $pdo->query("SELECT COUNT(*) FROM bids WHERE DATE(created_at) = DATE('now')")->fetchColumn();
    $newUsers = $pdo->query("SELECT COUNT(*) FROM users WHERE created_at >= DATE('now', '-7 days')")->fetchColumn();
    $pendingApprovals = $pdo->query("SELECT COUNT(*) FROM enquiry_or_interests WHERE status = 'pending'")->fetchColumn();

    $stmtNeeding = $pdo->query("SELECT a.*, c.name as category_name FROM auctions a LEFT JOIN categories c ON a.category_id = c.id WHERE a.status = 'live' ORDER BY a.end_time ASC LIMIT 10");
    $needing = $stmtNeeding->fetchAll();

    foreach ($needing as &$n) {
        $stmtInt = $pdo->prepare("SELECT e.*, u.name as user_name FROM enquiry_or_interests e JOIN users u ON e.user_id = u.id WHERE e.auction_id = ? AND e.status = 'pending'");
        $stmtInt->execute([$n['id']]);
        $n['interests'] = array_map(function($i){ return ['id' => $i['id'], 'user' => ['name' => $i['user_name']]]; }, $stmtInt->fetchAll());
    }

    jsonResponse([
        'stats' => [
            'total_auctions_live' => (int)$liveCount,
            'total_bids_today' => (int)$bidsToday,
            'new_users_this_week' => (int)$newUsers,
            'pending_approvals' => (int)$pendingApprovals
        ],
        'needing_attention' => $needing
    ]);
}

// 18. Admin Approve Interest: PUT /api/v1/admin/interests/{id}/approve
if ($method === 'PUT' && preg_match('#^/api/v1/admin/interests/(\d+)/approve$#', $uri, $m)) {
    $user = getAuthUser($pdo);
    if (!$user || $user['role'] !== 'admin') jsonResponse(['message' => 'Admin required'], 403);

    $body = json_decode(file_get_contents('php://input'), true);
    $status = $body['status'] ?? 'approved';

    $stmt = $pdo->prepare("UPDATE enquiry_or_interests SET status = ? WHERE id = ?");
    $stmt->execute([$status, $m[1]]);

    jsonResponse(['message' => 'Interest updated']);
}

// Fallback 404
jsonResponse(['message' => 'Endpoint not found'], 404);
