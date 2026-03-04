import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const dataDir = path.join(__dirname, "../../data");
const dbPath = path.join(dataDir, "database.sqlite");

// Ensure data directory exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Create or open database
const db = new Database(dbPath);

// Initialize schema
db.exec(`
  CREATE TABLE IF NOT EXISTS urls (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    short_code TEXT NOT NULL UNIQUE,
    long_url TEXT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME,
    is_deleted INTEGER NOT NULL DEFAULT 0,
    deleted_at DATETIME
  );

  CREATE INDEX IF NOT EXISTS idx_urls_short_code
  ON urls(short_code);
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS clicks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    short_code TEXT NOT NULL,
    clicked_at DATETIME NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_clicks_short_code
  ON clicks(short_code);
`);

export default db;
