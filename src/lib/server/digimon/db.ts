import Database from 'better-sqlite3';
import { env } from '$env/dynamic/private';

let _db: Database.Database | null = null;

export function getSqliteDb() {
	if (_db) return _db;

	const databaseUrl = env.DATABASE_URL || 'digimon.db';
	const db = new Database(databaseUrl);

	// Keep identical schema shape to the React example (`server.ts`)
	db.exec(`
    CREATE TABLE IF NOT EXISTS digimon (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      image TEXT,
      level TEXT,
      attribute TEXT,
      type TEXT,
      field TEXT
    )
  `);

	_db = db;
	return db;
}
