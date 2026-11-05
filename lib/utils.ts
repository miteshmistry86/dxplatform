import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const ROLE_LABELS: Record<string, string> = {
  architect: "Architect",
  business_analyst: "Business Analyst",
  developer: "Developer",
  qa: "QA",
  project_manager: "Project Manager",
  consultant: "Consultant",
};

export const LEVEL_LABELS: Record<string, string> = {
  junior: "Junior",
  middle: "Middle",
  expert: "Expert",
};

export const STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  submitted: "Submitted for screening",
  screening: "Screening in progress",
  listed: "Listed",
  rejected: "Not approved",
  inactive: "Inactive",
  new: "New",
  in_review: "In review",
  matching: "Matching",
  fulfilled: "Fulfilled",
  closed: "Closed",
  responded: "Responded",
};

export function formatDate(value: string | Date | null | undefined) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

/** Normalises an optional form field: empty string becomes null. */
export function optional(value: FormDataEntryValue | null): string | null {
  const s = typeof value === "string" ? value.trim() : "";
  return s.length ? s : null;
}
