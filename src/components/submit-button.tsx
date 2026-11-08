"use client";

import { useFormStatus } from "react-dom";
import { primaryButtonClass, secondaryButtonClass } from "@/components/classes";

export function SubmitButton({
  label,
  pendingLabel,
  tone = "primary",
}: {
  label: string;
  pendingLabel: string;
  tone?: "primary" | "secondary";
}) {
  const { pending } = useFormStatus();
  const className = tone === "primary" ? primaryButtonClass : secondaryButtonClass;

  return (
    <button type="submit" className={className} disabled={pending}>
      {pending ? pendingLabel : label}
    </button>
  );
}
