import Link from "next/link";
import { SignOutButton } from "./SignOutButton";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-neutral-50">
      <header className="sticky top-0 z-10 border-b border-neutral-200 bg-neutral-50/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-md items-center justify-between px-4 py-3">
          <Link href="/app" className="text-sm font-semibold">
            Habit Tracker
          </Link>
          <SignOutButton />
        </div>
      </header>

      <main className="mx-auto w-full max-w-md px-4 py-4">{children}</main>

      <nav className="sticky bottom-0 border-t border-neutral-200 bg-white">
        <div className="mx-auto grid w-full max-w-md grid-cols-3 text-center text-sm">
          <Link className="py-3" href="/app">
            Today
          </Link>
          <Link className="py-3" href="/app/charts">
            Charts
          </Link>
          <Link className="py-3" href="/app/habits">
            Habits
          </Link>
        </div>
      </nav>
    </div>
  );
}
