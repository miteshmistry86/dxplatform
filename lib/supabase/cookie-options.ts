import type { CookieOptionsWithName } from "@supabase/ssr";

/**
 * Session cookies are only ever read server-side (no browser Supabase client),
 * so they are httpOnly and inaccessible to page scripts.
 */
export const authCookieOptions: CookieOptionsWithName = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
};
