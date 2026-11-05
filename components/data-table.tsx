import type { ReactNode } from "react";
import { Card } from "@/components/ui";

export function DataTable({
  headers,
  children,
  empty,
  colSpan,
}: {
  headers: string[];
  children: ReactNode;
  empty?: boolean;
  colSpan?: number;
}) {
  return (
    <Card className="overflow-x-auto p-0">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-white/5 text-xs uppercase tracking-wider text-slate-500">
          <tr>
            {headers.map((h) => (
              <th key={h} className="px-5 py-3 font-medium">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5 [&_td]:px-5 [&_td]:py-3 [&_td]:align-top">
          {children}
          {empty && (
            <tr>
              <td colSpan={colSpan ?? headers.length} className="py-10 text-center text-slate-500">
                Nothing here yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </Card>
  );
}

/** Small inline select + submit that posts `id` and `status` to a server action. */
export function StatusSelect({
  id,
  value,
  options,
  action,
}: {
  id: string;
  value: string;
  options: { value: string; label: string }[];
  action: (formData: FormData) => Promise<void>;
}) {
  return (
    <form action={action} className="flex items-center gap-2">
      <input type="hidden" name="id" value={id} />
      <select
        name="status"
        defaultValue={value}
        className="rounded-lg border border-white/10 bg-ink-800 px-2 py-1.5 text-xs text-slate-200"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <button className="rounded-lg border border-white/10 px-2 py-1.5 text-xs text-slate-300 hover:bg-white/5">
        Update
      </button>
    </form>
  );
}
