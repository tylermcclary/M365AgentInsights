import { addDays, differenceInCalendarWeeks, format } from "date-fns";
import type { GraphMailItem, GraphCalendarEvent } from "@/types";

// Existing exports used by UI
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

// ==============================
// POC AI Insights (mock engine)
// ==============================

export type Communication = {
  id: string;
  type: "email" | "event" | "chat";
  from?: string;
  subject?: string;
  body?: string;
  timestamp: string; // ISO
};

export type ClientSummary = {
  text: string;
  topics: string[];
  sentiment: "positive" | "neutral" | "negative";
  frequencyPerWeek: number;
};

export type LastInteraction = {
  when: string;
  type: Communication["type"];
  subject?: string;
  snippet?: string;
};

export type NextBestAction = {
  id: string;
  title: string;
  rationale: string;
  dueDate?: string;
  priority: "low" | "medium" | "high";
};

export type ClientHighlight = {
  label: string;
  value: string;
};

export type ClientInsights = {
  summary: ClientSummary;
  lastInteraction: LastInteraction | null;
  recommendedActions: NextBestAction[];
  highlights: ClientHighlight[];
};

const TOPIC_KEYWORDS: Record<string, RegExp> = {
  portfolio: /(portfolio|allocation|rebalance|holdings)/i,
  meeting: /(meet|call|schedule|zoom|teams)/i,
  performance: /(performance|returns|benchmark|alpha|beta)/i,
  risk: /(risk|volatility|drawdown|hedge)/i,
  fees: /(fee|billing|invoice|cost)/i,
  goals: /(goal|retirement|college|house|wedding|vacation)/i,
};

const POSITIVE_WORDS = /(thanks|great|appreciate|good|pleased|glad|happy|excellent)/i;
const NEGATIVE_WORDS = /(concern|issue|problem|delay|bad|unhappy|angry|frustrated)/i;

function safeText(...parts: Array<string | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

function normalizeCommunications(communications: any[]): Communication[] {
  return (communications ?? []).map((c, idx) => ({
    id: String(c.id ?? idx),
    type: (c.type ?? "email") as Communication["type"],
    from: c.from?.emailAddress?.address ?? c.from?.email ?? c.from ?? undefined,
    subject: c.subject ?? c.summary ?? "",
    body: c.body?.content ?? c.bodyPreview ?? c.preview ?? c.body ?? "",
    timestamp: c.timestamp ?? c.createdDateTime ?? c.receivedDateTime ?? c.start?.dateTime ?? new Date().toISOString(),
  }));
}

export function generateClientSummary(communications: any[]): ClientSummary {
  try {
    const items = normalizeCommunications(communications);
    const textBlob = items.map(i => safeText(i.subject, i.body)).join(" \n ");
    const topics = Object.entries(TOPIC_KEYWORDS)
      .filter(([, re]) => re.test(textBlob))
      .map(([topic]) => topic);

    let score = 0;
    score += (textBlob.match(POSITIVE_WORDS)?.length ?? 0);
    score -= (textBlob.match(NEGATIVE_WORDS)?.length ?? 0);
    const sentiment: ClientSummary["sentiment"] = score > 1 ? "positive" : score < -1 ? "negative" : "neutral";

    // Frequency approx: messages per week across the range
    const timestamps = items.map(i => new Date(i.timestamp)).sort((a, b) => a.getTime() - b.getTime());
    let frequencyPerWeek = items.length;
    if (timestamps.length >= 2) {
      const weeks = Math.max(1, differenceInCalendarWeeks(timestamps[timestamps.length - 1], timestamps[0]));
      frequencyPerWeek = Math.round((items.length / weeks) * 10) / 10;
    }

    const text = `Client communications discuss ${topics.length > 0 ? topics.join(", ") : "general topics"}. Overall sentiment appears ${sentiment}. Estimated frequency ~${frequencyPerWeek}/week.`;
    return { text, topics, sentiment, frequencyPerWeek };
  } catch (error) {
    return { text: "No summary available.", topics: [], sentiment: "neutral", frequencyPerWeek: 0 };
  }
}

export function identifyLastInteraction(communications: any[]): LastInteraction | null {
  try {
    const items = normalizeCommunications(communications);
    if (items.length === 0) return null;
    const last = items.reduce((a, b) => (new Date(a.timestamp) > new Date(b.timestamp) ? a : b));
    return {
      when: last.timestamp,
      type: last.type,
      subject: last.subject,
      snippet: (last.body ?? "").slice(0, 140),
    };
  } catch {
    return null;
  }
}

export function suggestNextBestActions(clientData: any): NextBestAction[] {
  try {
    const communications = normalizeCommunications(clientData?.communications ?? []);
    const hasMeeting = communications.some(c => TOPIC_KEYWORDS.meeting.test(safeText(c.subject, c.body)));
    const hasRebalance = communications.some(c => TOPIC_KEYWORDS.portfolio.test(safeText(c.subject, c.body)));

    const actions: NextBestAction[] = [];
    if (!hasMeeting) {
      actions.push({
        id: "nba-1",
        title: "Propose next meeting times",
        rationale: "No recent scheduling detected; maintain cadence.",
        dueDate: format(addDays(new Date(), 2), "yyyy-MM-dd"),
        priority: "medium",
      });
    }
    if (hasRebalance) {
      actions.push({
        id: "nba-2",
        title: "Send portfolio change summary",
        rationale: "Recent portfolio discussions detected; summarize and request confirmation.",
        dueDate: format(addDays(new Date(), 1), "yyyy-MM-dd"),
        priority: "high",
      });
    }
    if (actions.length === 0) {
      actions.push({
        id: "nba-3",
        title: "Share market insights",
        rationale: "Keep client engaged with relevant updates.",
        priority: "low",
      });
    }
    return actions;
  } catch {
    return [
      { id: "nba-fallback", title: "Follow up with client", rationale: "General check-in.", priority: "low" },
    ];
  }
}

export function extractClientHighlights(communications: any[]): ClientHighlight[] {
  try {
    const items = normalizeCommunications(communications);
    const blob = items.map(i => safeText(i.subject, i.body)).join(" \n ");
    const highlights: ClientHighlight[] = [];

    if (TOPIC_KEYWORDS.goals.test(blob)) {
      highlights.push({ label: "Investment Goal", value: "Long-term retirement planning" });
    }
    if (/(wedding|anniversary|baby|graduation|move|relocation)/i.test(blob)) {
      highlights.push({ label: "Life Event", value: "Upcoming personal milestone" });
    }
    if (/(etf|index fund|dividend|esg)/i.test(blob)) {
      highlights.push({ label: "Preference", value: "Prefers diversified/ESG strategies" });
    }

    if (highlights.length === 0) {
      highlights.push({ label: "Preference", value: "No explicit preferences detected" });
    }
    return highlights;
  } catch {
    return [{ label: "Info", value: "No highlights available" }];
  }
}

export function analyzeClientCommunications(clientEmail: string, communications: any[]): ClientInsights {
  try {
    const items = normalizeCommunications(communications).filter(c =>
      safeText(c.from).toLowerCase().includes((clientEmail ?? "").toLowerCase()) || clientEmail === "*"
    );
    const summary = generateClientSummary(items);
    const lastInteraction = identifyLastInteraction(items);
    const recommendedActions = suggestNextBestActions({ communications: items });
    const highlights = extractClientHighlights(items);
    return { summary, lastInteraction, recommendedActions, highlights };
  } catch {
    return {
      summary: { text: "No summary available.", topics: [], sentiment: "neutral", frequencyPerWeek: 0 },
      lastInteraction: null,
      recommendedActions: [
        { id: "nba-fallback", title: "Follow up with client", rationale: "General check-in.", priority: "low" },
      ],
      highlights: [{ label: "Info", value: "No highlights available" }],
    };
  }
}


