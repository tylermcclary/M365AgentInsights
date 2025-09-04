import { addDays, format } from "date-fns";
import type { GraphMailItem, GraphCalendarEvent } from "@/types";

export type Insight = {
  id: string;
  type: "task" | "reminder" | "summary";
  title: string;
  detail?: string;
};

export function generateInsightsFromGraph(
  emails: GraphMailItem[],
  events: GraphCalendarEvent[]
): Insight[] {
  const insights: Insight[] = [];

  const upcoming = events.slice(0, 3).map(e => ({
    id: `event-${e.id}`,
    type: "reminder" as const,
    title: `Upcoming: ${e.subject}`,
    detail: `${format(new Date(e.start.dateTime), "PPpp")} with ${e.organizer?.emailAddress?.name ?? "Unknown"}`,
  }));
  insights.push(...upcoming);

  const followUps = emails
    .filter(m => /follow\s*up|action required|approve/i.test(m.subject ?? ""))
    .slice(0, 3)
    .map(m => ({
      id: `mail-${m.id}`,
      type: "task" as const,
      title: `Follow up: ${m.subject}`,
      detail: `From ${m.from?.emailAddress?.name ?? "Unknown"} by ${format(addDays(new Date(m.receivedDateTime), 2), "PP")}`,
    }));
  insights.push(...followUps);

  if (insights.length === 0) {
    insights.push({ id: "summary-1", type: "summary", title: "You're all caught up!" });
  }

  return insights;
}


