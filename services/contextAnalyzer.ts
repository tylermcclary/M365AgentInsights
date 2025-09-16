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
  if (!emailAddress) {
    console.log('🔍 No email address provided for client identification');
    return undefined;
  }
  
  const lower = emailAddress.toLowerCase();
  console.log('🔍 Identifying client for email:', lower);
  
  // Strategy 1: Exact email match
  let client = clients.find(c => c.email.toLowerCase() === lower);
  
  // Strategy 2: Name match (fallback)
  if (!client) {
    client = clients.find(c => c.name.toLowerCase() === lower);
  }
  
  // Strategy 3: Partial email match
  if (!client) {
    const emailPart = lower.split('@')[0];
    client = clients.find(c => 
      c.email.toLowerCase().includes(emailPart) ||
      c.name.toLowerCase().includes(emailPart)
    );
  }
  
  if (client) {
    console.log('🔍 Found client:', client.name, client.email);
  } else {
    console.warn('🔍 No client found for email:', emailAddress);
  }
  
  return client;
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
  
  const meetings = comms.meetings.map(m => ({
    id: m.id,
    type: "meeting" as const,
    from: client.email,
    subject: m.subject,
    body: `${m.description}\n\nAgenda:\n${m.agenda || 'No agenda'}\n\nNotes:\n${m.notes || 'No notes'}`,
    timestamp: m.startTime,
    meetingType: m.meetingType,
    meetingStatus: m.status,
    meetingDuration: m.startTime && m.endTime ? 
      Math.round((new Date(m.endTime).getTime() - new Date(m.startTime).getTime()) / (1000 * 60)) : undefined,
    meetingLocation: m.location,
    meetingUrl: m.meetingUrl,
    meetingAgenda: m.agenda,
    meetingNotes: m.notes,
    attendees: m.attendees,
    endTime: m.endTime,
  }));
  
  return [...emails, ...events, ...chats, ...meetings];
}

export async function triggerAnalysisForEmail(senderEmail?: string) {
  if (!senderEmail) return;
  const client = identifyClientFromEmail(senderEmail);
  if (!client) return;
  const comms = loadCommunicationsForClient(client.email);
  const insights = await analyzeClientCommunications(client.email, comms);
  publishContext({ clientEmail: client.email, clientId: client.id, insights, communications: comms });
}

export async function triggerAnalysisForMeeting(meetingId?: string, clientEmail?: string) {
  if (!meetingId && !clientEmail) return;
  
  let client;
  if (clientEmail) {
    client = identifyClientFromEmail(clientEmail);
  } else {
    // If we have meetingId but no clientEmail, we'd need to look up the meeting
    // For now, we'll require clientEmail
    console.warn('Meeting analysis requires clientEmail when meetingId is provided');
    return;
  }
  
  if (!client) return;
  const comms = loadCommunicationsForClient(client.email);
  const insights = await analyzeClientCommunications(client.email, comms);
  publishContext({ clientEmail: client.email, clientId: client.id, insights, communications: comms });
}

export async function triggerAnalysisForClient(clientEmail: string) {
  const client = identifyClientFromEmail(clientEmail);
  if (!client) return;
  const comms = loadCommunicationsForClient(client.email);
  const insights = await analyzeClientCommunications(client.email, comms);
  publishContext({ clientEmail: client.email, clientId: client.id, insights, communications: comms });
}


