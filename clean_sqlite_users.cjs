const { DatabaseSync } = require('node:sqlite');
const paths = [
  'backend/database/database.sqlite',
  'deploy_hosting/public_html/backend/database/database.sqlite'
];

for (const dbPath of paths) {
  try {
    const db = new DatabaseSync(dbPath);
    // Remove old test accounts and users that were deleted on production
    db.exec(`
      DELETE FROM users WHERE 
        email LIKE '%test.bidder%' OR 
        email LIKE '%google.user%' OR 
        email LIKE '%_audit_%' OR 
        email IN ('agent@salvagereef.com', 'bidder@salvagereef.com', 'bidder2@salvagereef.com')
    `);
    
    // Check if demomater (demo@gmail.com) exists
    const existing = db.prepare("SELECT id FROM users WHERE email = 'demo@gmail.com'").get();
    if (!existing) {
      db.prepare(`
        INSERT INTO users (name, email, login_id, phone, role, company_name, city, state, is_verified, is_active, password, created_at)
        VALUES ('demomater', 'demo@gmail.com', 'SR-BIDDER-DEMO', '9867397191', 'bidder', 'demo', 'Mumbai', 'Maharashtra', 1, 1, '$2y$10$abcdefghijklmnopqrstuvwxyz123456', datetime('now'))
      `).run();
    }

    const count = db.prepare('SELECT count(*) as c FROM users').get();
    console.log(dbPath, 'Remaining users count:', count.c);
    const users = db.prepare('SELECT id, name, email, role FROM users').all();
    console.log('Users in', dbPath, ':', JSON.stringify(users, null, 2));
  } catch (err) {
    console.error('Error on', dbPath, ':', err);
  }
}
