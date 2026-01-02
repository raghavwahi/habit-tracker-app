"use client";

import { useTransition } from "react";
import { signOut } from "@/app/_actions/auth";
import { Spinner } from "@/components/Spinner";

export function SignOutButton() {
  const [isPending, startTransition] = useTransition();

  function handleSignOut() {
    startTransition(async () => {
      await signOut();
    });
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={isPending}
      className="rounded-md px-2 py-1 text-sm font-medium text-neutral-700 disabled:opacity-60 flex items-center gap-1"
    >
      {isPending && <Spinner size="xs" variant="dark" />}
      Sign out
    </button>
  );
}
