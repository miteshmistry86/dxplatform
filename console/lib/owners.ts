/** Owner allowlist. Shared by the proxy (edge) and server code, so no server-only imports. */
export function ownerEmails(): string[] {
  return (process.env.CONSOLE_OWNER_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isOwner(email: string | null | undefined): boolean {
  return !!email && ownerEmails().includes(email.toLowerCase());
}
