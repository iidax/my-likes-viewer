import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router";
import { LikesTable } from "../components/LikesTable";
import { UPLOAD_PAGE_SIZE } from "../constants";
import { countLikes, hasLikes, insertLikes, queryLikes } from "../lib/db/likes";
import type { Like } from "../types";
import { parseLikesJS } from "../utils/parseLikesJS";

export function meta() {
  return [{ title: "アップロード | My Likes Viewer" }];
}

const UPLOAD_PAGE_KEY = "uploadTablePage";

export default function Upload() {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [showDialog, setShowDialog] = useState(false);

  const [tableData, setTableData] = useState<Like[]>([]);
  const [tablePage, setTablePage] = useState(0);
  const [tableTotal, setTableTotal] = useState(0);

  const loadTablePage = useCallback(async (page: number) => {
    const [rows, count] = await Promise.all([
      queryLikes({ page, pageSize: UPLOAD_PAGE_SIZE }),
      countLikes(),
    ]);
    setTableData(rows);
    setTableTotal(count);
    setTablePage(page);
    sessionStorage.setItem(UPLOAD_PAGE_KEY, String(page));
  }, []);

  useEffect(() => {
    hasLikes().then((has) => {
      if (!has) return;
      const saved = parseInt(sessionStorage.getItem(UPLOAD_PAGE_KEY) ?? "0");
      loadTablePage(saved);
    });
  }, [loadTablePage]);

  const handleFile = (file: File) => {
    setStatus("loading");
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        const likes = parseLikesJS(content);
        const isFirst = tableTotal === 0;
        await insertLikes(likes);
        setStatus("idle");
        await loadTablePage(0);
        if (isFirst) setShowDialog(true);
      } catch (err) {
        setErrorMsg(
          err instanceof Error ? err.message : "予期しないエラーが発生しました",
        );
        setStatus("error");
      }
    };
    reader.readAsText(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="mb-2 text-xl font-semibold">likes.js をアップロード</h1>
      <p className="mb-3 text-sm text-gray-500">
        X のデータアーカイブに含まれる{" "}
        <code className="rounded bg-gray-100 px-1">data/like.js</code>{" "}
        を選択してください。
      </p>
      <details className="mb-6 text-sm text-gray-500">
        <summary className="cursor-pointer select-none hover:text-gray-700">
          like.js ファイルの内容例
        </summary>
        <pre className="mt-2 overflow-x-auto rounded-lg bg-gray-50 p-4 text-xs leading-relaxed text-gray-600">{`window.YTD.like.part0 = [
  {
    "like": {
      "tweetId": "1234567890123456789",
      "fullText": "ツイートのテキスト内容",
      "expandedUrl": "https://twitter.com/i/web/status/1234567890123456789"
    }
  },
  ...
]`}</pre>
      </details>

      <label className="flex cursor-pointer flex-col items-center gap-3 rounded-lg border-2 border-dashed border-gray-300 p-10 hover:border-blue-400">
        <span className="text-gray-500">
          {status === "loading" ? "読み込み中..." : "ファイルを選択"}
        </span>
        <input
          ref={inputRef}
          type="file"
          accept=".js"
          onChange={handleChange}
          disabled={status === "loading"}
          className="hidden"
        />
      </label>

      {status === "error" && (
        <p className="mt-4 text-sm text-red-500">{errorMsg}</p>
      )}

      {tableData.length > 0 && (
        <section className="mt-10">
          <h1 className="mb-2 text-xl font-semibold">プレビュー</h1>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-800">
              {tableTotal.toLocaleString()} 件のデータが読み込まれています
            </h2>
            <Link to="/" className="text-sm text-blue-600 hover:text-blue-800">
              トップページで見る →
            </Link>
          </div>
          <LikesTable
            likes={tableData}
            page={tablePage}
            totalPages={Math.ceil(tableTotal / UPLOAD_PAGE_SIZE)}
            onPageChange={loadTablePage}
          />
        </section>
      )}

      {showDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-80 rounded-xl bg-white p-6 shadow-xl dark:bg-gray-800">
            <p className="mb-1 text-base font-semibold dark:text-gray-100">
              アップロード完了
            </p>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
              トップページで「いいね」一覧を閲覧できます。
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDialog(false)}
                className="rounded-lg border px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                このまま表示を閉じる
              </button>
              <button
                onClick={() => navigate("/")}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
              >
                トップページへ移動
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
