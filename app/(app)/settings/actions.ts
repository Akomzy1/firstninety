/**
 * Settings server actions — memory + context CRUD.
 *
 * Backed by user_responsibilities (declared memory, soft-deleted via
 * is_current=false) and user_context (immutable role + start_date,
 * editable sector / work_setup / probation date / timezone).
 */
"use server";

import { revalidatePath } from "next/cache";

import { requireAuth } from "@/lib/auth/server";
import { createClient } from "@/lib/db/server";
import type { Database, TablesUpdate } from "@/lib/db/types.gen";

type MemorySource = Database["public"]["Enums"]["memory_source_enum"];
type WorkSetup = Database["public"]["Enums"]["work_setup_enum"];

const VALID_WORK_SETUPS: ReadonlyArray<WorkSetup> = ["remote", "hybrid", "office"];

export type SettingsActionState = { error?: string; success?: string } | null;

function bumpMemorySurface() {
  revalidatePath("/settings/memory");
}

export async function listUserResponsibilities() {
  const user = await requireAuth();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("user_responsibilities")
    .select("id, description, source, created_at, updated_at")
    .eq("user_id", user.id)
    .eq("is_current", true)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function addUserResponsibilityAction(
  _prev: SettingsActionState,
  formData: FormData,
): Promise<SettingsActionState> {
  const description = formData.get("description")?.toString().trim() ?? "";
  if (description.length < 3) {
    return { error: "A short sentence is enough." };
  }
  if (description.length > 500) {
    return { error: "Try shortening to a couple of sentences." };
  }

  const user = await requireAuth();
  const supabase = await createClient();
  const { error } = await supabase.from("user_responsibilities").insert({
    user_id: user.id,
    description,
    source: "user_manual" satisfies MemorySource,
  });
  if (error) return { error: error.message };
  bumpMemorySurface();
  return { success: "Saved." };
}

export async function updateUserResponsibilityAction(
  _prev: SettingsActionState,
  formData: FormData,
): Promise<SettingsActionState> {
  const id = formData.get("id")?.toString() ?? "";
  const description = formData.get("description")?.toString().trim() ?? "";
  if (!id) return { error: "Missing id." };
  if (description.length < 3) return { error: "A short sentence is enough." };
  if (description.length > 500) return { error: "Try shortening to a couple of sentences." };

  const user = await requireAuth();
  const supabase = await createClient();
  const { error } = await supabase
    .from("user_responsibilities")
    .update({ description })
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) return { error: error.message };
  bumpMemorySurface();
  return { success: "Updated." };
}

export async function deleteUserResponsibilityAction(formData: FormData): Promise<void> {
  const id = formData.get("id")?.toString();
  if (!id) return;
  const user = await requireAuth();
  const supabase = await createClient();
  await supabase
    .from("user_responsibilities")
    .update({ is_current: false })
    .eq("id", id)
    .eq("user_id", user.id);
  bumpMemorySurface();
}

type ContextField = "sector" | "work_setup" | "start_date" | "probation_review_date";

export async function updateUserContextFactAction(
  _prev: SettingsActionState,
  formData: FormData,
): Promise<SettingsActionState> {
  const field = formData.get("field")?.toString() as ContextField | undefined;
  const raw = formData.get("value")?.toString() ?? "";
  if (!field) return { error: "Missing field name." };

  const update: TablesUpdate<"user_context"> = {};
  if (field === "sector") {
    update.sector = raw.trim() === "" ? null : raw.trim();
  } else if (field === "work_setup") {
    if (raw === "") {
      update.work_setup = null;
    } else if (!(VALID_WORK_SETUPS as ReadonlyArray<string>).includes(raw)) {
      return { error: "Pick remote, hybrid, or office." };
    } else {
      update.work_setup = raw as WorkSetup;
    }
  } else if (field === "start_date") {
    if (raw === "") {
      update.start_date = null;
    } else if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
      return { error: "Use a YYYY-MM-DD date." };
    } else {
      update.start_date = raw;
    }
  } else if (field === "probation_review_date") {
    if (raw === "") {
      update.probation_review_date = null;
    } else if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
      return { error: "Use a YYYY-MM-DD date." };
    } else {
      update.probation_review_date = raw;
    }
  }

  const user = await requireAuth();
  const supabase = await createClient();
  const { error } = await supabase
    .from("user_context")
    .update(update)
    .eq("user_id", user.id);
  if (error) return { error: error.message };
  bumpMemorySurface();
  return { success: "Updated." };
}

/**
 * "Delete everything I've told you" — soft-deletes all responsibilities and
 * clears the editable context fields (sector, work_setup, probation date,
 * focus_areas). Role and start_date stay; clearing those requires
 * re-onboarding (per Build Prompt 1.3 verification).
 */
export async function deleteAllMemoryAction(): Promise<SettingsActionState> {
  const user = await requireAuth();
  const supabase = await createClient();

  const [responsibilitiesResult, contextResult] = await Promise.all([
    supabase
      .from("user_responsibilities")
      .update({ is_current: false })
      .eq("user_id", user.id)
      .eq("is_current", true),
    supabase
      .from("user_context")
      .update({
        sector: null,
        work_setup: null,
        probation_review_date: null,
        focus_areas: null,
      })
      .eq("user_id", user.id),
  ]);

  if (responsibilitiesResult.error) return { error: responsibilitiesResult.error.message };
  if (contextResult.error) return { error: contextResult.error.message };

  bumpMemorySurface();
  return { success: "Memory cleared." };
}
