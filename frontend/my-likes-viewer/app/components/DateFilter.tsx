interface Props {
  fromValue: string;
  untilValue: string;
  onFromChange: (isoDate: string) => void;
  onUntilChange: (isoDate: string) => void;
}

export function DateFilter({ fromValue, untilValue, onFromChange, onUntilChange }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <label htmlFor="from-date" className="text-sm text-gray-600">
        この日付以降
      </label>
      <input
        id="from-date"
        type="date"
        value={fromValue}
        onChange={(e) => onFromChange(e.target.value)}
        className="rounded border px-2 py-1 text-sm"
      />
      {fromValue && (
        <button
          onClick={() => onFromChange("")}
          className="text-sm text-gray-400 hover:text-gray-600"
        >
          クリア
        </button>
      )}
      <label htmlFor="until-date" className="text-sm text-gray-600">
        この日付以前
      </label>
      <input
        id="until-date"
        type="date"
        value={untilValue}
        onChange={(e) => onUntilChange(e.target.value)}
        className="rounded border px-2 py-1 text-sm"
      />
      {untilValue && (
        <button
          onClick={() => onUntilChange("")}
          className="text-sm text-gray-400 hover:text-gray-600"
        >
          クリア
        </button>
      )}
    </div>
  );
}
