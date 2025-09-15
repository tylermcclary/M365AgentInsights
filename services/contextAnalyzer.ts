"use client";

import type { Communication, ClientInsights } from "@/services/ai-insights";
import { analyzeClientCommunications } from "@/services/ai-insights";
import { clients, getCommunicationsByClient } from "@/data/sampleData";

export type ContextEvent = {
  clientEmail: string;
  clientId?: string;
  insights: ClientInsights;
  communications: Communication[];
};

type Listener = (e: ContextEvent) => void;
const listeners = new Set<Listener>();

export function subscribeContext(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function publishContext(e: ContextEvent) {
  for (const l of listeners) l(e);
}

export function identifyClientFromEmail(emailAddress?: string) {
  if (!emailAddress) return undefined;
  const lower = emailAddress.toLowerCase();
  return clients.find(c => c.email.toLowerCase() === lower);
}

export function loadCommunicationsForClient(clientEmail: string): Communication[] {
  const client = identifyClientFromEmail(clientEmail);
  if (!client) return [];
  const comms = getCommunicationsByClient(client.id);
  const emails = comms.emails.map(m => ({
    id: m.id,
    type: "email" as const,
    from: client.email,
    subject: m.subject,
    body: m.body,
    timestamp: m.receivedDateTime,
  }));
  const events = comms.events.map(e => ({
    id: e.id,
    type: "event" as const,
    from: client.email,
    subject: e.subject,
    body: e.notes ?? "",
    timestamp: e.start,
  }));
  const chats = comms.chats.map(c => ({
    id: c.id,
    type: "chat" as const,
    from: client.email,
    subject: c.content.slice(0, 60),
    body: c.content,
    timestamp: c.createdDateTime,
  }));
  return [...emails, ...events, ...chats];
}

export async function triggerAnalysisForEmail(senderEmail?: string) {
  if (!senderEmail) return;
  const client = identifyClientFromEmail(senderEmail);
  if (!client) return;
  const comms = loadCommunicationsForClient(client.email);
  const insights = await analyzeClientCommunications(client.email, comms);
  publishContext({ clientEmail: client.email, clientId: client.id, insights, communications: comms });
}


