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

export const PROFILE_STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  submitted: "Awaiting screening",
  screening: "Screening",
  listed: "Listed",
  rejected: "Rejected",
  inactive: "Inactive",
};

export const REQUEST_STATUS_LABELS: Record<string, string> = {
  new: "New",
  in_review: "In review",
  matching: "Matching",
  fulfilled: "Fulfilled",
  closed: "Closed",
};

export const CONTACT_STATUS_LABELS: Record<string, string> = {
  new: "New",
  responded: "Responded",
  closed: "Closed",
};

export const SHORTLIST_LABELS: Record<string, string> = {
  shortlisted: "Shortlisted",
  interviewed: "Interviewed",
  selected: "Selected",
  rejected: "Rejected",
};

export const PERSON_TYPE_LABELS: Record<string, string> = {
  freelancer: "Freelancer",
  partner_resource: "Partner resource",
  client_contact: "Client contact",
};

export const ORG_TYPE_LABELS: Record<string, string> = {
  client_company: "Client",
  consulting_partner: "Partner",
};

export function formatDate(value: string | Date | null | undefined) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export function formatDateTime(value: string | Date | null | undefined) {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function daysAgo(days: number) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

export function timeAgo(value: Date | string) {
  const seconds = Math.round((Date.now() - new Date(value).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;
  return formatDate(value);
}

/** Trimmed text field, or null when empty or missing. */
export function optional(value: FormDataEntryValue | null): string | null {
  const s = typeof value === "string" ? value.trim() : "";
  return s.length ? s : null;
}

export const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
