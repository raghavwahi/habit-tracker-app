import {
  addDays,
  format,
  parseISO,
  startOfMonth,
  startOfWeek,
  subDays,
} from "date-fns";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ChartsClient, type SeriesPoint } from "./charts-client";

export const dynamic = "force-dynamic";

function toISODate(d: Date) {
  return format(d, "yyyy-MM-dd");
}

export default async function ChartsPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const habitsRes = await supabase
    .from("habits")
    .select("id")
    .eq("user_id", user.id)
    .eq("archived", false);

  if (habitsRes.error) {
    throw new Error(habitsRes.error.message);
  }

  const totalHabits = habitsRes.data.length;

  const start = toISODate(subDays(new Date(), 120));
  const completionsRes = await supabase
    .from("habit_completions")
    .select("day")
    .eq("user_id", user.id)
    .eq("completed", true)
    .gte("day", start);

  if (completionsRes.error) {
    throw new Error(completionsRes.error.message);
  }

  const dailyScore = new Map<string, number>();
  for (const row of completionsRes.data) {
    const day = row.day as unknown as string;
    dailyScore.set(day, (dailyScore.get(day) ?? 0) + 1);
  }

  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const monthStart = startOfMonth(today);

  let activeDaysThisWeek = 0;
  const monthDayCount = Number(format(new Date(today.getFullYear(), today.getMonth() + 1, 0), "d"));
  let activeDaysThisMonth = 0;
  for (let i = 0; i < 7; i++) {
    const d = addDays(weekStart, i);
    const key = toISODate(d);
    if (d <= today && (dailyScore.get(key) ?? 0) > 0) activeDaysThisWeek++;
  }

  for (let i = 0; i < monthDayCount; i++) {
    const d = new Date(today.getFullYear(), today.getMonth(), i + 1);
    if (d < monthStart || d > today) continue;
    const key = toISODate(d);
    if ((dailyScore.get(key) ?? 0) > 0) activeDaysThisMonth++;
  }

  const daySeries: SeriesPoint[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = subDays(today, i);
    const key = toISODate(d);
    const score = dailyScore.get(key) ?? 0;
    daySeries.push({
      key,
      label: format(d, "d MMM"),
      score,
      percent: totalHabits === 0 ? 0 : Math.round((score / totalHabits) * 100),
    });
  }

  const weekSeriesMap = new Map<string, { label: string; score: number }>();
  for (const [day, score] of dailyScore.entries()) {
    const weekKey = toISODate(startOfWeek(parseISO(day), { weekStartsOn: 1 }));
    const label = format(parseISO(weekKey), "d MMM");
    weekSeriesMap.set(weekKey, {
      label,
      score: (weekSeriesMap.get(weekKey)?.score ?? 0) + score,
    });
  }
  const weekSeries: SeriesPoint[] = Array.from(weekSeriesMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-12)
    .map(([key, v]) => ({
      key,
      label: v.label,
      score: v.score,
      percent: totalHabits === 0 ? 0 : Math.round((v.score / (totalHabits * 7)) * 100),
    }));

  const monthSeriesMap = new Map<string, { label: string; score: number }>();
  for (const [day, score] of dailyScore.entries()) {
    const monthKey = toISODate(startOfMonth(parseISO(day)));
    const label = format(parseISO(monthKey), "MMM yyyy");
    monthSeriesMap.set(monthKey, {
      label,
      score: (monthSeriesMap.get(monthKey)?.score ?? 0) + score,
    });
  }
  const monthSeries: SeriesPoint[] = Array.from(monthSeriesMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-12)
    .map(([key, v]) => ({
      key,
      label: v.label,
      score: v.score,
      percent: totalHabits === 0 ? 0 : Math.round((v.score / (totalHabits * 30)) * 100),
    }));

  return (
    <ChartsClient
      totalHabits={totalHabits}
      activeDaysThisWeek={activeDaysThisWeek}
      activeDaysThisMonth={activeDaysThisMonth}
      daySeries={daySeries}
      weekSeries={weekSeries}
      monthSeries={monthSeries}
    />
  );
}
