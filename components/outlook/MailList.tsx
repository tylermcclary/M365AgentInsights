"use client";

import type { GraphMailItem } from "@/types";
import { Mail } from "lucide-react";
import { format } from "date-fns";

export function MailList({ items }: { items: GraphMailItem[] }) {
  return (
    <div className="divide-y border rounded-md overflow-hidden">
      {items.map(m => (
        <div key={m.id} className="flex items-center gap-3 p-3 hover:bg-gray-50">
          <Mail className="h-4 w-4 text-gray-500" />
          <div className="flex-1">
            <div className="text-sm font-medium line-clamp-1">{m.subject || "(No subject)"}</div>
            <div className="text-xs text-gray-500">
              From {m.from?.emailAddress?.name || "Unknown"} • {format(new Date(m.receivedDateTime), "PPp")}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}


