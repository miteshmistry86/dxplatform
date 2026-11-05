import { PortalShell } from "@/components/portal-shell";
import { requireRole } from "@/lib/auth";

const NAV = [
  { href: "/admin", label: "Overview", exact: true },
  { href: "/admin/screening", label: "Screening queue" },
  { href: "/admin/developers", label: "Developers" },
  { href: "/admin/companies", label: "Companies" },
  { href: "/admin/requests", label: "Resource requests" },
  { href: "/admin/contacts", label: "Contact requests" },
  { href: "/admin/reference", label: "Reference data" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole("admin");
  return (
    <PortalShell label="Platform admin" nav={NAV} email={user.email}>
      {children}
    </PortalShell>
  );
}
