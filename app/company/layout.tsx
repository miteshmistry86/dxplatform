import { PortalShell } from "@/components/portal-shell";
import { requireRole } from "@/lib/auth";

const NAV = [
  { href: "/company", label: "Overview", exact: true },
  { href: "/company/talent", label: "Browse talent" },
  { href: "/company/requests", label: "Resource requests" },
];

export default async function CompanyLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole("company_user");
  return (
    <PortalShell label="Company portal" nav={NAV} email={user.email}>
      {children}
    </PortalShell>
  );
}
