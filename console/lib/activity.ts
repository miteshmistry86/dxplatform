const ACTIONS: Record<string, string> = {
  "console.sign_in": "Signed in to the console",
  "screening.start": "Started screening a candidate",
  "screening.schedule": "Logged a screening call",
  "screening.approve": "Approved and listed a candidate",
  "screening.reject": "Rejected a candidate",
  "profile.status": "Changed a profile status",
  "profile.create": "Created a resource profile",
  "person.update": "Updated a candidate record",
  "organisation.create": "Created a company",
  "organisation.update": "Updated a company",
  "project.create": "Created a project",
  "project.update": "Updated a project",
  "request.status": "Changed a request status",
  "request.update": "Updated a resource request",
  "shortlist.add": "Shortlisted a candidate",
  "shortlist.status": "Updated a shortlist",
  "assignment.create": "Assigned a resource",
  "contact.status": "Updated an enquiry",
  "reference.add": "Added reference data",
  "reference.toggle": "Toggled reference data",
  "reference.rename": "Renamed reference data",
};

export function describeAction(action: string, data: unknown): string {
  const label = ACTIONS[action] ?? action.replaceAll(".", " ").replaceAll("_", " ");
  const d = (data ?? {}) as Record<string, unknown>;
  const name = typeof d.name === "string" ? d.name : undefined;
  const status = typeof d.status === "string" ? d.status.replaceAll("_", " ") : undefined;
  if (name) return `${label}: ${name}`;
  if (status) return `${label} to ${status}`;
  return label;
}
