"use client";

import { useMemo, useState } from "react";
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

  async function analyze() {
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
    const insightsResp = analyzeClientCommunications(clientEmail ?? (email?.senderEmail ?? email?.sender ?? "*"), comms);
    setInsights(insightsResp);
    setLoading(false);
  }

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
            <button
              onClick={analyze}
              disabled={loading}
              className="inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {loading ? "Analyzing..." : "Run analysis"}
            </button>
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
            <div className="text-sm text-neutral-500">Uses current folder emails for context.</div>
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
  icon: JSX.Element;
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


