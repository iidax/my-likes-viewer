import { useMemo } from "react";

interface Preset {
  label: string;
  from: string;
  until: string;
}

interface Props {
  fromValue: string;
  untilValue: string;
  fromDisplay?: string;
  onFromChange: (isoDate: string) => void;
  onUntilChange: (isoDate: string) => void;
  onRangeChange: (from: string, until: string) => void;
}

function buildPresets(): Preset[] {
  const today = new Date();
  const y = today.getFullYear();
  const pad = (n: number) => String(n).padStart(2, "0");
  const fmt = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const ago = (days: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() - days);
    return fmt(d);
  };
  return [
    { label: "全期間", from: "", until: "" },
    { label: "去年1年間", from: `${y - 1}-01-01`, until: `${y - 1}-12-31` },
    { label: "直近1年", from: ago(365), until: "" },
  ];
}

export function DateFilter({ fromValue, untilValue, fromDisplay, onFromChange, onUntilChange, onRangeChange }: Props) {
  const presets = useMemo(buildPresets, []);
  const activePreset = presets.find((p) => p.from === fromValue && p.until === untilValue) ?? null;
  const displayFrom = fromDisplay ?? fromValue;

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
      <div className="flex flex-wrap gap-1.5">
        {presets.map((p) => {
          const active = p === activePreset;
          return (
            <button
              key={p.label}
              type="button"
              onClick={() => onRangeChange(p.from, p.until)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                active
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              }`}
            >
              {p.label}
            </button>
          );
        })}
      </div>

      <div className="hidden h-4 w-px bg-gray-200 sm:block dark:bg-gray-600" />

      <div className="flex items-center gap-1.5">
        <input
          id="from-date"
          type="date"
          value={displayFrom}
          onChange={(e) => onFromChange(e.target.value)}
          className="rounded-md border border-gray-200 px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
        />
        <span className="text-sm text-gray-400">〜</span>
        <input
          id="until-date"
          type="date"
          value={untilValue}
          onChange={(e) => onUntilChange(e.target.value)}
          className="rounded-md border border-gray-200 px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
        />
      </div>
    </div>
  );
}
