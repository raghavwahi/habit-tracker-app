"use server";

import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { DEFAULT_PASS_PERCENTAGE } from "@/lib/habits/templates";

const daySchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

export type TrackerActionState =
  | { ok: true }
  | { ok: false; message: string };

export async function ensureUserSettings() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { ok: false, message: "Not authenticated." } as const;
  }

  const { data, error } = await supabase
    .from("user_settings")
    .select("pass_percentage")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    return { ok: false, message: error.message } as const;
  }

  if (data) {
    return { ok: true, passPercentage: data.pass_percentage } as const;
  }

  const insert = await supabase
    .from("user_settings")
    .insert({ user_id: user.id, pass_percentage: DEFAULT_PASS_PERCENTAGE })
    .select("pass_percentage")
    .single();

  if (insert.error) {
    return { ok: false, message: insert.error.message } as const;
  }

  return { ok: true, passPercentage: insert.data.pass_percentage } as const;
}

export async function setPassPercentage(
  _prevState: TrackerActionState,
  formData: FormData,
): Promise<TrackerActionState> {
  const parsed = z
    .object({ passPercentage: z.coerce.number().int().min(0).max(100) })
    .safeParse({ passPercentage: formData.get("passPercentage") });

  if (!parsed.success) {
    return { ok: false, message: "Pass percentage must be 0-100." };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, message: "Not authenticated." };
  }

  const { error } = await supabase
    .from("user_settings")
    .upsert({ user_id: user.id, pass_percentage: parsed.data.passPercentage });

  if (error) {
    return { ok: false, message: error.message };
  }

  return { ok: true };
}

export async function createHabit(
  _prevState: TrackerActionState,
  formData: FormData,
): Promise<TrackerActionState> {
  const parsed = z
    .object({ name: z.string().trim().min(1).max(80) })
    .safeParse({ name: formData.get("name") });

  if (!parsed.success) {
    return { ok: false, message: "Habit name is required." };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, message: "Not authenticated." };
  }

  const { error } = await supabase
    .from("habits")
    .insert({ user_id: user.id, name: parsed.data.name });

  if (error) {
    return { ok: false, message: error.message };
  }

  return { ok: true };
}

export async function applyTemplate(
  selected: string[],
): Promise<TrackerActionState> {
  const parsed = z.array(z.string().trim().min(1).max(80)).safeParse(selected);

  if (!parsed.success) {
    return { ok: false, message: "Invalid template selection." };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, message: "Not authenticated." };
  }

  const existing = await supabase
    .from("habits")
    .select("name")
    .eq("user_id", user.id)
    .eq("archived", false);

  if (existing.error) {
    return { ok: false, message: existing.error.message };
  }

  const existingNames = new Set(
    existing.data.map((h) => h.name.trim().toLowerCase()),
  );

  const toInsert = parsed.data
    .map((name) => name.trim())
    .filter((name) => !existingNames.has(name.toLowerCase()))
    .map((name) => ({ user_id: user.id, name }));

  if (toInsert.length === 0) {
    return { ok: true };
  }

  const { error } = await supabase.from("habits").insert(toInsert);

  if (error) {
    return { ok: false, message: error.message };
  }

  return { ok: true };
}

export async function setHabitCompletion(input: {
  habitId: string;
  day: string;
  completed: boolean;
}): Promise<TrackerActionState> {
  const parsed = z
    .object({
      habitId: z.string().uuid(),
      day: daySchema,
      completed: z.boolean(),
    })
    .safeParse(input);

  if (!parsed.success) {
    return { ok: false, message: "Invalid completion payload." };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, message: "Not authenticated." };
  }

  if (!parsed.data.completed) {
    const { error } = await supabase
      .from("habit_completions")
      .delete()
      .eq("user_id", user.id)
      .eq("habit_id", parsed.data.habitId)
      .eq("day", parsed.data.day);

    if (error) {
      return { ok: false, message: error.message };
    }

    return { ok: true };
  }

  const { error } = await supabase.from("habit_completions").upsert(
    {
      user_id: user.id,
      habit_id: parsed.data.habitId,
      day: parsed.data.day,
      completed: true,
    },
    { onConflict: "user_id,habit_id,day" },
  );

  if (error) {
    return { ok: false, message: error.message };
  }

  return { ok: true };
}
