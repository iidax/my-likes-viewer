import type { Like } from "../types";
import { LikeItem } from "./LikeItem";

interface Props {
  likes: Like[];
}

export function LikesList({ likes }: Props) {
  if (likes.length === 0) {
    return <p className="py-8 text-center text-gray-400">表示するいいねがありません</p>;
  }

  return (
    <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {likes.map((like) => (
        <li key={like.tweetId}>
          <LikeItem like={like} />
        </li>
      ))}
    </ul>
  );
}
