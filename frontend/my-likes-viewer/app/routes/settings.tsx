import { useState } from "react";
import { getDb } from "../lib/db/client";
import { clearOembedMemCache } from "../utils/fetchOembed";

export function meta() {
  return [{ title: "設定 | My Likes Viewer" }];
}

export default function Settings() {
  const [clearing, setClearing] = useState(false);
  const [cleared, setCleared] = useState(false);

  const handleClearDb = async () => {
    if (!confirm("データベースをクリアしますか？すべてのいいねデータが削除されます。")) return;
    setClearing(true);
    try {
      const db = await getDb();
      await db.clearDb();
      clearOembedMemCache();
      setCleared(true);
      setTimeout(() => setCleared(false), 2000);
    } finally {
      setClearing(false);
    }
  };

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-6 text-xl font-semibold">設定</h1>

      <div className="flex flex-col gap-2">
        <h2 className="text-sm font-medium">データベース</h2>
        <p className="text-xs text-gray-500">ローカルのいいねデータをすべて削除します。</p>
        <button
          onClick={handleClearDb}
          disabled={clearing}
          className="mt-2 self-start rounded bg-red-500 px-4 py-2 text-sm text-white hover:bg-red-600 disabled:opacity-50"
        >
          {clearing ? "クリア中…" : "データベースをクリア"}
        </button>
        {cleared && <p className="text-sm text-green-600">クリアしました</p>}
      </div>
    </main>
  );
}
