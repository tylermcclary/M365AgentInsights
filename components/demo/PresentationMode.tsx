"use client";

import { useEffect, useMemo, useState } from "react";
import { clients, getCommunicationsByClient } from "@/data/sampleData";
import { analyzeClientCommunications, suggestNextBestActions, type Communication } from "@/services/ai-insights";
import Button from "@/components/ui/Button";
import Tooltip from "@/components/ui/Tooltip";
import Modal from "@/components/ui/Modal";
import NotificationToast, { type Toast } from "@/components/ui/NotificationToast";
import { Maximize2, Minimize2, ChevronLeft, ChevronRight, BookOpenText, BarChart3, PlayCircle, FileSearch2, Sparkles, Cpu, HandCoins, Rocket } from "lucide-react";

type SlideKey = "problem" | "solution" | "capabilities" | "demo" | "value" | "roadmap";

const slides: { key: SlideKey; title: string; icon: JSX.Element; summary: string }[] = [
  { key: "problem", title: "Problem: Information Overload", icon: <FileSearch2 className="h-5 w-5" />, summary: "Advisors face too many emails, meetings, and chats across channels—hard to extract what's important quickly." },
  { key: "solution", title: "Solution: AI-Powered Insights", icon: <Sparkles className="h-5 w-5" />, summary: "Summarize, prioritize, and recommend next actions from your communications automatically." },
  { key: "capabilities", title: "Capabilities", icon: <Cpu className="h-5 w-5" />, summary: "Microsoft Graph integration, context detection, insights generation, and recommended actions." },
  { key: "demo", title: "Live Demo", icon: <PlayCircle className="h-5 w-5" />, summary: "Walk through a realistic client scenario and highlight AI value." },
  { key: "value", title: "Business Value", icon: <HandCoins className="h-5 w-5" />, summary: "Save time, deepen relationships, and scale personalized service." },
  { key: "roadmap", title: "Roadmap", icon: <Rocket className="h-5 w-5" />, summary: "Deeper Teams/Calendar signals, CRM integration, compliance guardrails, LLM fine-tuning." },
];

const talkingPoints: Record<SlideKey, string[]> = {
  problem: [
    "Advisors spend hours sorting inboxes and chat threads",
    "Critical follow-ups and client signals are easy to miss",
    "Context switching across Outlook, Teams, Calendar",
  ],
  solution: [
    "AI surfaces what's important per client",
    "Summaries plus actionable recommendations",
    "Works in your existing Outlook-like workflow",
  ],
  capabilities: [
    "Pulls emails/events/chats via Graph (simulated here)",
    "Extracts topics, sentiment, and last-touch",
    "Suggests next best actions with due dates",
  ],
  demo: [
    "Select a client and simulate an incoming email",
    "See insights populate in real-time",
    "Compare before/after recommended actions",
  ],
  value: [
    "Time saved per week (est. 3–5 hours)",
    "Higher client satisfaction and retention",
    "Better preparation for every touchpoint",
  ],
  roadmap: [
    "Deeper Teams call summaries and transcript analysis",
    "CRM sync (tasks, notes) and workflow automation",
    "Model optimization and policy controls",
  ],
};

export default function PresentationMode() {
  const [isFullscreen, setFullscreen] = useState(false);
  const [idx, setIdx] = useState(0);
  const [clientId, setClientId] = useState(clients[0]?.id ?? "");
  const [toast, setToast] = useState<Toast | null>(null);

  const slide = slides[idx];
  const client = useMemo(() => clients.find(c => c.id === clientId), [clientId]);
  const comms: Communication[] = useMemo(() => {
    if (!client) return [];
    const c = getCommunicationsByClient(client.id);
    const emails = c.emails.map(e => ({ id: e.id, type: "email" as const, from: client.email, subject: e.subject, body: e.body, timestamp: e.receivedDateTime }));
    const events = c.events.map(e => ({ id: e.id, type: "event" as const, from: client.email, subject: e.subject, body: e.notes ?? "", timestamp: e.start }));
    const chats = c.chats.map(m => ({ id: m.id, type: "chat" as const, from: client.email, subject: m.content.slice(0, 60), body: m.content, timestamp: m.createdDateTime }));
    return [...emails, ...events, ...chats].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }, [client]);

  const beforeInsights = useMemo(() => (client ? analyzeClientCommunications(client.email, comms.slice(0, Math.max(1, Math.floor(comms.length / 2)))) : null), [client, comms]);
  const afterInsights = useMemo(() => (client ? analyzeClientCommunications(client.email, comms) : null), [client, comms]);
  const metrics = useMemo(() => {
    const msgs = comms.length;
    const timeSavedMin = Math.min(60, Math.round(msgs * 1.2));
    const insightsCount = (afterInsights?.recommendedActions?.length ?? 0) + (afterInsights?.highlights?.length ?? 0);
    return { msgs, timeSavedMin, insightsCount };
  }, [comms, afterInsights]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight" || e.key.toLowerCase() === "d") setIdx(i => Math.min(slides.length - 1, i + 1));
      if (e.key === "ArrowLeft" || e.key.toLowerCase() === "a") setIdx(i => Math.max(0, i - 1));
      if (e.key.toLowerCase() === "f") setFullscreen(f => !f);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className={`fixed inset-0 z-40 ${isFullscreen ? "" : "relative"} bg-white dark:bg-neutral-950 overflow-auto`}> 
      <div className="max-w-6xl mx-auto p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            <div className="text-lg font-semibold">Presentation Mode</div>
          </div>
          <div className="flex items-center gap-2">
            <Tooltip content="Toggle full screen (F)"><span><Button variant="secondary" size="sm" onClick={() => setFullscreen(f => !f)} leftIcon={isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}>{isFullscreen ? "Exit" : "Full Screen"}</Button></span></Tooltip>
            <Tooltip content="Previous (Arrow Left / A)"><span><Button variant="secondary" size="sm" onClick={() => setIdx(i => Math.max(0, i - 1))} leftIcon={<ChevronLeft className="h-4 w-4" />}>Prev</Button></span></Tooltip>
            <Tooltip content="Next (Arrow Right / D)"><span><Button variant="secondary" size="sm" onClick={() => setIdx(i => Math.min(slides.length - 1, i + 1))} rightIcon={<ChevronRight className="h-4 w-4" />}>Next</Button></span></Tooltip>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-[320px_1fr]">
          <aside className="space-y-3">
            <div className="border rounded p-3">
              <div className="text-xs font-semibold mb-2">Slide</div>
              <div className="flex items-center gap-2"><span className="text-blue-600">{slide.icon}</span><div className="text-sm font-semibold">{slide.title}</div></div>
              <div className="text-xs text-neutral-600 mt-1">{slide.summary}</div>
            </div>
            <div className="border rounded p-3">
              <div className="text-xs font-semibold mb-2">Client Story</div>
              <div className="space-y-2 text-sm">
                <div>
                  <label className="block text-[11px] text-neutral-500">Choose client</label>
                  <select className="w-full text-sm border rounded px-2 py-1 bg-white dark:bg-neutral-950" value={clientId} onChange={e => setClientId(e.target.value)}>
                    {clients.map(c => (<option key={c.id} value={c.id}>{c.name}</option>))}
                  </select>
                </div>
                <div className="text-xs text-neutral-600">{client?.goals.join(", ")}</div>
                <div className="text-xs text-neutral-600">Risk: {client?.riskTolerance} • Portfolio: ${client?.portfolioSizeUSD?.toLocaleString?.() || '0'}</div>
              </div>
            </div>
            <div className="border rounded p-3">
              <div className="text-xs font-semibold mb-2">Speaker Notes</div>
              <ul className="text-sm list-disc pl-5 space-y-1">
                {talkingPoints[slide.key].map((t, i) => (<li key={i}>{t}</li>))}
              </ul>
            </div>
          </aside>

          <section className="space-y-4">
            {slide.key === "problem" && (
              <div className="border rounded p-6 grid gap-4 md:grid-cols-2">
                <div>
                  <h2 className="font-semibold mb-1">Advisor Workflow Today</h2>
                  <p className="text-sm text-neutral-600">Emails, meetings, chats—manual triage. High risk of missed signals and delayed follow-ups.</p>
                </div>
                <div className="bg-neutral-50 rounded p-3 text-sm">
                  <BookOpenText className="h-4 w-4 inline mr-2" /> Example: 200+ messages/week, across Outlook and Teams.
                </div>
              </div>
            )}

            {slide.key === "solution" && (
              <div className="border rounded p-6 space-y-3">
                <h2 className="font-semibold">AI-Powered Assistant</h2>
                <p className="text-sm text-neutral-600">Automatically summarizes communications, highlights key topics and sentiment, and proposes next actions.</p>
                <div className="grid gap-3 md:grid-cols-3">
                  <div className="rounded border p-3 text-sm">Summaries and highlights per client</div>
                  <div className="rounded border p-3 text-sm">Smart follow-ups and scheduling prompts</div>
                  <div className="rounded border p-3 text-sm">Works alongside Outlook-like UI</div>
                </div>
              </div>
            )}

            {slide.key === "capabilities" && (
              <div className="border rounded p-6 space-y-3">
                <h2 className="font-semibold">Capabilities</h2>
                <ul className="list-disc pl-5 text-sm space-y-1">
                  <li>Graph API integration (emails, events, chats) — simulated for demo</li>
                  <li>Context detection from selected email</li>
                  <li>Insights: topics, sentiment, last interaction</li>
                  <li>Next Best Actions with priorities and due dates</li>
                </ul>
              </div>
            )}

            {slide.key === "demo" && (
              <div className="border rounded p-6 space-y-4">
                <h2 className="font-semibold">Live Demo: Before vs After</h2>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded border p-3 text-sm">
                    <div className="text-xs font-semibold mb-1">Before</div>
                    <div className="text-neutral-600">Insights with first half of communications</div>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                      {beforeInsights?.recommendedActions?.map(a => (<li key={a.id}>{a.title}</li>)) || <li>No actions yet.</li>}
                    </ul>
                  </div>
                  <div className="rounded border p-3 text-sm">
                    <div className="text-xs font-semibold mb-1">After</div>
                    <div className="text-neutral-600">Insights with full history applied</div>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                      {afterInsights?.recommendedActions?.map(a => (<li key={a.id}>{a.title}</li>)) || <li>No actions.</li>}
                    </ul>
                  </div>
                </div>
                <div className="rounded border p-3 text-xs text-neutral-600">Topics: {afterInsights?.summary.topics.join(", ") || "—"} • Sentiment: {afterInsights?.summary.sentiment ?? "—"}</div>
              </div>
            )}

            {slide.key === "value" && (
              <div className="border rounded p-6 space-y-3">
                <h2 className="font-semibold">Business Value</h2>
                <div className="grid gap-3 md:grid-cols-3 text-sm">
                  <div className="rounded border p-3">Messages/week analyzed: <span className="font-semibold">{metrics.msgs}</span></div>
                  <div className="rounded border p-3">Estimated time saved: <span className="font-semibold">{metrics.timeSavedMin} min</span></div>
                  <div className="rounded border p-3">Insights generated: <span className="font-semibold">{metrics.insightsCount}</span></div>
                </div>
              </div>
            )}

            {slide.key === "roadmap" && (
              <div className="border rounded p-6 space-y-3">
                <h2 className="font-semibold">Roadmap</h2>
                <ul className="list-disc pl-5 text-sm space-y-1">
                  {talkingPoints.roadmap.map((t, i) => (<li key={i}>{t}</li>))}
                </ul>
              </div>
            )}
          </section>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="text-[11px] text-neutral-500">Use A/Left and D/Right to navigate. Press F to toggle full screen.</div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={() => setIdx(0)}>Start</Button>
            <Button variant="primary" size="sm" onClick={() => setIdx(i => Math.min(slides.length - 1, i + 1))}>Continue</Button>
          </div>
        </div>
      </div>

      <NotificationToast toast={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}


