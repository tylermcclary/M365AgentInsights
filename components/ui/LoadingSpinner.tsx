"use client";

import { Loader2 } from "lucide-react";

export default function LoadingSpinner({ label = "Loading", size = 20 }: { label?: string; size?: number }) {
  return (
    <div role="status" aria-live="polite" className="inline-flex items-center gap-2">
      <Loader2 className="animate-spin" style={{ width: size, height: size }} />
      <span className="sr-only">{label}</span>
    </div>
  );
}
