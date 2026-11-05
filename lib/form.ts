export type FormState = {
  ok?: boolean;
  error?: string;
  message?: string;
  /** Submitted values echoed back so fields survive React's post-action form reset. */
  values?: Record<string, string>;
};

export const initialFormState: FormState = {};
