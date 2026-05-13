import sqlite3InitModule from "@sqlite.org/sqlite-wasm";
import { runMigrations } from "./migrate";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DB = any;
type BindParam = string | number | null;

let db: DB | null = null;

async function init() {
  const sqlite3 = await sqlite3InitModule();
  if (typeof sqlite3.installOpfsSAHPoolVfs !== "function") {
    throw new Error("OPFS SAH Pool VFS is unavailable in this browser.");
  }
  const poolUtil = await sqlite3.installOpfsSAHPoolVfs({});
  db = new poolUtil.OpfsSAHPoolDb("/my-likes.db");
  runMigrations(db);
  (self as unknown as Worker).postMessage({ type: "ready" });
}

self.addEventListener("message", (e: Event) => {
  const { id, type, sql, bind, statements } = (e as MessageEvent).data;
  if (!db) {
    (self as unknown as Worker).postMessage({ id, ok: false, error: "DB not initialized" });
    return;
  }
  try {
    if (type === "exec") {
      db.exec({ sql, bind });
      (self as unknown as Worker).postMessage({ id, ok: true });
    } else if (type === "query") {
      const rows: Record<string, unknown>[] = [];
      db.exec({
        sql,
        bind,
        rowMode: "object",
        callback: (row: Record<string, unknown>) => rows.push({ ...row }),
      });
      (self as unknown as Worker).postMessage({ id, ok: true, rows });
    } else if (type === "queryOne") {
      let row: Record<string, unknown> | undefined;
      db.exec({
        sql,
        bind,
        rowMode: "object",
        callback: (r: Record<string, unknown>) => {
          if (!row) row = { ...r };
        },
      });
      (self as unknown as Worker).postMessage({ id, ok: true, row });
    } else if (type === "clearDb") {
      db.exec("DELETE FROM oembed_cache");
      db.exec("DELETE FROM media");
      db.exec("DELETE FROM likes");
      (self as unknown as Worker).postMessage({ id, ok: true });
    } else if (type === "batch") {
      db.exec("BEGIN");
      try {
        for (const { sql: s, bind: b } of statements as { sql: string; bind?: BindParam[] }[]) {
          db.exec({ sql: s, bind: b });
        }
        db.exec("COMMIT");
        (self as unknown as Worker).postMessage({ id, ok: true });
      } catch (err) {
        db.exec("ROLLBACK");
        throw err;
      }
    }
  } catch (err) {
    (self as unknown as Worker).postMessage({ id, ok: false, error: String(err) });
  }
});

init();
