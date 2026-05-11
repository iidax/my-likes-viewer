// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DB = any;

const modules = import.meta.glob("./migrations/*.sql", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

const migrations = Object.entries(modules)
  .map(([path, sql]) => ({
    version: parseInt(path.match(/(\d+)/)?.[1] ?? "0"),
    sql,
  }))
  .sort((a, b) => a.version - b.version);

export function runMigrations(db: DB): void {
  db.exec(
    "CREATE TABLE IF NOT EXISTS _schema_version (version INTEGER NOT NULL)",
  );
  const row = db.selectObject(
    "SELECT COALESCE(MAX(version), 0) as v FROM _schema_version",
  );
  const current = row.v as number;

  for (const { version, sql } of migrations) {
    if (version <= current) continue;
    db.exec("BEGIN");
    db.exec(sql);
    db.exec(`INSERT INTO _schema_version VALUES (${version})`);
    db.exec("COMMIT");
  }
}
