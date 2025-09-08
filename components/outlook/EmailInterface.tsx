"use client";

import { useMemo, useState, type ReactNode } from "react";
import {
  Inbox,
  Send,
  FileText,
  Trash2,
  Archive,
  Star,
  Search,
  Plus,
  Paperclip,
  X,
  Reply,
  ReplyAll,
  Forward,
  PanelRightOpen,
  PanelRightClose,
} from "lucide-react";
import AssistantPanel from "@/components/ai-agent/AssistantPanel";
import { clients, getCommunicationsByClient } from "@/data/sampleData";
import ContextTrigger from "@/components/ai-agent/ContextTrigger";
import { useEmailContext } from "@/hooks/useEmailContext";
import Button from "@/components/ui/Button";
import Tooltip from "@/components/ui/Tooltip";
import NotificationToast, { type Toast } from "@/components/ui/NotificationToast";

type Email = {
  id: string;
  sender: string;
  senderEmail?: string;
  subject: string;
  preview: string;
  timestamp: string; // ISO
  body: string;
  starred?: boolean;
  folder: "Inbox" | "Sent" | "Drafts" | "Archive" | "Trash";
  attachments?: { name: string; sizeKb: number }[];
};

const sampleEmails: Email[] = [
  {
    id: "1",
    sender: "Client A",
    senderEmail: "client.a@example.com",
    subject: "Action Required: Portfolio Rebalancing",
    preview: "Please review the proposed changes for Q3...",
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    body:
      "Hi Advisor,\n\nAttached are the proposed rebalancing changes for Q3. Let me know if you agree.\n\nBest,\nClient A",
    attachments: [{ name: "Q3-Rebalance.pdf", sizeKb: 524 }],
    folder: "Inbox",
    starred: true,
  },
  {
    id: "2",
    sender: "Research Desk",
    subject: "Market Update: Rates and Equities",
    preview: "Equities rallied today while rates stabilized...",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    body:
      "Today's market update indicates better-than-expected earnings across key sectors.\n\nHighlights:\n- Tech led gains\n- Energy underperformed\n\nRegards,\nResearch Desk",
    folder: "Inbox",
  },
  {
    id: "3",
    sender: "You",
    subject: "Client Onboarding Draft",
    preview: "Drafting welcome email and next steps...",
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    body: "[Draft] Welcome to our advisory practice...",
    folder: "Drafts",
  },
  {
    id: "4",
    sender: "You",
    subject: "Quarterly Review Sent",
    preview: "Sent quarterly review to Client B...",
    timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    body: "Sent quarterly review and scheduling link.",
    folder: "Sent",
  },
  {
    id: "5",
    sender: "Operations",
    subject: "Archival Notice",
    preview: "Records moved to archive per policy...",
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    body: "Some records have been archived.",
    folder: "Archive",
  },
];

const folders: { key: Email["folder"]; label: string; icon: ReactNode }[] = [
  { key: "Inbox", label: "Inbox", icon: <Inbox className="h-4 w-4" /> },
  { key: "Sent", label: "Sent", icon: <Send className="h-4 w-4" /> },
  { key: "Drafts", label: "Drafts", icon: <FileText className="h-4 w-4" /> },
  { key: "Archive", label: "Archive", icon: <Archive className="h-4 w-4" /> },
  { key: "Trash", label: "Trash", icon: <Trash2 className="h-4 w-4" /> },
];

function formatTime(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const sameDay = d.toDateString() === today.toDateString();
  return sameDay ? d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : d.toLocaleDateString();
}

export default function EmailInterface() {
  const [activeFolder, setActiveFolder] = useState<Email["folder"]>("Inbox");
  const [query, setQuery] = useState("");
  const [emails, setEmails] = useState<Email[]>(sampleEmails);
  const [selectedId, setSelectedId] = useState<string | null>(emails.find(e => e.folder === "Inbox")?.id ?? null);
  const [isComposeOpen, setComposeOpen] = useState(false);
  const [compose, setCompose] = useState({ to: "", subject: "", body: "" });
  const [assistantOpen, setAssistantOpen] = useState(true);
  const [selectedClientId, setSelectedClientId] = useState<string>(clients[0]?.id ?? "");
  const [toast, setToast] = useState<Toast | null>(null);

  // Load emails from sample data for the selected client (Inbox only for POC)
  function loadClientEmails(clientId: string) {
    const comms = getCommunicationsByClient(clientId);
    const mapped: Email[] = comms.emails.map(e => ({
      id: e.id,
      sender: clients.find(c => c.id === clientId)?.name ?? "Client",
      senderEmail: clients.find(c => c.id === clientId)?.email,
      subject: e.subject,
      preview: e.body.slice(0, 120),
      timestamp: e.receivedDateTime,
      body: e.body,
      folder: "Inbox",
    }));
    // Keep some existing Sent/Drafts examples from local sample for variety
    const extras = sampleEmails.filter(x => x.folder !== "Inbox");
    const all = [...mapped, ...extras].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    setEmails(all);
    setSelectedId(all.find(e => e.folder === "Inbox")?.id ?? all[0]?.id ?? null);
  }

  // Initialize from first client
  useMemo(() => {
    if (selectedClientId) {
      loadClientEmails(selectedClientId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClientId]);

  const filtered = useMemo(() => {
    const byFolder = emails.filter(e => e.folder === activeFolder);
    if (!query.trim()) return byFolder;
    const q = query.toLowerCase();
    return byFolder.filter(
      e =>
        e.sender.toLowerCase().includes(q) ||
        e.subject.toLowerCase().includes(q) ||
        e.preview.toLowerCase().includes(q) ||
        e.body.toLowerCase().includes(q)
    );
  }, [emails, activeFolder, query]);

  const selected = filtered.find(e => e.id === selectedId) ?? filtered[0] ?? null;
  const context = useEmailContext(selected ? {
    id: selected.id,
    sender: selected.sender,
    senderEmail: selected.senderEmail,
    subject: selected.subject,
    body: selected.body,
    timestamp: selected.timestamp,
  } : null);

  function openCompose() {
    setCompose({ to: "", subject: "", body: "" });
    setComposeOpen(true);
  }

  function sendCompose() {
    // In a real app, send via Graph. For POC, add to Sent.
    const now = new Date().toISOString();
    const sent: Email = {
      id: Math.random().toString(36).slice(2),
      sender: "You",
      subject: compose.subject || "(No subject)",
      preview: compose.body.slice(0, 120),
      timestamp: now,
      body: compose.body,
      folder: "Sent",
    };
    setEmails(prev => [sent, ...prev]);
    setActiveFolder("Sent");
    setSelectedId(sent.id);
    setComposeOpen(false);
    setToast({ id: "sent", type: "success", message: "Message added to Sent", durationMs: 2500 });
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] min-h-[560px] w-full border rounded-lg overflow-hidden bg-white dark:bg-neutral-950">
      {/* Sidebar */}
      <aside className="hidden md:flex md:w-56 shrink-0 flex-col border-r bg-neutral-50 dark:bg-neutral-900">
        <div className="flex items-center justify-between p-3 border-b">
          <div className="text-sm font-semibold">Mail</div>
          <Button size="sm" onClick={openCompose} leftIcon={<Plus className="h-4 w-4" />}>New</Button>
        </div>
        <div className="p-2 border-b">
          <label className="block text-[11px] text-neutral-500 mb-1">Client</label>
          <select
            value={selectedClientId}
            onChange={e => setSelectedClientId(e.target.value)}
            className="w-full text-sm border rounded px-2 py-1 bg-white dark:bg-neutral-950"
          >
            {clients.map(c => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <nav className="flex-1 overflow-y-auto p-2">
          {folders.map(f => (
            <button
              key={f.key}
              onClick={() => {
                setActiveFolder(f.key);
                const first = emails.find(e => e.folder === f.key);
                setSelectedId(first?.id ?? null);
              }}
              className={`w-full flex items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800 ${
                activeFolder === f.key ? "bg-blue-50 text-blue-700 dark:bg-neutral-800" : ""
              }`}
            >
              {f.icon}
              <span>{f.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Email list + reading pane */}
      <section className="flex-1 grid grid-rows-[auto,1fr] md:grid-cols-[360px_1fr]">
        {/* Top bar (mobile) */}
        <div className="md:hidden flex items-center gap-2 p-2 border-b">
          <button
            onClick={openCompose}
            className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-blue-600 text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" /> New
          </button>
          <div className="flex-1 relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-neutral-400" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search"
              className="w-full pl-8 pr-3 py-2 rounded-md border text-sm bg-white dark:bg-neutral-950"
            />
          </div>
        </div>

        {/* List */}
        <div className="hidden md:flex md:flex-col border-r">
          <div className="p-2 border-b">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-neutral-400" />
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search mail"
                className="w-full pl-8 pr-3 py-2 rounded-md border text-sm bg-white dark:bg-neutral-950"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filtered.length === 0 && (
              <div className="p-6 text-sm text-neutral-500">No emails found.</div>
            )}
            {filtered.map(e => (
              <button
                key={e.id}
                onClick={() => setSelectedId(e.id)}
                className={`w-full text-left px-3 py-3 border-b hover:bg-neutral-50 dark:hover:bg-neutral-900 ${
                  selectedId === e.id ? "bg-blue-50/60 dark:bg-neutral-900" : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {e.starred ? <Star className="h-4 w-4 text-amber-500" /> : <span className="w-4" />}
                    <div className="text-sm font-semibold line-clamp-1">{e.sender}</div>
                  </div>
                  <div className="text-xs text-neutral-500">{formatTime(e.timestamp)}</div>
                </div>
                <div className="text-sm line-clamp-1">{e.subject}</div>
                <div className="text-xs text-neutral-500 line-clamp-1">{e.preview}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Reading pane */}
        <div className="hidden md:flex md:flex-col relative">
          {!selected ? (
            <div className="flex-1 grid place-items-center text-sm text-neutral-500">Select a message</div>
          ) : (
            <div className="flex-1 flex flex-col">
              <div className="flex items-center justify-between px-4 py-3 border-b">
                <div>
                  <div className="text-sm text-neutral-500">{selected.sender}</div>
                  <h2 className="text-lg font-semibold">{selected.subject}</h2>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="secondary" size="sm" leftIcon={<Reply className="h-4 w-4" />}>Reply</Button>
                  <Button variant="secondary" size="sm" leftIcon={<ReplyAll className="h-4 w-4" />}>Reply all</Button>
                  <Button variant="secondary" size="sm" leftIcon={<Forward className="h-4 w-4" />}>Forward</Button>
                  <Tooltip content="Show or hide the AI Assistant">
                    <span>
                      <Button variant="secondary" size="sm" onClick={() => setAssistantOpen(o => !o)} leftIcon={assistantOpen ? <PanelRightClose className="h-4 w-4" /> : <PanelRightOpen className="h-4 w-4" />}>AI Assistant</Button>
                    </span>
                  </Tooltip>
                </div>
              </div>
              <div className="px-4 py-3 text-sm whitespace-pre-wrap">
                {selected.body}
              </div>
              {selected.attachments && selected.attachments.length > 0 && (
                <div className="px-4 pb-4">
                  <div className="text-xs font-semibold mb-2">Attachments</div>
                  <div className="flex flex-wrap gap-2">
                    {selected.attachments.map(att => (
                      <div key={att.name} className="flex items-center gap-2 px-2 py-1 border rounded text-xs">
                        <Paperclip className="h-4 w-4" /> {att.name}
                        <span className="text-neutral-500">({att.sizeKb} KB)</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Assistant Panel (right overlay) */}
        <div
          className={`hidden md:block absolute right-0 top-0 h-full w-[360px] border-l bg-white dark:bg-neutral-950 shadow-xl transition-transform duration-200 ease-out ${
            assistantOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <ContextTrigger senderEmail={selected?.senderEmail ?? selected?.sender} communications={filtered.map(e => ({
            id: e.id,
            type: "email",
            from: e.senderEmail ?? e.sender,
            subject: e.subject,
            body: e.body,
            timestamp: e.timestamp,
          }))} />
          <AssistantPanel
            email={{
              id: selected?.id,
              sender: selected?.sender,
              senderEmail: selected?.senderEmail,
              subject: selected?.subject,
              body: selected?.body,
              receivedAt: selected?.timestamp,
            }}
            defaultOpen={true}
            onCollapse={() => setAssistantOpen(false)}
            communications={filtered.map(e => ({
              id: e.id,
              type: "email",
              from: e.senderEmail ?? e.sender,
              subject: e.subject,
              body: e.body,
              timestamp: e.timestamp,
            }))}
            clientEmail={selected?.senderEmail ?? selected?.sender}
          />
        </div>

        {/* Mobile reading pane */}
        <div className="md:hidden">
          {/* On mobile, show list; tap opens a simple inline reading pane */}
          <div className="divide-y">
            {filtered.map(e => (
              <details key={e.id} className="group">
                <summary className="px-3 py-3 hover:bg-neutral-50 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold line-clamp-1">{e.sender}</div>
                    <div className="text-xs text-neutral-500">{formatTime(e.timestamp)}</div>
                  </div>
                  <div className="text-sm line-clamp-1">{e.subject}</div>
                  <div className="text-xs text-neutral-500 line-clamp-1">{e.preview}</div>
                </summary>
                <div className="px-3 py-3 text-sm whitespace-pre-wrap">{e.body}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Compose Modal */}
      {isComposeOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4">
          <div className="w-full max-w-2xl rounded-lg border bg-white dark:bg-neutral-950 shadow-xl">
            <div className="flex items-center justify-between px-4 py-2 border-b">
              <div className="text-sm font-semibold">New message</div>
              <button className="p-1 rounded hover:bg-neutral-100" onClick={() => setComposeOpen(false)}>
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex items-center gap-2">
                <label className="w-16 text-xs text-neutral-500">To</label>
                <input
                  value={compose.to}
                  onChange={e => setCompose({ ...compose, to: e.target.value })}
                  placeholder="recipient@example.com"
                  className="flex-1 border rounded px-2 py-1 text-sm"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="w-16 text-xs text-neutral-500">Subject</label>
                <input
                  value={compose.subject}
                  onChange={e => setCompose({ ...compose, subject: e.target.value })}
                  placeholder="Subject"
                  className="flex-1 border rounded px-2 py-1 text-sm"
                />
              </div>
              <div>
                <textarea
                  value={compose.body}
                  onChange={e => setCompose({ ...compose, body: e.target.value })}
                  placeholder="Write your message..."
                  className="w-full min-h-[200px] border rounded px-2 py-2 text-sm"
                />
              </div>
            </div>
            <div className="flex items-center justify-between px-4 py-3 border-t bg-neutral-50">
              <div className="text-xs text-neutral-500">POC mode – message will be added to Sent</div>
              <div className="flex items-center gap-2">
                <button onClick={() => setComposeOpen(false)} className="px-3 py-1.5 text-sm rounded border">
                  Cancel
                </button>
                <button onClick={sendCompose} className="px-3 py-1.5 text-sm rounded bg-blue-600 text-white hover:bg-blue-700">
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


