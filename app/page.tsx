"use client";

import { useState } from "react";
import { useMsal, useIsAuthenticated } from "@azure/msal-react";
import { getMe, getMailTop, getUpcomingEvents } from "@/services/graph";
import type { GraphMailItem, GraphCalendarEvent, GraphUser } from "@/types";
import { MailList } from "@/components/outlook/MailList";
import { CalendarList } from "@/components/outlook/CalendarList";
import { InsightsPanel } from "@/components/ai-agent/InsightsPanel";
import { generateInsightsFromGraph } from "@/services/ai-insights";

export default function Home() {
  const isAuthenticated = useIsAuthenticated();
  const { instance } = useMsal();
  const [me, setMe] = useState<GraphUser | null>(null);
  const [mail, setMail] = useState<GraphMailItem[]>([]);
  const [events, setEvents] = useState<GraphCalendarEvent[]>([]);

  async function handleSignIn() {
    await instance.loginPopup();
    const meResp = await getMe();
    const mailResp = await getMailTop(8);
    const eventResp = await getUpcomingEvents(8);
    setMe(meResp);
    setMail(mailResp.value ?? mailResp);
    setEvents(eventResp.value ?? eventResp);
  }

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="space-y-4 text-center">
          <h1 className="text-2xl font-semibold">Financial Advisor AI Agent</h1>
          <p className="text-gray-600">Sign in with Microsoft to continue</p>
          <button onClick={handleSignIn} className="px-4 py-2 rounded-md bg-black text-white">
            Sign in with Microsoft
          </button>
        </div>
      </main>
    );
  }

  const insights = generateInsightsFromGraph(mail, events);

  return (
    <main className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Welcome{me?.displayName ? `, ${me.displayName}` : ""}</h1>
          <p className="text-sm text-gray-600">Your Outlook overview and AI insights</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <section className="md:col-span-2 space-y-4">
          <h2 className="text-sm font-medium text-gray-700">Recent Mail</h2>
          <MailList items={mail} />
          <h2 className="text-sm font-medium text-gray-700">Upcoming Events</h2>
          <CalendarList items={events} />
        </section>
        <aside className="space-y-4">
          <h2 className="text-sm font-medium text-gray-700">AI Insights</h2>
          <InsightsPanel insights={insights} />
        </aside>
      </div>
    </main>
  );
}
