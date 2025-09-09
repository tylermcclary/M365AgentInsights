"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import {
  PanelRightOpen,
  PanelRightClose,
  Loader2,
  Sparkles,
  User,
  Mail,
  History,
  Clock,
  CheckCircle2,
  Star,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { analyzeClientCommunications, type ClientInsights, type Communication } from "@/services/ai-insights";
import { subscribeContext } from "@/services/contextAnalyzer";
import Tooltip from "@/components/ui/Tooltip";
import Button from "@/components/ui/Button";

type EmailContext = {
  id?: string;
  sender?: string;
  senderEmail?: string;
  subject?: string;
  body?: string;
  receivedAt?: string; // ISO
};

type SectionKey =
  | "summary"
  | "history"
  | "lastInteraction"
  | "nextActions"
  | "highlights";

export default function AssistantPanel({
  email,
  defaultOpen = true,
  onCollapse,
  communications,
  clientEmail,
}: {
  email?: EmailContext | null;
  defaultOpen?: boolean;
  onCollapse?: () => void;
  communications?: Communication[];
  clientEmail?: string;
}) {
  const [open, setOpen] = useState<boolean>(defaultOpen);
  const [loading, setLoading] = useState<boolean>(false);
  const [sectionsOpen, setSectionsOpen] = useState<Record<SectionKey, boolean>>({
    summary: true,
    history: false,
    lastInteraction: true,
    nextActions: true,
    highlights: false,
  });

  const [insights, setInsights] = useState<ClientInsights | null>(null);

  const clientDisplay = useMemo(() => email?.sender ?? "Client", [email?.sender]);

  const analyze = useCallback(async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 300));
    const comms: Communication[] = (communications && communications.length > 0)
      ? communications
      : email
        ? [{
            id: email.id ?? "selected",
            type: "email",
            from: email.senderEmail ?? email.sender,
            subject: email.subject,
            body: email.body,
            timestamp: email.receivedAt ?? new Date().toISOString(),
          }]
        : [];
    console.log("Analyzing with communications:", comms.length, "items", comms);
    const insightsResp = analyzeClientCommunications(clientEmail ?? (email?.senderEmail ?? email?.sender ?? "*"), comms);
    console.log("Analysis result:", insightsResp);
    setInsights(insightsResp);
    setLoading(false);
  }, [communications, email, clientEmail]);

  // Auto-analyze when communications are available
  useEffect(() => {
    console.log("AssistantPanel useEffect - communications:", communications?.length, "insights:", !!insights);
    if (communications && communications.length > 0) {
      console.log("Auto-triggering analysis with communications:", communications.length);
      analyze();
    }
  }, [communications, analyze]);

  // Listen for context analyzer events to auto-update insights
  useEffect(() => {
    const unsub = subscribeContext(e => {
      const key = (clientEmail ?? email?.senderEmail ?? email?.sender ?? "").toLowerCase();
      if (!key || e.clientEmail.toLowerCase() === key) {
        setInsights(e.insights);
      }
    });
    return () => {
      unsub();
    };
  }, [clientEmail, email?.senderEmail, email?.sender]);

  const history = useMemo(() => {
    const base: Communication[] = communications ?? [];
    // Since all communications are already filtered for the selected client, just use them all
    return base
      .slice()
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10)
      .map(i => ({ when: new Date(i.timestamp).toLocaleString(), type: i.type, subject: i.subject ?? "(no subject)" }));
  }, [communications]);

  function toggleSection(key: SectionKey) {
    setSectionsOpen(prev => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <div className="h-full border-l bg-white dark:bg-neutral-950 flex flex-col w-full max-w-md">
      <div className="flex items-center justify-between px-3 py-2 border-b bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-neutral-900 dark:to-neutral-900">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-indigo-600" />
          <div className="text-sm font-semibold">AI Assistant</div>
        </div>
        <button
          className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded border hover:bg-white/60"
          onClick={() => {
            if (open) {
              onCollapse?.();
            } else {
              setOpen(true);
            }
          }}
        >
          <PanelRightClose className="h-4 w-4" /> Hide
        </button>
      </div>

      {open ? (
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {/* Analyze button */}
          <div className="flex items-center justify-between">
            <div className="text-xs text-neutral-600">Analyze current email context</div>
            <Tooltip content="Runs AI summarization and recommendations based on recent communications">
              <span>
                <Button onClick={analyze} disabled={loading} size="sm" leftIcon={loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}>{loading ? "Analyzing..." : "Run analysis"}</Button>
              </span>
            </Tooltip>
          </div>

          {/* Client Summary */}
          <Section
            title="Client Summary"
            icon={<User className="h-4 w-4" />}
            open={sectionsOpen.summary}
            onToggle={() => toggleSection("summary")}
            loading={loading}
          >
            <p className="text-sm">{insights?.summary.text ?? "Insights will appear here after analysis."}</p>
            {insights?.summary.topics?.length ? (
              <div className="text-xs text-neutral-500 mt-2">Topics: {insights.summary.topics.join(", ")}</div>
            ) : null}
          </Section>

          {/* Communication History */}
          <Section
            title="Communication History"
            icon={<History className="h-4 w-4" />}
            open={sectionsOpen.history}
            onToggle={() => toggleSection("history")}
            loading={loading}
          >
            <ul className="space-y-2">
              {history.map((i, idx) => (
                <li key={idx} className="text-sm">
                  <span className="text-neutral-500 mr-2">{i.when}</span>
                  <span className="font-medium mr-2">{i.type}</span>
                  <span className="text-neutral-700">{i.subject}</span>
                </li>
              ))}
              {history.length === 0 && <li className="text-sm text-neutral-500">No items found for this contact.</li>}
            </ul>
          </Section>

          {/* Last Interaction Summary */}
          <Section
            title="Last Interaction Summary"
            icon={<Clock className="h-4 w-4" />}
            open={sectionsOpen.lastInteraction}
            onToggle={() => toggleSection("lastInteraction")}
            loading={loading}
          >
            <p className="text-sm">
              {insights?.lastInteraction
                ? `${new Date(insights.lastInteraction.when).toLocaleString()} • ${insights.lastInteraction.type} • ${insights.lastInteraction.subject ?? "(no subject)"}`
                : "Awaiting analysis."}
            </p>
          </Section>

          {/* Recommended Next Actions */}
          <Section
            title="Recommended Next Actions"
            icon={<CheckCircle2 className="h-4 w-4" />}
            open={sectionsOpen.nextActions}
            onToggle={() => toggleSection("nextActions")}
            loading={loading}
          >
            <ul className="list-disc pl-5 space-y-1">
              {(insights?.recommendedActions ?? []).map(a => (
                <li key={a.id} className="text-sm">
                  <span className="font-medium">{a.title}</span>
                  <span className="text-neutral-500"> — {a.rationale}</span>
                  {a.dueDate ? <span className="ml-2 text-neutral-400">(Due {a.dueDate})</span> : null}
                </li>
              ))}
              {(!insights?.recommendedActions || insights.recommendedActions.length === 0) && (
                <li className="text-sm text-neutral-500">No suggestions yet.</li>
              )}
            </ul>
          </Section>

          {/* Client Highlights */}
          <Section
            title="Client Highlights"
            icon={<Star className="h-4 w-4" />}
            open={sectionsOpen.highlights}
            onToggle={() => toggleSection("highlights")}
            loading={loading}
          >
            <dl className="grid grid-cols-1 gap-2">
              {(insights?.highlights ?? []).map((h, idx) => (
                <div key={idx} className="flex items-start gap-2 text-sm">
                  <dt className="w-36 shrink-0 text-neutral-500">{h.label}</dt>
                  <dd className="text-neutral-800">{h.value}</dd>
                </div>
              ))}
              {(!insights?.highlights || insights.highlights.length === 0) && (
                <div className="text-sm text-neutral-500">No highlights yet.</div>
              )}
            </dl>
          </Section>
        </div>
      ) : null}
    </div>
  );
}

function Section({
  title,
  icon,
  open,
  onToggle,
  loading,
  children,
}: {
  title: string;
  icon: React.ReactElement;
  open: boolean;
  onToggle: () => void;
  loading?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="border rounded-md overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-3 py-2 bg-neutral-50 dark:bg-neutral-900 border-b"
      >
        <div className="flex items-center gap-2">
          {icon}
          <div className="text-sm font-semibold">{title}</div>
        </div>
        {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      </button>
      {open && (
        <div className="p-3">
          {loading ? (
            <div className="text-xs text-neutral-500 inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Loading...</div>
          ) : (
            children
          )}
        </div>
      )}
    </div>
  );
}


