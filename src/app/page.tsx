import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function Home() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/app");
  }

  return (
    <main className="min-h-dvh px-4 py-10">
      <div className="mx-auto w-full max-w-sm space-y-6">
        <header className="space-y-2">
          <h1 className="text-2xl font-semibold">Habit Tracker</h1>
          <p className="text-sm text-neutral-600">
            Daily checklist with score, completion %, and charts.
          </p>
        </header>

        <div className="space-y-3">
          <Link
            href="/login"
            className="block w-full rounded-md bg-neutral-900 px-3 py-2 text-center text-sm font-medium text-white"
          >
            Sign in
          </Link>
          <Link
            href="/register"
            className="block w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-center text-sm font-medium"
          >
            Create account
          </Link>
        </div>
      </div>
    </main>
  );
}
