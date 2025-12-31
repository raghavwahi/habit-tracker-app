import Link from "next/link";
import { LoginForm } from "./ui";

export default function LoginPage() {
  return (
    <main className="min-h-dvh px-4 py-10">
      <div className="mx-auto w-full max-w-sm space-y-6">
        <header className="space-y-2">
          <h1 className="text-2xl font-semibold">Sign in</h1>
          <p className="text-sm text-neutral-600">Track your habits daily.</p>
        </header>

        <LoginForm />

        <p className="text-sm text-neutral-600">
          No account?{" "}
          <Link className="underline" href="/register">
            Create one
          </Link>
        </p>
      </div>
    </main>
  );
}
