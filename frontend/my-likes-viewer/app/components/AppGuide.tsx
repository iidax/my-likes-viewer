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
        トップページの中央付近にあるファイル選択欄もしくは
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
    text: "日付フィルターで期間を絞り込み、特定の期間の「いいね」を閲覧できます。",
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

      <details className="mt-4 border-t pt-3 text-xs text-gray-500">
        <summary className="cursor-pointer select-none font-medium text-gray-600 hover:text-gray-800">
          likes.js とは？
        </summary>
        <div className="mt-2 space-y-2 leading-relaxed">
          <p>
            X（旧 Twitter）の{" "}
            <a
              href="https://x.com/settings/download_your_data"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline hover:text-blue-800"
            >
              データのアーカイブ
            </a>{" "}
            をリクエスト・ダウンロードすると、ZIP ファイルの中に{" "}
            <code className="rounded bg-gray-100 px-1">data/like.js</code>{" "}
            が含まれています。このファイルには、これまで「いいね」したすべてのツイートの ID・本文・URL が記録されています。
          </p>
          <p>ファイルの形式は以下の通りです：</p>
          <pre className="overflow-x-auto rounded-lg bg-gray-50 p-3 leading-relaxed text-gray-600">{`window.YTD.like.part0 = [
  {
    "like": {
      "tweetId": "1234567890123456789",
      "fullText": "ツイートのテキスト内容",
      "expandedUrl": "https://twitter.com/i/web/status/1234567890123456789"
    }
  },
  ...
]`}</pre>
        </div>
      </details>
    </section>
  );
}
