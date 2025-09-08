"use client";

import { useEffect, useState } from "react";

export type Toast = {
  id: string;
  type?: "success" | "error" | "info" | "warning";
  message: string;
  durationMs?: number;
};

export default function NotificationToast({ toast, onDismiss }: { toast: Toast | null; onDismiss: (id: string) => void }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!toast) return;
    setVisible(true);
    const t = setTimeout(() => {
      setVisible(false);
      onDismiss(toast.id);
    }, toast.durationMs ?? 3000);
    return () => clearTimeout(t);
  }, [toast, onDismiss]);

  if (!toast) return null;
  const color = toast.type === "success" ? "bg-emerald-600" : toast.type === "error" ? "bg-red-600" : toast.type === "warning" ? "bg-amber-600" : "bg-neutral-800";
  return (
    <div className={`fixed bottom-4 right-4 z-50 text-white px-3 py-2 rounded shadow-lg transition-all ${color} ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`} role="status" aria-live="polite">
      {toast.message}
    </div>
  );
}


