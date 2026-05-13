import { useEffect, useRef, useState } from "react";
import type { Like } from "../types";
import type { OembedResult } from "../utils/fetchOembed";
import { fetchOembed } from "../utils/fetchOembed";
import { detectStatusFromText } from "../utils/tweetStatus";

// split with a capturing group: odd indices are URLs, even indices are plain text
const URL_SPLIT_RE = /(https?:\/\/\S+)/;

function TweetText({ text }: { text: string }) {
  const parts = text.split(URL_SPLIT_RE);
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <a
            key={i}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            {part}
          </a>
        ) : (
          part
        ),
      )}
    </>
  );
}

function StatusBadge({ label, color }: { label: string; color: "yellow" | "red" }) {
  const cls =
    color === "yellow"
      ? "bg-yellow-100 text-yellow-700"
      : "bg-red-100 text-red-600";
  return (
    <span className={`rounded px-1.5 py-0.5 text-xs font-medium ${cls}`}>
      {label}
    </span>
  );
}

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

  const [html, setHtml] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [oembedReason, setOembedReason] = useState<OembedResult["reason"] | null>(null);
  const ref = useRef<HTMLElement>(null);

  const textStatus = detectStatusFromText(like.fullText);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        setLoading(true);
        fetchOembed(like.tweetId).then((result) => {
          setHtml(result.html);
          setOembedReason(result.reason);
          setLoading(false);
        });
      },
      { rootMargin: "200px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [like.tweetId]);

  useEffect(() => {
    if (!html || !ref.current) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).twttr?.widgets?.load(ref.current);
  }, [html]);

  return (
    <article ref={ref} className="overflow-hidden rounded-lg border bg-white p-4">
      <div className="mb-2 flex items-center justify-between text-xs text-gray-400">
        <time dateTime={date.toISOString()}>{dateLabel}</time>
        <div className="flex items-center gap-2">
          {textStatus === "suspended" && (
            <StatusBadge label="凍結アカウント" color="yellow" />
          )}
          {textStatus === null && oembedReason === "unavailable" && (
            <StatusBadge label="制限されたメディア/削除済み / 非公開" color="red" />
          )}
          <span>#{like.likeOrder + 1}</span>
        </div>
      </div>
      {html ? (
        <div
          dangerouslySetInnerHTML={{ __html: html }}
          className="overflow-hidden"
        />
      ) : loading ? (
        <div className="h-20 animate-pulse rounded bg-gray-100" />
      ) : (
        <p className="whitespace-pre-wrap text-sm leading-relaxed">
          <TweetText text={like.fullText} />
        </p>
      )}
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
