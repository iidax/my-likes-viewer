import { useEffect, useState } from "react";
import { getDb } from "../lib/db/client";
import { clearOembedMemCache } from "../utils/fetchOembed";

const LS_KEY = "x_bearer_token";

export function meta() {
  return [{ title: "設定 | My Likes Viewer" }];
}

export default function Settings() {
  const [bearerToken, setBearerToken] = useState("");
  const [saved, setSaved] = useState(false);
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

  useEffect(() => {
    setBearerToken(localStorage.getItem(LS_KEY) ?? "");
  }, []);

  const handleSaveBearerToken = () => {
    if (bearerToken) {
      localStorage.setItem(LS_KEY, bearerToken);
    } else {
      localStorage.removeItem(LS_KEY);
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-6 text-xl font-semibold">設定</h1>

      <div className="flex flex-col gap-2">
        <label htmlFor="bearer-token" className="text-sm font-medium">
          X API Bearer Token
        </label>
        <p className="text-xs text-gray-500">
          画像取得でレート制限に引っかかった場合に使用します。
          ブラウザの localStorage に保存されます。
        </p>
        <input
          id="bearer-token"
          type="password"
          value={bearerToken}
          onChange={(e) => setBearerToken(e.target.value)}
          placeholder="Bearer token を入力"
          className="rounded border px-3 py-2 text-sm font-mono"
        />
        <button
          onClick={handleSaveBearerToken}
          className="mt-2 self-start rounded bg-blue-500 px-4 py-2 text-sm text-white hover:bg-blue-600"
        >
          保存
        </button>
        {saved && <p className="text-sm text-green-600">保存しました</p>}
      </div>

      <div className="mt-10 flex flex-col gap-2 border-t pt-8">
        <h2 className="text-sm font-medium">データベース</h2>
        <p className="text-xs text-gray-500">
          ローカルのいいねデータをすべて削除します。
        </p>
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
