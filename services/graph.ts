"use client";

import "isomorphic-fetch";
import { PublicClientApplication, type AccountInfo } from "@azure/msal-browser";
import { Client } from "@microsoft/microsoft-graph-client";
import { msalInstance, graphScopes } from "@/lib/msal";
import type { GraphCalendarEvent, GraphMailItem, GraphUser } from "@/types";

const BYPASS = (process.env.NEXT_PUBLIC_BYPASS_AUTH ?? "").toLowerCase() === "true";

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
  const accessToken = await acquireToken(msalInstance);
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
  return client.api("/me/messages").select(["id", "subject", "from", "receivedDateTime"]).top(limit).get();
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
  return client.api("/me/events").select(["id", "subject", "start", "end", "organizer"]).top(limit).get();
}


