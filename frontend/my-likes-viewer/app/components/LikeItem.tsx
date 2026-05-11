import type { Like } from "../types";

interface Props {
  like: Like;
}

export function LikeItem({ like }: Props) {
  const date = new Date(like.tweetedAt);
  const dateLabel = date.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <article className="rounded-lg border bg-white p-4">
      <div className="mb-2 flex items-center justify-between text-xs text-gray-400">
        <time dateTime={date.toISOString()}>{dateLabel}</time>
        <span>#{like.likeOrder + 1}</span>
      </div>
      <p className="whitespace-pre-wrap text-sm leading-relaxed">{like.fullText}</p>
      <a
        href={like.expandedUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 inline-block text-xs text-blue-500 hover:underline"
      >
        ツイートを見る →
      </a>
    </article>
  );
}
