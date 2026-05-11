import sqlite3InitModule from "@sqlite.org/sqlite-wasm";
import { runMigrations } from "./migrate";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DB = any;

let _db: DB | null = null;

export async function getDb(): Promise<DB> {
  if (_db) return _db;

  const sqlite3 = await sqlite3InitModule();

  if (sqlite3.capi.sqlite3_vfs_find("opfs")) {
    _db = new sqlite3.oo1.OpfsDb("/my-likes.db");
  } else {
    // COOP/COEP ヘッダーがない環境ではインメモリにフォールバック
    console.warn("OPFS unavailable: falling back to in-memory DB");
    _db = new sqlite3.oo1.DB();
  }

  runMigrations(_db);
  return _db;
}
