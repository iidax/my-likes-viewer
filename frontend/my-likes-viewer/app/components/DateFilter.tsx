interface Props {
  value: string;
  onChange: (isoDate: string) => void;
}

export function DateFilter({ value, onChange }: Props) {
  return (
    <div className="flex items-center gap-3">
      <label htmlFor="from-date" className="text-sm text-gray-600">
        この日付以降
      </label>
      <input
        id="from-date"
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded border px-2 py-1 text-sm"
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="text-sm text-gray-400 hover:text-gray-600"
        >
          クリア
        </button>
      )}
    </div>
  );
}
