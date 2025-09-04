"use client";

import type { GraphCalendarEvent } from "@/types";
import { CalendarDays } from "lucide-react";
import { format } from "date-fns";

export function CalendarList({ items }: { items: GraphCalendarEvent[] }) {
  return (
    <div className="divide-y border rounded-md overflow-hidden">
      {items.map(e => (
        <div key={e.id} className="flex items-center gap-3 p-3 hover:bg-gray-50">
          <CalendarDays className="h-4 w-4 text-gray-500" />
          <div className="flex-1">
            <div className="text-sm font-medium line-clamp-1">{e.subject || "(No subject)"}</div>
            <div className="text-xs text-gray-500">
              {format(new Date(e.start.dateTime), "PPp")} - {format(new Date(e.end.dateTime), "p")}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}


