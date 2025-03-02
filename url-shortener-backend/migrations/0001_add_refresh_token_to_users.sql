-- Migration number: 0001 2025-03-01T23:00:35.560Z
PRAGMA defer_foreign_keys=TRUE;
DROP TABLE IF EXISTS users;
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE,
  password TEXT,
  role TEXT DEFAULT 'user',
  refresh_token TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);