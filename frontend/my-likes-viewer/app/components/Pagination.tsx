import { useEffect, useState } from "react";

interface Props {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

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

  return (
    <nav className="flex items-center justify-center gap-3">
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
    </nav>
  );
}
