import { Pagination } from "./Pagination";
import type { Like } from "../types";

interface Props {
  likes: Like[];
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function LikesTable({ likes, page, totalPages, onPageChange }: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full table-fixed border-collapse text-sm">
        <colgroup>
          <col className="w-28" />
          <col />
          <col className="w-16" />
        </colgroup>
        <thead>
          <tr className="border-b bg-gray-50 text-left text-xs text-gray-500">
            <th className="px-3 py-2 font-medium">日時</th>
            <th className="px-3 py-2 font-medium">ツイート</th>
            <th className="px-3 py-2 font-medium">URL</th>
          </tr>
        </thead>
        <tbody>
          {likes.map((like) => (
            <tr key={like.tweetId} className="border-b hover:bg-gray-50">
              <td className="whitespace-nowrap px-3 py-1 text-gray-500">
                {new Date(like.tweetedAt).toLocaleDateString("ja-JP")}
              </td>
              <td className="px-3 py-1 text-gray-800">
                <p className="truncate">{like.fullText}</p>
              </td>
              <td className="px-3 py-0.5">
                <a
                  href={like.expandedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline hover:text-blue-800"
                >
                  リンク
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {totalPages > 1 && (
        <div className="mt-4">
          <Pagination page={page} totalPages={totalPages} onPageChange={onPageChange} />
        </div>
      )}
    </div>
  );
}
