import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { HabitsClient } from "./habits-client";
import { DEFAULT_PASS_PERCENTAGE } from "@/lib/habits/templates";

export const dynamic = "force-dynamic";

export default async function HabitsPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const habits = await supabase
    .from("habits")
    .select("id,name")
    .eq("user_id", user.id)
    .eq("archived", false)
    .order("created_at", { ascending: true });

  if (habits.error) {
    throw new Error(habits.error.message);
  }

  const settings = await supabase
    .from("user_settings")
    .select("pass_percentage")
    .eq("user_id", user.id)
    .maybeSingle();

  const passPercentage = settings.data?.pass_percentage ?? DEFAULT_PASS_PERCENTAGE;

  return <HabitsClient habits={habits.data} passPercentage={passPercentage} />;
}
