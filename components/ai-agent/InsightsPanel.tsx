"use client";

import type { Insight } from "@/services/ai-insights";
import { Lightbulb, CheckCircle2, Bell } from "lucide-react";

function Icon({ type }: { type: Insight["type"] }) {
  if (type === "task") return <CheckCircle2 className="h-4 w-4 text-blue-600" />;
  if (type === "reminder") return <Bell className="h-4 w-4 text-amber-600" />;
  return <Lightbulb className="h-4 w-4 text-emerald-600" />;
}

export function InsightsPanel({ insights }: { insights: Insight[] }) {
  return (
    <div className="space-y-2">
      {insights.map(i => (
        <div key={i.id} className="flex items-start gap-3 p-3 border rounded-md">
          <Icon type={i.type} />
          <div>
            <div className="text-sm font-medium">{i.title}</div>
            {i.detail && <div className="text-xs text-gray-600">{i.detail}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}


