import { X } from "lucide-react";

export function RemoveButton({
  id,
  personId,
  action,
}: {
  id: string;
  personId?: string;
  action: (formData: FormData) => Promise<void>;
}) {
  return (
    <form action={action}>
      <input type="hidden" name="id" value={id} />
      {personId && <input type="hidden" name="person_id" value={personId} />}
      <button className="cursor-pointer rounded-md p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600" aria-label="Remove">
        <X size={14} />
      </button>
    </form>
  );
}
