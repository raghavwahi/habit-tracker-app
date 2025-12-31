"use client";

import { useActionState, useMemo, useState, useTransition } from "react";
import { HABIT_TEMPLATES } from "@/lib/habits/templates";
import {
  applyTemplate,
  createHabit,
  setPassPercentage,
  type TrackerActionState,
} from "@/app/_actions/tracker";

type Habit = { id: string; name: string };

const initialState: TrackerActionState = { ok: true };

export function HabitsClient({
  habits,
  passPercentage,
}: {
  habits: Habit[];
  passPercentage: number;
}) {
  const [createState, createAction, createPending] = useActionState(
    createHabit,
    initialState,
  );
  const [passState, passAction, passPending] = useActionState(
    setPassPercentage,
    initialState,
  );

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [templateError, setTemplateError] = useState<string>("");
  const [templatePending, startTransition] = useTransition();

  const existingNames = useMemo(() => {
    return new Set(habits.map((h) => h.name.trim().toLowerCase()));
  }, [habits]);

  function toggle(name: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }

  function selectAll() {
    setSelected(new Set(HABIT_TEMPLATES));
  }

  async function addSelected() {
    setTemplateError("");
    const payload = Array.from(selected);

    startTransition(async () => {
      const result = await applyTemplate(payload);
      if (!result.ok) setTemplateError(result.message);
      else {
        setSelected(new Set());
        window.location.reload();
      }
    });
  }

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-neutral-200 bg-white p-4">
        <h2 className="text-sm font-semibold">Pass target</h2>
        <p className="mt-1 text-xs text-neutral-500">
          Used to label each day as pass or fail.
        </p>

        <form action={passAction} className="mt-3 flex items-end gap-2">
          <div className="flex-1">
            <label className="block text-xs font-medium" htmlFor="passPercentage">
              Pass %
            </label>
            <input
              id="passPercentage"
              name="passPercentage"
              type="number"
              min={0}
              max={100}
              defaultValue={passPercentage}
              className="mt-1 w-full rounded-md border border-neutral-200 px-3 py-2 text-base"
            />
          </div>
          <button
            type="submit"
            disabled={passPending}
            className="rounded-md bg-neutral-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            Save
          </button>
        </form>

        {!passState.ok ? (
          <p className="mt-2 text-sm text-red-600">{passState.message}</p>
        ) : null}
      </section>

      <section className="rounded-lg border border-neutral-200 bg-white p-4">
        <h2 className="text-sm font-semibold">Add a habit</h2>
        <form action={createAction} className="mt-3 flex items-end gap-2">
          <div className="flex-1">
            <label className="block text-xs font-medium" htmlFor="name">
              Habit name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="e.g. Drink water"
              className="mt-1 w-full rounded-md border border-neutral-200 px-3 py-2 text-base"
              required
            />
          </div>
          <button
            type="submit"
            disabled={createPending}
            className="rounded-md bg-neutral-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            Add
          </button>
        </form>
        {!createState.ok ? (
          <p className="mt-2 text-sm text-red-600">{createState.message}</p>
        ) : null}
      </section>

      <section className="rounded-lg border border-neutral-200 bg-white p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold">Template</h2>
            <p className="mt-1 text-xs text-neutral-500">
              Select habits from a starter set.
            </p>
          </div>
          <button
            type="button"
            onClick={selectAll}
            className="rounded-md border border-neutral-200 bg-white px-3 py-2 text-xs font-medium"
          >
            Select all
          </button>
        </div>

        <div className="mt-3 divide-y divide-neutral-200 overflow-hidden rounded-lg border border-neutral-200">
          {HABIT_TEMPLATES.map((name) => {
            const checked = selected.has(name);
            const alreadyAdded = existingNames.has(name.toLowerCase());
            return (
              <label
                key={name}
                className="flex items-center gap-3 bg-white px-4 py-3"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggle(name)}
                  disabled={templatePending || alreadyAdded}
                  className="h-5 w-5"
                />
                <span className="flex-1 text-sm text-neutral-900">{name}</span>
                {alreadyAdded ? (
                  <span className="text-xs text-neutral-500">Added</span>
                ) : null}
              </label>
            );
          })}
        </div>

        {templateError ? (
          <p className="mt-2 text-sm text-red-600">{templateError}</p>
        ) : null}

        <button
          type="button"
          disabled={templatePending || selected.size === 0}
          onClick={addSelected}
          className="mt-3 w-full rounded-md bg-neutral-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {templatePending ? "Adding…" : "Add selected"}
        </button>
      </section>

      <section className="rounded-lg border border-neutral-200 bg-white p-4">
        <h2 className="text-sm font-semibold">Your habits</h2>
        {habits.length === 0 ? (
          <p className="mt-2 text-sm text-neutral-600">None yet.</p>
        ) : (
          <ul className="mt-2 space-y-2">
            {habits.map((h) => (
              <li key={h.id} className="text-sm text-neutral-900">
                {h.name}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
