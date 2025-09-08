// Sample data for POC demos: financial advisory clients, emails, events, and Teams messages

import { addDays, addMonths, formatISO } from "date-fns";

export type SampleClient = {
  id: string;
  name: string;
  email: string;
  age: number;
  profession: string;
  familyStatus: string;
  riskTolerance: "Conservative" | "Moderate" | "Aggressive";
  portfolioSizeUSD: number;
  goals: string[];
  preferences: string[];
};

export type SampleEmail = {
  id: string;
  clientId: string;
  from: { name: string; address: string };
  to: { name: string; address: string }[];
  subject: string;
  body: string;
  receivedDateTime: string; // ISO
};

export type SampleEvent = {
  id: string;
  clientId: string;
  subject: string;
  start: string; // ISO
  end: string; // ISO
  organizer: { name: string; address: string };
  attendees: { name: string; address: string }[];
  notes?: string;
};

export type SampleTeamsMessage = {
  id: string;
  clientId: string;
  from: string; // display name
  createdDateTime: string; // ISO
  content: string;
};

const advisor = { name: "You", address: "advisor@example.com" };

const baseClients: Omit<SampleClient, "id">[] = [
  {
    name: "Alex Johnson",
    email: "alex.johnson@example.com",
    age: 54,
    profession: "Engineer",
    familyStatus: "Married, 2 children (college)",
    riskTolerance: "Moderate",
    portfolioSizeUSD: 1250000,
    goals: ["Retirement income by 65", "College funding"],
    preferences: ["Low-fee ETFs", "ESG tilt"],
  },
  {
    name: "Priya Desai",
    email: "priya.desai@example.com",
    age: 42,
    profession: "Product Manager",
    familyStatus: "Married, 1 child",
    riskTolerance: "Aggressive",
    portfolioSizeUSD: 820000,
    goals: ["Early retirement at 55", "Vacation home"],
    preferences: ["Tech growth", "Options covered calls"],
  },
  {
    name: "Michael Chen",
    email: "michael.chen@example.com",
    age: 37,
    profession: "Physician",
    familyStatus: "Married, expecting",
    riskTolerance: "Moderate",
    portfolioSizeUSD: 640000,
    goals: ["Down payment in 2 years", "College fund"],
    preferences: ["Tax-efficient funds", "Dividend focus"],
  },
  {
    name: "Sara Martinez",
    email: "sara.martinez@example.com",
    age: 61,
    profession: "Professor",
    familyStatus: "Single",
    riskTolerance: "Conservative",
    portfolioSizeUSD: 2100000,
    goals: ["Retire at 63", "Charitable giving"],
    preferences: ["Municipal bonds", "Low volatility"],
  },
  {
    name: "Daniel O'Neil",
    email: "daniel.oneil@example.com",
    age: 48,
    profession: "Small Business Owner",
    familyStatus: "Married, 3 children",
    riskTolerance: "Moderate",
    portfolioSizeUSD: 990000,
    goals: ["Succession planning", "College funding"],
    preferences: ["Diversified ETFs", "Multi-asset"],
  },
  {
    name: "Emily Nguyen",
    email: "emily.nguyen@example.com",
    age: 33,
    profession: "Attorney",
    familyStatus: "Single",
    riskTolerance: "Aggressive",
    portfolioSizeUSD: 310000,
    goals: ["Grow wealth", "Home purchase"],
    preferences: ["Thematic ETFs", "International exposure"],
  },
  {
    name: "Jamal Robinson",
    email: "jamal.robinson@example.com",
    age: 46,
    profession: "Sales Director",
    familyStatus: "Married",
    riskTolerance: "Moderate",
    portfolioSizeUSD: 570000,
    goals: ["College funding", "Retirement at 62"],
    preferences: ["Target date funds", "Automatic rebalancing"],
  },
  {
    name: "Olivia Rossi",
    email: "olivia.rossi@example.com",
    age: 58,
    profession: "Designer",
    familyStatus: "Married",
    riskTolerance: "Conservative",
    portfolioSizeUSD: 1350000,
    goals: ["Retirement income stability", "Downsize home"],
    preferences: ["Dividend aristocrats", "Bond ladders"],
  },
  {
    name: "Noah Wilson",
    email: "noah.wilson@example.com",
    age: 29,
    profession: "Software Engineer",
    familyStatus: "Partnered",
    riskTolerance: "Aggressive",
    portfolioSizeUSD: 210000,
    goals: ["Wealth accumulation", "Start a business"],
    preferences: ["Tech stocks", "Crypto allocation (small)"],
  },
  {
    name: "Hana Kim",
    email: "hana.kim@example.com",
    age: 39,
    profession: "Data Scientist",
    familyStatus: "Married, 1 child",
    riskTolerance: "Moderate",
    portfolioSizeUSD: 450000,
    goals: ["Home renovation", "College fund"],
    preferences: ["Index funds", "ESG tilt"],
  },
  {
    name: "Robert Brown",
    email: "robert.brown@example.com",
    age: 66,
    profession: "Retired Executive",
    familyStatus: "Married",
    riskTolerance: "Conservative",
    portfolioSizeUSD: 2800000,
    goals: ["Legacy planning", "Charitable giving"],
    preferences: ["Municipal bonds", "Low-vol equity"],
  },
  {
    name: "Isabella Garcia",
    email: "isabella.garcia@example.com",
    age: 52,
    profession: "Marketing VP",
    familyStatus: "Married, 2 children",
    riskTolerance: "Moderate",
    portfolioSizeUSD: 1100000,
    goals: ["College funding", "Retirement at 60"],
    preferences: ["Balanced funds", "Real estate exposure"],
  },
];

export const clients: SampleClient[] = baseClients.map((c, idx) => ({ id: `client-${idx + 1}`, ...c }));

// Utility to create a rolling 9-month window of communications with realistic subjects/bodies
function createClientThread(client: SampleClient) {
  const now = new Date();
  const start = addMonths(now, -9);
  const messages: SampleEmail[] = [];
  const events: SampleEvent[] = [];
  const chats: SampleTeamsMessage[] = [];

  const pushes = [
    {
      // Initial consultation
      subject: `Intro consultation with ${client.name}`,
      body: `Hi ${client.name.split(" ")[0]},\n\nThank you for meeting to discuss your financial goals. Based on your ${
        client.riskTolerance.toLowerCase()
      } risk tolerance and portfolio of $${client.portfolioSizeUSD.toLocaleString()}, we will draft an IPS (Investment Policy Statement).\n\nRegards,\nYour Advisor`,
      offsetDays: 15,
    },
    {
      // Investment discussion
      subject: `Portfolio allocation proposal`;
      body: `Hi ${client.name.split(" ")[0]},\n\nAttached is a proposed allocation emphasizing ${client.preferences[0]}. Please review and share feedback.\n\nThanks,\nYour Advisor`,
      offsetDays: 35,
    },
    {
      // Market update
      subject: `Market update and implications for your plan`,
      body: `Hello ${client.name.split(" ")[0]},\n\nRecent market movements suggest ${client.riskTolerance.toLowerCase()} positioning remains appropriate. We'll monitor and rebalance as needed.\n\nBest,\nYour Advisor`,
      offsetDays: 95,
    },
    {
      // Life event communication
      subject: `Planning for upcoming life event`;
      body: `Hi ${client.name.split(" ")[0]},\n\nCongratulations on your upcoming milestone. Let's ensure the plan accounts for it (e.g., ${
        client.goals[0]
      }).\n\nRegards,\nYour Advisor`,
      offsetDays: 150,
    },
    {
      // Follow-up meeting
      subject: `Follow-up: schedule next review`,
      body: `Hi ${client.name.split(" ")[0]},\n\nFollowing our last discussion, please pick convenient times for a check-in. We'll review performance and next steps.\n\nThanks,\nYour Advisor`,
      offsetDays: 210,
    },
  ];

  pushes.forEach((p, i) => {
    const when = addDays(start, p.offsetDays);
    messages.push({
      id: `${client.id}-email-${i + 1}`,
      clientId: client.id,
      from: { name: client.name, address: client.email },
      to: [advisor],
      subject: p.subject,
      body: p.body,
      receivedDateTime: formatISO(when),
    });
    // Create corresponding event around some messages
    if (i === 0 || i === 4) {
      const startAt = addDays(when, 3);
      events.push({
        id: `${client.id}-event-${i + 1}`,
        clientId: client.id,
        subject: i === 0 ? `Initial consultation (virtual)` : `Quarterly review with ${client.name.split(" ")[0]}`,
        start: formatISO(startAt),
        end: formatISO(addDays(startAt, 0.04)), // ~1 hour
        organizer: advisor,
        attendees: [{ name: client.name, address: client.email }],
        notes: i === 0 ? "Discussed goals and risk" : "Review performance, discuss rebalancing",
      });
    }
    // Add chats around market/life events
    if (i === 2 || i === 3) {
      chats.push({
        id: `${client.id}-chat-${i + 1}`,
        clientId: client.id,
        from: client.name,
        createdDateTime: formatISO(addDays(when, 1)),
        content: i === 2 ? "Thanks for the update—agree with staying the course." : "We will confirm dates for the event; appreciate planning ahead.",
      });
    }
  });

  return { messages, events, chats };
}

const allEmails: SampleEmail[] = [];
const allEvents: SampleEvent[] = [];
const allChats: SampleTeamsMessage[] = [];

clients.forEach(c => {
  const { messages, events, chats } = createClientThread(c);
  allEmails.push(...messages);
  allEvents.push(...events);
  allChats.push(...chats);
});

export const emails: SampleEmail[] = allEmails.sort((a, b) => a.receivedDateTime.localeCompare(b.receivedDateTime));
export const events: SampleEvent[] = allEvents.sort((a, b) => a.start.localeCompare(b.start));
export const teamsMessages: SampleTeamsMessage[] = allChats.sort((a, b) => a.createdDateTime.localeCompare(b.createdDateTime));

export function getClientById(id: string): SampleClient | undefined {
  return clients.find(c => c.id === id);
}

export function getCommunicationsByClient(id: string) {
  return {
    emails: emails.filter(e => e.clientId === id),
    events: events.filter(e => e.clientId === id),
    chats: teamsMessages.filter(t => t.clientId === id),
  };
}


