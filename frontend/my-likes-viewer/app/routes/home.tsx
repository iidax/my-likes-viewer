import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { DateFilter } from "../components/DateFilter";
import { LikesList } from "../components/LikesList";
import { Pagination } from "../components/Pagination";
import { countLikes, queryLikes } from "../lib/db/likes";
import type { Like } from "../types";

export function meta() {
  return [{ title: "My Likes Viewer" }];
}

const PAGE_SIZE = 12;

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Math.max(0, parseInt(searchParams.get("page") ?? "0"));
  const fromDateStr = searchParams.get("from") ?? "";

  const [likes, setLikes] = useState<Like[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fromDate = fromDateStr ? new Date(fromDateStr).getTime() : undefined;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  useEffect(() => {
    setLoading(true);
    Promise.all([
      queryLikes({ page, fromDate, pageSize: PAGE_SIZE }),
      countLikes(fromDate),
    ]).then(([rows, count]) => {
      setLikes(rows);
      setTotalCount(count);
      setLoading(false);
    });
  }, [page, fromDate]);

  const setPage = (newPage: number) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("page", String(newPage));
      return next;
    });
  };

  const handleDateChange = (value: string) => {
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

  const pagination = totalPages > 1 && (
    <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
  );

  return (
    <main className="mx-auto max-w-6xl px-4 py-6">
      <div className="mb-4 flex items-center justify-between">
        <DateFilter value={fromDateStr} onChange={handleDateChange} />
        <span className="text-sm text-gray-500">{totalCount} 件</span>
      </div>

      {loading ? (
        <p className="py-8 text-center text-gray-400">読み込み中...</p>
      ) : totalCount === 0 ? (
        <p className="py-8 text-center text-gray-400">データがありません</p>
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
