import { format } from "date-fns";
import { z } from "zod";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { TrackerClient } from "./tracker-client";
import { DEFAULT_PASS_PERCENTAGE } from "@/lib/habits/templates";

const daySchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

export const dynamic = "force-dynamic";

export default async function AppPage({
  searchParams,
}: {
  searchParams:
    | Record<string, string | string[] | undefined>
    | Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await Promise.resolve(searchParams);
  const dateParam = typeof sp.date === "string" ? sp.date : undefined;
  const parsedDate = daySchema.safeParse(dateParam);
  const day = parsedDate.success
    ? parsedDate.data
    : format(new Date(), "yyyy-MM-dd");

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const settings = await supabase
    .from("user_settings")
    .select("pass_percentage")
    .eq("user_id", user.id)
    .maybeSingle();

  let passPercentage = DEFAULT_PASS_PERCENTAGE;

  if (settings.data?.pass_percentage != null) {
    passPercentage = settings.data.pass_percentage;
  } else {
    await supabase
      .from("user_settings")
      .insert({ user_id: user.id, pass_percentage: DEFAULT_PASS_PERCENTAGE });
  }

  const habits = await supabase
    .from("habits")
    .select("id,name,sort_order,created_at")
    .eq("user_id", user.id)
    .eq("archived", false)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (habits.error) {
    throw new Error(habits.error.message);
  }

  const completions = await supabase
    .from("habit_completions")
    .select("habit_id")
    .eq("user_id", user.id)
    .eq("day", day)
    .eq("completed", true);

  if (completions.error) {
    throw new Error(completions.error.message);
  }

  return (
    <TrackerClient
      key={day}
      day={day}
      hadDateParam={parsedDate.success}
      habits={habits.data}
      completedHabitIds={completions.data.map((c) => c.habit_id)}
      passPercentage={passPercentage}
    />
  );
}
