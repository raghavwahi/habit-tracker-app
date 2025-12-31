"use client";

import { useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export type SeriesPoint = {
  key: string;
  label: string;
  score: number;
  percent: number;
};

export function ChartsClient({
  totalHabits,
  activeDaysThisWeek,
  activeDaysThisMonth,
  daySeries,
  weekSeries,
  monthSeries,
}: {
  totalHabits: number;
  activeDaysThisWeek: number;
  activeDaysThisMonth: number;
  daySeries: SeriesPoint[];
  weekSeries: SeriesPoint[];
  monthSeries: SeriesPoint[];
}) {
  const [mode, setMode] = useState<"day" | "week" | "month">("day");

  const series = useMemo(() => {
    if (mode === "week") return weekSeries;
    if (mode === "month") return monthSeries;
    return daySeries;
  }, [daySeries, weekSeries, monthSeries, mode]);

  return (
    <div className="space-y-4">
      <section className="grid grid-cols-2 gap-3">
        <div className="rounded-lg border border-neutral-200 bg-white p-4">
          <div className="text-xs text-neutral-600">This week</div>
          <div className="mt-1 text-xl font-semibold">{activeDaysThisWeek}/7</div>
          <div className="mt-1 text-xs text-neutral-500">Days with any progress</div>
        </div>
        <div className="rounded-lg border border-neutral-200 bg-white p-4">
          <div className="text-xs text-neutral-600">This month</div>
          <div className="mt-1 text-xl font-semibold">{activeDaysThisMonth}</div>
          <div className="mt-1 text-xs text-neutral-500">Days with any progress</div>
        </div>
      </section>

      <section className="rounded-lg border border-neutral-200 bg-white p-4">
        <div className="flex items-center justify-between gap-2">
          <div className="space-y-1">
            <h2 className="text-sm font-semibold">Score</h2>
            <p className="text-xs text-neutral-500">Total habits: {totalHabits}</p>
          </div>
          <div className="flex rounded-md border border-neutral-200 p-1 text-xs">
            <button
              type="button"
              onClick={() => setMode("day")}
              className={`rounded px-2 py-1 ${
                mode === "day" ? "bg-neutral-900 text-white" : "text-neutral-700"
              }`}
            >
              Day
            </button>
            <button
              type="button"
              onClick={() => setMode("week")}
              className={`rounded px-2 py-1 ${
                mode === "week" ? "bg-neutral-900 text-white" : "text-neutral-700"
              }`}
            >
              Week
            </button>
            <button
              type="button"
              onClick={() => setMode("month")}
              className={`rounded px-2 py-1 ${
                mode === "month" ? "bg-neutral-900 text-white" : "text-neutral-700"
              }`}
            >
              Month
            </button>
          </div>
        </div>

        <div className="mt-4 h-56">
          <div className="h-full w-full text-neutral-900">
            <ResponsiveContainer width="100%" height="100%">
            <LineChart data={series} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
              <Tooltip
                formatter={(value: unknown, _name, props) => {
                  const point = props.payload as SeriesPoint | undefined;
                  if (!point) return [String(value), "Score"];
                  return [`${point.score} (${point.percent}%)`, "Score"];
                }}
              />
              <Line
                type="monotone"
                dataKey="score"
                stroke="currentColor"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <p className="text-xs text-neutral-500">Each habit is weighted 1 point.</p>
    </div>
  );
}
