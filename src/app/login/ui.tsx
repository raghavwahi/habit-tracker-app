"use client";

import { useActionState } from "react";
import { signIn, type AuthActionState } from "@/app/_actions/auth";
import { Spinner } from "@/components/Spinner";

const initialState: AuthActionState = { ok: false, message: "" };

export function LoginForm() {
  const [state, action, pending] = useActionState(signIn, initialState);

  return (
    <form action={action} className="space-y-4">
      <div className="space-y-2">
        <label className="block text-sm font-medium" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          className="w-full rounded-md border border-neutral-200 px-3 py-2 text-base"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          minLength={8}
          className="w-full rounded-md border border-neutral-200 px-3 py-2 text-base"
        />
      </div>

      {!state.ok && state.message ? (
        <p className="text-sm text-red-600">{state.message}</p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-neutral-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-60 flex items-center justify-center gap-2"
      >
        {pending && <Spinner size="sm" />}
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
