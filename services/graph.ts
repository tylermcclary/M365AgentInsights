"use client";

import "isomorphic-fetch";
import { PublicClientApplication, type AccountInfo } from "@azure/msal-browser";
import { Client } from "@microsoft/microsoft-graph-client";
import { msalInstance, graphScopes } from "@/lib/msal";
import type { GraphCalendarEvent, GraphMailItem, GraphUser } from "@/types";
import type { GraphChatMessage, GraphListResponse } from "@/types/graph";
import { getAccessToken } from "@/services/auth";

const BYPASS = (process.env.NEXT_PUBLIC_BYPASS_AUTH ?? "").toLowerCase() === "true";

// --- Retry helper for transient Graph errors ---
async function withRetry<T>(fn: () => Promise<T>, retries = 3, baseDelayMs = 500): Promise<T> {
  let attempt = 0;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      return await fn();
    } catch (error: any) {
      const status = error?.statusCode ?? error?.status ?? error?.response?.status;
      const isRetryable = status === 429 || status === 503 || status === 504;
      if (attempt >= retries || !isRetryable) throw error;
      const delay = baseDelayMs * Math.pow(2, attempt);
      await new Promise(res => setTimeout(res, delay));
      attempt += 1;
    }
  }
}

export function getActiveAccount(): AccountInfo | null {
  const account = msalInstance.getActiveAccount();
  if (account) return account;
  const all = msalInstance.getAllAccounts();
  if (all.length > 0) {
    msalInstance.setActiveAccount(all[0]);
    return all[0];
  }
  return null;
}

async function acquireToken(instance: PublicClientApplication): Promise<string> {
  const account = getActiveAccount();
  if (!account) {
    const login = await instance.loginPopup({ scopes: graphScopes });
    instance.setActiveAccount(login.account ?? null);
  }
  const acct = getActiveAccount();
  if (!acct) throw new Error("No active account after login");
  const tokenResp = await instance.acquireTokenSilent({ scopes: graphScopes, account: acct });
  return tokenResp.accessToken;
}

export async function createGraphClient() {
  if (BYPASS) {
    throw new Error("Graph client not available in bypass mode");
  }
  const accessToken = await getAccessToken();
  return Client.init({
    authProvider: done => {
      done(null, accessToken);
    },
  });
}

export async function getMe() {
  if (BYPASS) {
    const me: GraphUser = {
      id: "mock-user-1",
      displayName: "Financial Advisor (POC Mode)",
      mail: "advisor@example.com",
      userPrincipalName: "advisor@example.com",
    };
    return me;
  }
  const client = await createGraphClient();
  return client.api("/me").get();
}

export async function getMailTop(limit = 10) {
  if (BYPASS) {
    const now = new Date();
    const items: GraphMailItem[] = Array.from({ length: limit }).map((_, i) => ({
      id: `mock-mail-${i}`,
      subject: i % 2 === 0 ? `Action Required: Client Portfolio Review #${i}` : `FYI: Market Update ${i}`,
      from: { emailAddress: { name: i % 2 === 0 ? "Client Services" : "Research Desk", address: "noreply@example.com" } },
      receivedDateTime: new Date(now.getTime() - i * 3600_000).toISOString(),
    }));
    return { value: items };
  }
  const client = await createGraphClient();
  return withRetry(() => client.api("/me/messages").select(["id", "subject", "from", "receivedDateTime"]).top(limit).get());
}

export async function getUpcomingEvents(limit = 10) {
  if (BYPASS) {
    const now = new Date();
    const items: GraphCalendarEvent[] = Array.from({ length: limit }).map((_, i) => ({
      id: `mock-event-${i}`,
      subject: i % 2 === 0 ? `Client Meeting #${i}` : `Internal Briefing ${i}`,
      start: { dateTime: new Date(now.getTime() + (i + 1) * 3600_000).toISOString(), timeZone: "UTC" },
      end: { dateTime: new Date(now.getTime() + (i + 1.5) * 3600_000).toISOString(), timeZone: "UTC" },
      organizer: { emailAddress: { name: i % 2 === 0 ? "Client A" : "PM Team", address: "organizer@example.com" } },
    }));
    return { value: items };
  }
  const client = await createGraphClient();
  return withRetry(() => client.api("/me/events").select(["id", "subject", "start", "end", "organizer"]).top(limit).get());
}

// =====================
// New Service Interface
// =====================

export async function getUserEmails(contactEmail?: string): Promise<GraphListResponse<GraphMailItem>> {
  if (BYPASS) {
    const resp = await getMailTop(25);
    const filtered = contactEmail
      ? (resp.value as GraphMailItem[]).filter(m => (m.from?.emailAddress?.address ?? "").toLowerCase() === contactEmail.toLowerCase())
      : (resp.value as GraphMailItem[]);
    return { value: filtered };
  }
  const client = await createGraphClient();
  const api = client.api("/me/messages").select(["id", "subject", "from", "receivedDateTime"]).top(25);
  if (contactEmail) {
    // Use $search for broader matching; requires header ConsistencyLevel: eventual
    return withRetry(async () =>
      api
        .header("ConsistencyLevel", "eventual")
        .query({ $search: `"from:${contactEmail}"` })
        .get()
    );
  }
  return withRetry(() => api.get());
}

export async function getCalendarEvents(contactEmail?: string): Promise<GraphListResponse<GraphCalendarEvent>> {
  if (BYPASS) {
    const resp = await getUpcomingEvents(25);
    const filtered = contactEmail
      ? (resp.value as GraphCalendarEvent[]).filter(e =>
          (e.organizer?.emailAddress?.address ?? "").toLowerCase() === contactEmail.toLowerCase() ||
          (e.attendees ?? []).some((a: any) => (a.emailAddress?.address ?? "").toLowerCase() === contactEmail.toLowerCase())
        )
      : (resp.value as GraphCalendarEvent[]);
    return { value: filtered };
  }
  const client = await createGraphClient();
  let api = client.api("/me/events").select(["id", "subject", "start", "end", "organizer"]).top(25);
  if (contactEmail) {
    // Filter attendees/organizer by address
    api = api.filter(
      `organizer/emailAddress/address eq '${contactEmail}' or attendees/any(a:a/emailAddress/address eq '${contactEmail}')`
    );
  }
  return withRetry(() => api.get());
}

export async function getTeamsMessages(contactEmail?: string): Promise<GraphListResponse<GraphChatMessage>> {
  if (BYPASS) {
    const now = new Date();
    const msgs: GraphChatMessage[] = Array.from({ length: 15 }).map((_, i) => ({
      id: `mock-chat-${i}`,
      summary: i % 2 === 0 ? `Ping about quarterly report #${i}` : `Scheduling follow-up ${i}`,
      from: { user: { displayName: contactEmail ?? (i % 2 === 0 ? "Client A" : "PM Team") } },
      createdDateTime: new Date(now.getTime() - i * 1800_000).toISOString(),
      body: { content: `Mock Teams message ${i}`, contentType: "text" },
    }));
    const filtered = contactEmail
      ? msgs.filter(m => (m.from?.user?.displayName ?? "").toLowerCase().includes(contactEmail.toLowerCase()))
      : msgs;
    return { value: filtered };
  }
  const client = await createGraphClient();
  // Using getAllMessages requires special permissions; we attempt userChats messages
  let api = client.api("/me/chats/getAllMessages").version("beta").top(25); // beta endpoint for demonstration
  if (contactEmail) {
    api = api.header("ConsistencyLevel", "eventual").query({ $search: `"from:${contactEmail}"` });
  }
  return withRetry(() => api.get());
}

export async function searchCommunications(
  contactEmail: string,
  dateRange?: { start: Date; end: Date }
): Promise<{
  emails: GraphListResponse<GraphMailItem>;
  events: GraphListResponse<GraphCalendarEvent>;
  teams: GraphListResponse<GraphChatMessage>;
}> {
  const [emails, events, teams] = await Promise.all([
    getUserEmails(contactEmail),
    getCalendarEvents(contactEmail),
    getTeamsMessages(contactEmail),
  ]);

  if (!dateRange) return { emails, events, teams };
  const { start, end } = dateRange;
  const inRange = (dt: string) => {
    const t = new Date(dt).getTime();
    return t >= start.getTime() && t <= end.getTime();
  };
  return {
    emails: { value: emails.value.filter(e => inRange(e.receivedDateTime)) },
    events: { value: events.value.filter(e => inRange(e.start.dateTime)) },
    teams: { value: teams.value.filter(m => inRange(m.createdDateTime)) },
  };
}

export async function getUserProfile(): Promise<GraphUser> {
  const me = await getMe();
  return me as GraphUser;
}


