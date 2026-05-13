import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router";
import { AppGuide } from "../components/AppGuide";
import { DateFilter } from "../components/DateFilter";
import { LikesList } from "../components/LikesList";
import { Pagination } from "../components/Pagination";
import { countLikes, getOldestTweetDate, insertLikes, queryLikes } from "../lib/db/likes";
import { HOME_PAGE_SIZE } from "../constants";
import type { Like } from "../types";
import { parseLikesJS } from "../utils/parseLikesJS";

export function meta() {
  return [{ title: "My Likes Viewer" }];
}

const SESSION_KEY = "homeSearchParams";

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Math.max(0, parseInt(searchParams.get("page") ?? "0"));
  const fromDateStr = searchParams.get("from") ?? "";
  const untilDateStr = searchParams.get("until") ?? "";

  const [likes, setLikes] = useState<Like[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [defaultFromDate, setDefaultFromDate] = useState("");
  const [uploadStatus, setUploadStatus] = useState<"idle" | "loading" | "error">("idle");
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchParams.size === 0) {
      const saved = sessionStorage.getItem(SESSION_KEY);
      if (saved) {
        setSearchParams(new URLSearchParams(saved), { replace: true });
        return;
      }
    }

    getOldestTweetDate().then((ms) => {
      if (ms == null) return;
      const iso = new Date(ms).toISOString().slice(0, 10);
      setDefaultFromDate(iso);
      setSearchParams(
        (prev) => {
          if (prev.has("from")) return prev;
          const next = new URLSearchParams(prev);
          next.set("from", iso);
          return next;
        },
        { replace: true },
      );
    });
  }, []);

  useEffect(() => {
    if (searchParams.size > 0) {
      sessionStorage.setItem(SESSION_KEY, searchParams.toString());
    }
  }, [searchParams]);

  const effectiveFromStr = fromDateStr || defaultFromDate;
  const fromDate = effectiveFromStr ? new Date(effectiveFromStr).getTime() : undefined;
  const untilDate = untilDateStr ? new Date(untilDateStr + "T23:59:59").getTime() : undefined;
  const totalPages = Math.max(1, Math.ceil(totalCount / HOME_PAGE_SIZE));

  useEffect(() => {
    setLoading(true);
    Promise.all([
      queryLikes({ page, fromDate, untilDate, pageSize: HOME_PAGE_SIZE }),
      countLikes(fromDate, untilDate),
    ]).then(([rows, count]) => {
      setLikes(rows);
      setTotalCount(count);
      setLoading(false);
    });
  }, [page, fromDate, untilDate]);

  const handleUploadFile = (file: File) => {
    setUploadStatus("loading");
    setUploadError("");
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const likes = parseLikesJS(e.target?.result as string);
        await insertLikes(likes);
        setUploadStatus("idle");
        const oldest = await getOldestTweetDate();
        if (oldest != null) {
          const iso = new Date(oldest).toISOString().slice(0, 10);
          setDefaultFromDate(iso);
          setSearchParams((prev) => {
            const next = new URLSearchParams(prev);
            if (!prev.has("from")) next.set("from", iso);
            return next;
          }, { replace: true });
        }
        const [rows, count] = await Promise.all([
          queryLikes({ page: 0, fromDate: oldest ?? undefined, pageSize: HOME_PAGE_SIZE }),
          countLikes(oldest ?? undefined, undefined),
        ]);
        setLikes(rows);
        setTotalCount(count);
      } catch (err) {
        setUploadError(err instanceof Error ? err.message : "予期しないエラーが発生しました");
        setUploadStatus("error");
      }
    };
    reader.readAsText(file);
  };

  const setPage = (newPage: number) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("page", String(newPage));
      return next;
    });
  };

  const handleFromChange = (value: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value) {
        next.set("from", value);
      } else {
        next.delete("from");
      }
      next.set("page", "0");
      return next;
    });
  };

  const handleUntilChange = (value: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value) {
        next.set("until", value);
      } else {
        next.delete("until");
      }
      next.set("page", "0");
      return next;
    });
  };

  const handleRangeChange = (from: string, until: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (from) { next.set("from", from); } else { next.delete("from"); }
      if (until) { next.set("until", until); } else { next.delete("until"); }
      next.set("page", "0");
      return next;
    });
  };

  const pagination = totalPages > 1 && (
    <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
  );

  return (
    <main className="mx-auto max-w-6xl px-4 py-6">
      <AppGuide />
      <div className="mb-4 flex items-center justify-between">
        <DateFilter
          fromValue={fromDateStr}
          untilValue={untilDateStr}
          fromDisplay={effectiveFromStr}
          onFromChange={handleFromChange}
          onUntilChange={handleUntilChange}
          onRangeChange={handleRangeChange}
        />
        <span className="text-sm text-gray-500">{totalCount} 件</span>
      </div>

      {loading ? (
        <p className="py-8 text-center text-gray-400">読み込み中...</p>
      ) : totalCount === 0 ? (
        <div className="mx-auto mt-8 max-w-lg">
          <label className="flex cursor-pointer flex-col items-center gap-3 rounded-lg border-2 border-dashed border-gray-300 p-10 hover:border-blue-400">
            <span className="text-gray-500">
              {uploadStatus === "loading" ? "読み込み中..." : "like.js をここにドロップ、またはクリックして選択"}
            </span>
            <span className="text-xs text-gray-400">X のデータアーカイブに含まれる data/like.js</span>
            <input
              ref={fileInputRef}
              type="file"
              accept=".js"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUploadFile(f); }}
              disabled={uploadStatus === "loading"}
              className="hidden"
            />
          </label>
          {uploadStatus === "error" && (
            <p className="mt-3 text-sm text-red-500">{uploadError}</p>
          )}
        </div>
      ) : (
        <>
          {pagination && <div className="mb-4">{pagination}</div>}
          <LikesList likes={likes} />
          {pagination && <div className="mt-6">{pagination}</div>}
        </>
      )}
    </main>
  );
}
