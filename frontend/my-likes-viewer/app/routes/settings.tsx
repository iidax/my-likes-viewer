import { useEffect, useState } from "react";

const LS_KEY = "x_bearer_token";

export function meta() {
  return [{ title: "設定 | My Likes Viewer" }];
}

export default function Settings() {
  const [apiKey, setApiKey] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setApiKey(localStorage.getItem(LS_KEY) ?? "");
  }, []);

  const handleSave = () => {
    if (apiKey) {
      localStorage.setItem(LS_KEY, apiKey);
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
        <label htmlFor="api-key" className="text-sm font-medium">
          X API Bearer Token
        </label>
        <p className="text-xs text-gray-500">
          画像取得でレート制限に引っかかった場合に使用します。
          ブラウザの localStorage に保存されます。
        </p>
        <input
          id="api-key"
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="Bearer token を入力"
          className="rounded border px-3 py-2 text-sm font-mono"
        />
        <button
          onClick={handleSave}
          className="mt-2 self-start rounded bg-blue-500 px-4 py-2 text-sm text-white hover:bg-blue-600"
        >
          保存
        </button>
        {saved && <p className="text-sm text-green-600">保存しました</p>}
      </div>
    </main>
  );
}
