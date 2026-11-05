"use client";

import { startTransition, type FormEvent } from "react";

/**
 * Builds FormData from the live input values. A plain `<form action>` submission
 * was arriving without the password fields, which failed validation.
 */
export function submitWithFields(action: (formData: FormData) => void) {
  return (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    for (const element of form.elements) {
      if (element instanceof HTMLInputElement && element.name) {
        formData.set(element.name, element.value);
      }
    }
    startTransition(() => {
      action(formData);
    });
  };
}
