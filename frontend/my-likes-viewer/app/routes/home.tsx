import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { DateFilter } from "../components/DateFilter";
import { LikesList } from "../components/LikesList";
import { Pagination } from "../components/Pagination";
import { countLikes, hasLikes, queryLikes } from "../lib/db/likes";
import type { Like } from "../types";

export function meta() {
  return [{ title: "My Likes Viewer" }];
}

const PAGE_SIZE = 10;

export default function Home() {
  const navigate = useNavigate();
  const [likes, setLikes] = useState<Like[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [fromDateStr, setFromDateStr] = useState("");
  const [loading, setLoading] = useState(true);

  const fromDate = fromDateStr ? new Date(fromDateStr).getTime() : undefined;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  useEffect(() => {
    hasLikes().then((has) => {
      if (!has) navigate("/upload");
    });
  }, [navigate]);

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

  const handleDateChange = (value: string) => {
    setFromDateStr(value);
    setPage(0);
  };

  return (
    <main className="mx-auto max-w-2xl px-4 py-6">
      <div className="mb-4 flex items-center justify-between">
        <DateFilter value={fromDateStr} onChange={handleDateChange} />
        <span className="text-sm text-gray-500">{totalCount} 件</span>
      </div>

      {loading ? (
        <p className="py-8 text-center text-gray-400">読み込み中...</p>
      ) : (
        <>
          <LikesList likes={likes} />
          {totalPages > 1 && (
            <div className="mt-6">
              <Pagination
                page={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </div>
          )}
        </>
      )}
    </main>
  );
}
