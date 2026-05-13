import { useEffect, useMemo, useState } from "react";

interface Props {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const MAX_DOTS = 20;

export function Pagination({ page, totalPages, onPageChange }: Props) {
  const [inputValue, setInputValue] = useState(String(page + 1));

  useEffect(() => {
    setInputValue(String(page + 1));
  }, [page]);

  const commit = () => {
    const n = parseInt(inputValue, 10);
    if (!isNaN(n) && n >= 1 && n <= totalPages) {
      onPageChange(n - 1);
    } else {
      setInputValue(String(page + 1));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") commit();
    if (e.key === "Escape") setInputValue(String(page + 1));
  };

  const numDots = Math.min(totalPages, MAX_DOTS);
  const span = Math.max(numDots - 1, 1);
  const currentDot = Math.round((page / Math.max(totalPages - 1, 1)) * span);

  const dots = useMemo(() => {
    return Array.from({ length: numDots }, (_, i) => {
      const targetPage = Math.round((i / span) * (totalPages - 1));
      const prevBoundary = i === 0 ? 1 : Math.round(((i - 0.5) / span) * (totalPages - 1)) + 1;
      const nextBoundary =
        i === numDots - 1
          ? totalPages
          : Math.round(((i + 0.5) / span) * (totalPages - 1));
      const label =
        prevBoundary === nextBoundary
          ? `${prevBoundary} ページ`
          : `${prevBoundary}〜${nextBoundary} ページ`;
      return { i, targetPage, label };
    });
  }, [numDots, span, totalPages]);

  return (
    <nav className="flex flex-col items-center gap-2">
      <div className="flex items-center gap-1.5 py-1">
        {dots.map(({ i, targetPage, label }) => {
          const dist = Math.abs(i - currentDot);
          const sizeClass =
            dist === 0
              ? "w-3 h-3"
              : dist === 1
                ? "w-2.5 h-2.5"
                : dist === 2
                  ? "w-2 h-2"
                  : "w-1.5 h-1.5";
          const colorClass =
            dist === 0
              ? "bg-gray-700 dark:bg-gray-200"
              : dist <= 2
                ? "bg-gray-400 dark:bg-gray-500"
                : "bg-gray-200 dark:bg-gray-600";
          return (
            <button
              key={i}
              type="button"
              title={label}
              onClick={() => onPageChange(targetPage)}
              className={`rounded-full transition-all hover:scale-150 hover:bg-blue-400 dark:hover:bg-blue-400 ${sizeClass} ${colorClass}`}
            />
          );
        })}
      </div>

      <div className="flex items-center gap-3">
        <button
          disabled={page === 0}
          onClick={() => onPageChange(page - 1)}
          className="rounded border px-3 py-1 text-sm disabled:opacity-40 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          ← 前へ
        </button>

        <span className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
          <input
            type="number"
            min={1}
            max={totalPages}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={commit}
            onFocus={(e) => e.target.select()}
            className="w-12 rounded border border-transparent bg-transparent text-center text-sm text-gray-600 hover:border-gray-300 focus:border-gray-400 focus:bg-white focus:outline-none dark:text-gray-400 dark:hover:border-gray-600 dark:focus:border-gray-500 dark:focus:bg-gray-800"
          />
          / {totalPages}
        </span>

        <button
          disabled={page >= totalPages - 1}
          onClick={() => onPageChange(page + 1)}
          className="rounded border px-3 py-1 text-sm disabled:opacity-40 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          次へ →
        </button>
      </div>
    </nav>
  );
}
