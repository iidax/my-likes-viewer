import {
  isRouteErrorResponse,
  Links,
  Meta,
  NavLink,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";

import type { Route } from "./+types/root";
import "./app.css";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className="overflow-y-scroll">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var r=new URLSearchParams(window.location.search).get('redirect');if(r)history.replaceState(null,'',r);})();`,
          }}
        />
        <script async src="https://platform.twitter.com/widgets.js" />
      </head>
      <body className="min-h-screen overflow-x-hidden bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100">
        <header className="border-b bg-white px-4 py-3 dark:border-gray-800 dark:bg-gray-950">
          <nav className="mx-auto flex max-w-2xl items-center gap-6">
            <span className="font-semibold">My Likes Viewer</span>
            <NavLink
              to="/"
              className={({ isActive }) =>
                isActive ? "text-blue-600 dark:text-blue-400" : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
              }
            >
              一覧
            </NavLink>
            <NavLink
              to="/upload"
              className={({ isActive }) =>
                isActive ? "text-blue-600 dark:text-blue-400" : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
              }
            >
              アップロード
            </NavLink>
            <NavLink
              to="/settings"
              className={({ isActive }) =>
                isActive ? "text-blue-600 dark:text-blue-400" : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
              }
            >
              設定
            </NavLink>
          </nav>
        </header>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "エラーが発生しました";
  let details = "予期しないエラーです。";

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404 Not Found" : "Error";
    details =
      error.status === 404 ? "ページが見つかりません。" : error.statusText;
  } else if (import.meta.env.DEV && error instanceof Error) {
    details = error.message;
  }

  return (
    <main className="mx-auto max-w-2xl p-8">
      <h1 className="text-xl font-bold">{message}</h1>
      <p className="mt-2 text-gray-600 dark:text-gray-400">{details}</p>
    </main>
  );
}
