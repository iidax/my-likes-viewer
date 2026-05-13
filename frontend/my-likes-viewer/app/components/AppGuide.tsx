import { Link } from "react-router";

const steps = [
  {
    label: "STEP 1",
    text: (
      <>
        X の{" "}
        <a
          href="https://x.com/settings/download_your_data"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline hover:text-blue-800"
        >
          データのアーカイブをダウンロード
        </a>{" "}
        にアクセスし、アーカイブの取得をリクエストしましょう。届いたファイルの中から{" "}
        <code className="rounded bg-gray-100 px-1 text-xs">data/likes.js</code>{" "}
        を手元に控えてください。
      </>
    ),
  },
  {
    label: "STEP 2",
    text: (
      <>
        <Link to="/upload" className="text-blue-600 underline hover:text-blue-800">
          アップロードページ
        </Link>{" "}
        で <code className="rounded bg-gray-100 px-1 text-xs">likes.js</code>{" "}
        をアップロードしましょう。 解析はブラウザ上で行われます。
      </>
    ),
  },
  {
    label: "STEP 3",
    text: "日付フィルターで期間を絞り込み、過去の「いいね」を閲覧できます。",
  },
];

export function AppGuide() {
  return (
    <section className="mb-6 rounded-lg border bg-white px-5 py-4 text-sm text-gray-700 shadow-sm">
      <p className="mb-3 font-semibold text-gray-900">
        X（旧 Twitter）の「いいね」を期間指定して閲覧できるWebアプリです。
        データはすべてブラウザ上で処理されます。
      </p>
      <ol className="space-y-1.5">
        {steps.map(({ label, text }) => (
          <li key={label} className="flex gap-3">
            <span className="w-14 shrink-0 rounded bg-blue-50 px-1.5 py-0.5 text-center text-xs font-semibold text-blue-700">
              {label}
            </span>
            <span className="leading-relaxed">{text}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
