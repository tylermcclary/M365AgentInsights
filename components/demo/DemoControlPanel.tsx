"use client";

import { useMemo, useState } from "react";
import { clients, getCommunicationsByClient, type SampleClient } from "@/data/sampleData";
import { analyzeClientCommunications, type ClientInsights, type Communication, suggestNextBestActions } from "@/services/ai-insights";
import { triggerAnalysisForEmail } from "@/services/contextAnalyzer";
import { Loader2, Play, BrainCircuit, ListChecks, Timer, Database } from "lucide-react";
import Button from "@/components/ui/Button";
import Tooltip from "@/components/ui/Tooltip";
import NotificationToast, { type Toast } from "@/components/ui/NotificationToast";

type Scenario = "Consultation" | "Investment Discussion" | "Market Update" | "Life Event" | "Follow-up";

export default function DemoControlPanel() {
  const [selectedClientId, setSelectedClientId] = useState<string>(clients[0]?.id ?? "");
  const [scenario, setScenario] = useState<Scenario>("Consultation");
  const [processing, setProcessing] = useState(false);
  const [status, setStatus] = useState<string[]>([]);
  const [insights, setInsights] = useState<ClientInsights | null>(null);
  const [timeline, setTimeline] = useState<Communication[]>([]);
  const [actions, setActions] = useState<ReturnType<typeof suggestNextBestActions>>([]);
  const [toast, setToast] = useState<Toast | null>(null);

  const selectedClient: SampleClient | undefined = useMemo(
    () => clients.find(c => c.id === selectedClientId),
    [selectedClientId]
  );

  function log(msg: string) {
    setStatus(prev => [msg, ...prev].slice(0, 8));
  }

  function loadComms(): Communication[] {
    if (!selectedClient) return [];
    const comms = getCommunicationsByClient(selectedClient.id);
    const emails: Communication[] = comms.emails.map(e => ({ id: e.id, type: "email", from: selectedClient.email, subject: e.subject, body: e.body, timestamp: e.receivedDateTime }));
    const events: Communication[] = comms.events.map(e => ({ id: e.id, type: "event", from: selectedClient.email, subject: e.subject, body: e.notes ?? "", timestamp: e.start }));
    const chats: Communication[] = comms.chats.map(c => ({ id: c.id, type: "chat", from: selectedClient.email, subject: c.content.slice(0, 60), body: c.content, timestamp: c.createdDateTime }));
    return [...emails, ...events, ...chats].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  async function simulateIncomingEmail() {
    if (!selectedClient) return;
    setProcessing(true);
    log("Simulating incoming email and triggering AI analysis...");
    // Choose a recent email as the simulated incoming
    const comms = loadComms();
    const recentEmail = comms.find(c => c.type === "email");
    if (recentEmail) {
      triggerAnalysisForEmail(selectedClient.email);
      setTimeline(comms);
      log("Graph API (simulated): fetched communications");
      // small delay for UX
      await new Promise(r => setTimeout(r, 300));
      const ai = analyzeClientCommunications(selectedClient.email, comms);
      setInsights(ai);
      log("AI: insights generated for simulated email context");
      setToast({ id: "sim", type: "success", message: "Simulated email processed" });
    }
    setProcessing(false);
  }

  async function viewClientInsights() {
    if (!selectedClient) return;
    setProcessing(true);
    log("Loading historical communications (simulated Graph API)...");
    const comms = loadComms();
    setTimeline(comms);
    await new Promise(r => setTimeout(r, 200));
    const ai = analyzeClientCommunications(selectedClient.email, comms);
    setInsights(ai);
    log("AI: comprehensive client analysis ready");
    setToast({ id: "insights", type: "success", message: "Client insights ready" });
    setProcessing(false);
  }

  async function generateNextActions() {
    if (!selectedClient) return;
    setProcessing(true);
    log("AI: generating next best actions...");
    const comms = loadComms();
    const nba = suggestNextBestActions({ communications: comms });
    setActions(nba);
    await new Promise(r => setTimeout(r, 150));
    log("AI: proposed next actions available");
    setProcessing(false);
    setToast({ id: "nba", type: "success", message: "Next actions generated" });
  }

  function showTimeline() {
    if (!selectedClient) return;
    const comms = loadComms();
    setTimeline(comms);
    log("Timeline: showing recent interactions");
  }

  return (
    <div className="border rounded-lg p-4 bg-white dark:bg-neutral-950">
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-semibold">Demo Control Panel</div>
        <div className="inline-flex items-center gap-2 text-xs">
          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded ${processing ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"}`}>
            {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <BrainCircuit className="h-4 w-4" />} {processing ? "Processing" : "Idle"}
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-blue-100 text-blue-800">
            <Database className="h-4 w-4" /> Graph (simulated)
          </span>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <div className="space-y-2">
          <label className="block text-[11px] text-neutral-500">Client</label>
          <select value={selectedClientId} onChange={e => setSelectedClientId(e.target.value)} className="w-full text-sm border rounded px-2 py-1 bg-white dark:bg-neutral-950">
            {clients.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="block text-[11px] text-neutral-500">Scenario</label>
          <select value={scenario} onChange={e => setScenario(e.target.value as Scenario)} className="w-full text-sm border rounded px-2 py-1 bg-white dark:bg-neutral-950">
            {(["Consultation","Investment Discussion","Market Update","Life Event","Follow-up"] as Scenario[]).map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="block text-[11px] text-neutral-500">Actions</label>
          <div className="flex flex-wrap gap-2">
            <Tooltip content="Adds a sample email and runs insights">
              <span><Button variant="secondary" size="sm" onClick={simulateIncomingEmail} disabled={processing} leftIcon={<Play className="h-4 w-4" />}>Simulate incoming email</Button></span>
            </Tooltip>
            <Tooltip content="Loads historical data and runs full analysis">
              <span><Button variant="secondary" size="sm" onClick={viewClientInsights} disabled={processing} leftIcon={<BrainCircuit className="h-4 w-4" />}>View client insights</Button></span>
            </Tooltip>
            <Tooltip content="Shows predicted recommendations">
              <span><Button variant="secondary" size="sm" onClick={generateNextActions} disabled={processing} leftIcon={<ListChecks className="h-4 w-4" />}>Generate next actions</Button></span>
            </Tooltip>
            <Tooltip content="Displays interaction history">
              <span><Button variant="secondary" size="sm" onClick={showTimeline} leftIcon={<Timer className="h-4 w-4" />}>Show timeline</Button></span>
            </Tooltip>
          </div>
        </div>
      </div>

      <div className="grid gap-4 mt-4 md:grid-cols-2">
        <div className="space-y-2">
          <div className="text-xs font-semibold">AI Insights</div>
          <div className="border rounded p-3 text-sm min-h-[120px]">
            {insights ? (
              <div className="space-y-2">
                <div><span className="font-semibold">Summary:</span> {insights.summary.text}</div>
                <div className="text-xs text-neutral-500">Topics: {insights.summary.topics.join(", ") || "—"} • Sentiment: {insights.summary.sentiment}</div>
                <div className="text-xs text-neutral-500">Last: {insights.lastInteraction ? `${new Date(insights.lastInteraction.when).toLocaleDateString()} • ${insights.lastInteraction.type}` : "—"}</div>
              </div>
            ) : (
              <div className="text-neutral-500">No insights yet. Run an action above.</div>
            )}
          </div>
          <div className="text-xs font-semibold">Next Best Actions</div>
          <div className="border rounded p-3 text-sm min-h-[100px]">
            {actions.length ? (
              <ul className="list-disc pl-5 space-y-1">
                {actions.map(a => (
                  <li key={a.id}><span className="font-medium">{a.title}</span> — <span className="text-neutral-600">{a.rationale}</span>{a.dueDate ? <span className="text-neutral-400"> (Due {a.dueDate})</span> : null}</li>
                ))}
              </ul>
            ) : (
              <div className="text-neutral-500">No actions yet.</div>
            )}
          </div>
        </div>
        <div className="space-y-2">
          <div className="text-xs font-semibold">Communication Timeline</div>
          <div className="border rounded p-3 text-sm min-h-[220px] max-h-[320px] overflow-auto">
            {timeline.length ? (
              <ul className="space-y-2">
                {timeline.map(t => (
                  <li key={t.id} className="flex items-start gap-2">
                    <span className="text-[11px] text-neutral-500 w-36 shrink-0">{new Date(t.timestamp).toLocaleDateString()}</span>
                    <span className="text-[11px] font-medium w-20 shrink-0">{t.type}</span>
                    <span className="line-clamp-1">{t.subject ?? "(no subject)"}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-neutral-500">No timeline loaded.</div>
            )}
          </div>
          <div className="text-xs font-semibold">Status</div>
          <div className="border rounded p-3 text-xs min-h-[80px] max-h-[160px] overflow-auto bg-neutral-50">
            <ul className="space-y-1">
              {status.map((s, idx) => (
                <li key={idx}>• {s}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-3 text-[11px] text-neutral-500">
        Before/After: Run "Simulate incoming email" first, note insights; then run "Generate next actions" to see how recommendations update based on the same context.
      </div>

      <NotificationToast toast={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}


