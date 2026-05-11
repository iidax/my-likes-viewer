import { useRef, useState } from "react";
import { useNavigate } from "react-router";
import { insertLikes } from "../lib/db/likes";
import { parseLikesJS } from "../utils/parseLikesJS";

export function meta() {
  return [{ title: "アップロード | My Likes Viewer" }];
}

export default function Upload() {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleFile = (file: File) => {
    setStatus("loading");
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        const likes = parseLikesJS(content);
        await insertLikes(likes);
        navigate("/");
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
    <main className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-2 text-xl font-semibold">likes.js をアップロード</h1>
      <p className="mb-6 text-sm text-gray-500">
        X のデータアーカイブに含まれる{" "}
        <code className="rounded bg-gray-100 px-1">data/like.js</code>{" "}
        を選択してください。
      </p>

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
    </main>
  );
}
