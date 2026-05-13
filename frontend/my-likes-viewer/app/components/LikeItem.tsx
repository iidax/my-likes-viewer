import { useEffect, useRef, useState } from "react";
import type { Like } from "../types";
import { fetchOembed } from "../utils/fetchOembed";

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
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        setLoading(true);
        fetchOembed(like.tweetId).then((result) => {
          setHtml(result);
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
        <span>#{like.likeOrder + 1}</span>
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
