import { PortalShell } from "@/components/portal-shell";
import { requireRole } from "@/lib/auth";

const NAV = [
  { href: "/developer", label: "Overview", exact: true },
  { href: "/developer/profile", label: "My profile" },
];

export default async function DeveloperLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole("developer", "partner_admin");
  return (
    <PortalShell label="Developer portal" nav={NAV} email={user.email}>
      {children}
    </PortalShell>
  );
}
