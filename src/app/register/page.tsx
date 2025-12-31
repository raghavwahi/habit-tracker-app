import Link from "next/link";
import { RegisterForm } from "./ui";

export default function RegisterPage() {
  return (
    <main className="min-h-dvh px-4 py-10">
      <div className="mx-auto w-full max-w-sm space-y-6">
        <header className="space-y-2">
          <h1 className="text-2xl font-semibold">Create account</h1>
          <p className="text-sm text-neutral-600">
            Sign up to start tracking.
          </p>
        </header>

        <RegisterForm />

        <p className="text-sm text-neutral-600">
          Already have an account?{" "}
          <Link className="underline" href="/login">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
