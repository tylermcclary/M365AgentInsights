"use client";

import { useId, useState, type ReactNode } from "react";

export default function Tooltip({ content, children }: { content: ReactNode; children: ReactNode }) {
  const id = useId();
  const [open, setOpen] = useState(false);
  return (
    <span className="relative inline-block" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <span aria-describedby={id}>{children}</span>
      {open && (
        <div
          id={id}
          role="tooltip"
          className="absolute z-50 -top-2 left-1/2 -translate-x-1/2 -translate-y-full px-2 py-1 rounded bg-neutral-900 text-white text-[11px] shadow-md animate-fade-in"
        >
          {content}
          <span className="absolute left-1/2 -translate-x-1/2 top-full border-4 border-transparent border-t-neutral-900" />
        </div>
      )}
    </span>
  );
}


