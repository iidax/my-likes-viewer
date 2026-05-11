import { useState } from "react";

interface Props {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, totalPages, onPageChange }: Props) {
  const [inputValue, setInputValue] = useState("");

  const jump = () => {
    const n = parseInt(inputValue);
    if (!isNaN(n) && n >= 1 && n <= totalPages) {
      onPageChange(n - 1);
    }
    setInputValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") jump();
  };

  return (
    <nav className="flex items-center justify-center gap-3">
      <button
        disabled={page === 0}
        onClick={() => onPageChange(page - 1)}
        className="rounded border px-3 py-1 text-sm disabled:opacity-40"
      >
        ← 前へ
      </button>

      <span className="text-sm text-gray-600">
        {page + 1} / {totalPages}
      </span>

      <button
        disabled={page >= totalPages - 1}
        onClick={() => onPageChange(page + 1)}
        className="rounded border px-3 py-1 text-sm disabled:opacity-40"
      >
        次へ →
      </button>

      <div className="flex items-center gap-1 border-l pl-3">
        <input
          type="number"
          min={1}
          max={totalPages}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={String(page + 1)}
          className="w-16 rounded border px-2 py-1 text-center text-sm"
        />
        <button
          onClick={jump}
          className="rounded border px-2 py-1 text-sm hover:bg-gray-100"
        >
          移動
        </button>
      </div>
    </nav>
  );
}
