import DbWorker from "./worker?worker";

type BindParam = string | number | null;

type WorkerResponse =
  | { type: "ready" }
  | { id: string; ok: true; rows?: Record<string, unknown>[]; row?: Record<string, unknown> }
  | { id: string; ok: false; error: string };

let _worker: Worker | null = null;
const _pending = new Map<string, { resolve: (v: unknown) => void; reject: (e: Error) => void }>();
let _readyResolve: (() => void) | null = null;
let _readyReject: ((e: Error) => void) | null = null;
const _readyPromise = new Promise<void>((res, rej) => {
  _readyResolve = res;
  _readyReject = rej;
});

function getWorker(): Worker {
  if (_worker) return _worker;
  _worker = new DbWorker();
  _worker.onerror = (e) => {
    _readyReject?.(new Error(e.message));
  };
  _worker.onmessage = (e: MessageEvent<WorkerResponse>) => {
    const msg = e.data;
    if ("type" in msg && msg.type === "ready") {
      _readyResolve?.();
      return;
    }
    const { id } = msg as { id: string };
    const p = _pending.get(id);
    if (!p) return;
    _pending.delete(id);
    if ((msg as { ok: boolean }).ok) {
      p.resolve(msg);
    } else {
      p.reject(new Error((msg as { error: string }).error));
    }
  };
  return _worker;
}

let _counter = 0;

function send(data: Record<string, unknown>): Promise<unknown> {
  const worker = getWorker();
  const id = String(++_counter);
  return new Promise((resolve, reject) => {
    _pending.set(id, { resolve, reject });
    worker.postMessage({ ...data, id });
  });
}

export interface DB {
  exec(sql: string, bind?: BindParam[]): Promise<void>;
  selectObjects(sql: string, bind?: BindParam[]): Promise<Record<string, unknown>[]>;
  selectObject(sql: string, bind?: BindParam[]): Promise<Record<string, unknown> | undefined>;
  batch(statements: { sql: string; bind?: BindParam[] }[]): Promise<void>;
}

export async function getDb(): Promise<DB> {
  getWorker();
  await _readyPromise;
  return {
    async exec(sql, bind) {
      await send({ type: "exec", sql, bind });
    },
    async selectObjects(sql, bind) {
      const res = (await send({ type: "query", sql, bind })) as {
        rows: Record<string, unknown>[];
      };
      return res.rows ?? [];
    },
    async selectObject(sql, bind) {
      const res = (await send({ type: "queryOne", sql, bind })) as {
        row?: Record<string, unknown>;
      };
      return res.row;
    },
    async batch(statements) {
      await send({ type: "batch", statements });
    },
  };
}
