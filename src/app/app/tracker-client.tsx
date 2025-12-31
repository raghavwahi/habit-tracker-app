"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { addDays, format, parseISO } from "date-fns";
import { setHabitCompletion } from "@/app/_actions/tracker";

type Habit = {
  id: string;
  name: string;
};

export function TrackerClient({
  day,
  hadDateParam,
  habits,
  completedHabitIds,
  passPercentage,
}: {
  day: string;
  hadDateParam: boolean;
  habits: Habit[];
  completedHabitIds: string[];
  passPercentage: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const baseCompleted = useMemo(() => {
    return new Set<string>(completedHabitIds);
  }, [completedHabitIds]);

  const [overrides, setOverrides] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (hadDateParam) return;
    const localDay = format(new Date(), "yyyy-MM-dd");
    startTransition(() => {
      router.replace(`/app?date=${localDay}`);
    });
  }, [hadDateParam, router]);

  const total = habits.length;
  const score = habits.reduce((acc, h) => {
    const isChecked = overrides[h.id] ?? baseCompleted.has(h.id);
    return acc + (isChecked ? 1 : 0);
  }, 0);
  const percent = total === 0 ? 0 : Math.round((score / total) * 100);
  const isPass = percent >= passPercentage;

  const headingDate = useMemo(() => {
    try {
      return format(parseISO(day), "EEE, d MMM yyyy");
    } catch {
      return day;
    }
  }, [day]);

  const prevDay = format(addDays(parseISO(day), -1), "yyyy-MM-dd");
  const nextDay = format(addDays(parseISO(day), 1), "yyyy-MM-dd");

  function goToDay(next: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("date", next);
    router.push(`/app?${params.toString()}`);
  }

  async function toggle(habitId: string, nextValue: boolean) {
    setError("");

    setOverrides((prev) => ({ ...prev, [habitId]: nextValue }));

    startTransition(async () => {
      const result = await setHabitCompletion({
        habitId,
        day,
        completed: nextValue,
      });

      if (!result.ok) {
        setError(result.message);
        setOverrides((prev) => {
          const copy = { ...prev };
          delete copy[habitId];
          return copy;
        });
      }
    });
  }

  return (
    <div className="space-y-4">
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => goToDay(prevDay)}
            className="rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm"
          >
            Prev
          </button>
          <div className="text-center">
            <div className="text-sm font-medium">Today</div>
            <div className="text-sm text-neutral-600">{headingDate}</div>
          </div>
          <button
            type="button"
            onClick={() => goToDay(nextDay)}
            className="rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm"
          >
            Next
          </button>
        </div>

        <input
          type="date"
          value={day}
          onChange={(e) => goToDay(e.target.value)}
          className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-base"
        />

        <div className="rounded-lg border border-neutral-200 bg-white p-4">
          <div className="flex items-baseline justify-between">
            <div className="text-sm text-neutral-600">Score</div>
            <div className="text-lg font-semibold">
              {score}/{total}
            </div>
          </div>
          <div className="mt-1 flex items-baseline justify-between">
            <div className="text-sm text-neutral-600">Completion</div>
            <div className="text-sm font-medium">{percent}%</div>
          </div>
          <div className="mt-2">
            <span
              className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                isPass
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-red-50 text-red-700"
              }`}
            >
              {isPass ? "Pass" : "Fail"} (target {passPercentage}%)
            </span>
          </div>
        </div>
      </section>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      {habits.length === 0 ? (
        <div className="rounded-lg border border-neutral-200 bg-white p-4">
          <p className="text-sm text-neutral-700">No habits yet.</p>
          <Link className="mt-2 inline-block underline" href="/app/habits">
            Add habits
          </Link>
        </div>
      ) : (
        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-neutral-800">Habits</h2>
          <div className="divide-y divide-neutral-200 overflow-hidden rounded-lg border border-neutral-200 bg-white">
            {habits.map((habit) => {
              const checked = overrides[habit.id] ?? baseCompleted.has(habit.id);
              return (
                <label
                  key={habit.id}
                  className="flex items-center gap-3 px-4 py-3"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    disabled={isPending}
                    onChange={(e) => toggle(habit.id, e.target.checked)}
                    className="h-5 w-5"
                  />
                  <span className="flex-1 text-sm text-neutral-900">
                    {habit.name}
                  </span>
                </label>
              );
            })}
          </div>
        </section>
      )}

      <div className="text-xs text-neutral-500">
        Each habit is weighted 1 point.
      </div>
    </div>
  );
}
