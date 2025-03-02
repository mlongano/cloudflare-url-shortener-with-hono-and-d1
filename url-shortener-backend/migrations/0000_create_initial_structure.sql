-- Migration number: 0000 	 2025-03-01T22:55:39.457Z
PRAGMA defer_foreign_keys=TRUE;
DROP TABLE IF EXISTS users;
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE,
  password TEXT,
  role TEXT DEFAULT 'user',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS subscriptions;
CREATE TABLE subscriptions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  tier TEXT,
  active BOOLEAN,
  expires_at DATETIME,
  vanity_urls_quota INTEGER DEFAULT 0,
  vanity_urls_used INTEGER DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES users(id),
  CHECK (vanity_urls_used <= vanity_urls_quota)
);

DROP TABLE IF EXISTS urls;
CREATE TABLE urls (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  original_url TEXT NOT NULL,
  short_url TEXT UNIQUE NOT NULL,
  user_id INTEGER,
  team_id INTEGER,
  ownership_type TEXT CHECK (ownership_type IN ('personal', 'team')),
  is_vanity BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (team_id) REFERENCES teams(id),
  -- Ensure URL belongs to either user OR team, not both
  CHECK (
    (ownership_type = 'personal' AND user_id IS NOT NULL AND team_id IS NULL) OR
    (ownership_type = 'team' AND team_id IS NOT NULL AND user_id IS NULL)
  )
);

DROP TABLE IF EXISTS team_url_permissions;
CREATE TABLE team_url_permissions (
  url_id INTEGER,
  team_member_id INTEGER,
  can_edit BOOLEAN DEFAULT FALSE,
  can_delete BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (url_id) REFERENCES urls(id),
  FOREIGN KEY (team_member_id) REFERENCES team_members(id),
  PRIMARY KEY (url_id, team_member_id)
);

DROP TABLE IF EXISTS teams;
CREATE TABLE teams (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  owner_id INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (owner_id) REFERENCES users(id)
);

DROP TABLE IF EXISTS team_members;
CREATE TABLE team_members (
  team_id INTEGER,
  user_id INTEGER,
  FOREIGN KEY (team_id) REFERENCES teams(id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  PRIMARY KEY (team_id, user_id)
);