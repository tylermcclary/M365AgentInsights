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

  // Create varied scenarios per client so insights differ meaningfully
  const variant = Number((client.id.match(/\d+/)?.[0] ?? 1)) % 5; // 0-4
  const first = client.name.split(" ")[0];
  const pref0 = client.preferences[0] ?? "diversified ETFs";
  const goal0 = client.goals[0] ?? "retirement";
  const pushes =
    variant === 0
      ? [
          {
            subject: `Kickoff consultation with ${client.name}`,
            body: `Hi ${first},\n\nGreat meeting you. Given your ${client.riskTolerance.toLowerCase()} risk profile and portfolio of $${client.portfolioSizeUSD.toLocaleString()}, we'll prepare an Investment Policy Statement and outline contribution schedules.\n\nRegards,\nYour Advisor`,
            offsetDays: 12,
          },
          {
            subject: `Proposal: ${pref0} tilt for ${goal0}`,
            body: `Hi ${first},\n\nAs discussed, this allocation emphasizes ${pref0} to align with your ${goal0}. Please review the attached draft.\n\nThanks,\nYour Advisor`,
            offsetDays: 41,
          },
          {
            subject: `Market check-in: rebalancing opportunity`,
            body: `Hello ${first},\n\nVolatility created a small drift from targets. A modest rebalance may reduce risk while keeping return expectations.\n\nBest,\nYour Advisor`,
            offsetDays: 84,
          },
          {
            subject: `Planning for upcoming ${goal0}`,
            body: `Hi ${first},\n\nCongratulations on your upcoming plans around ${goal0}. Let's update cash flows and reserves so you're prepared.\n\nRegards,\nYour Advisor`,
            offsetDays: 148,
          },
          {
            subject: `Follow-up: pick times for review`,
            body: `Hi ${first},\n\nPlease select convenient times for our next review. We'll cover performance, taxes, and next steps.\n\nThanks,\nYour Advisor`,
            offsetDays: 212,
          },
        ]
      : variant === 1
      ? [
          {
            subject: `401(k) rollover discussion`,
            body: `Hi ${first},\n\nFollowing your transition, we can consolidate your 401(k) and align with your ${client.riskTolerance.toLowerCase()} approach. I'll outline options and tax considerations.`,
            offsetDays: 10,
          },
          {
            subject: `Estate planning coordination`,
            body: `Hi ${first},\n\nCoordinating with your attorney to integrate trusts and beneficiary updates. We'll ensure ${goal0} remains on track.`,
            offsetDays: 63,
          },
          {
            subject: `Life event: home purchase preparation`,
            body: `Hi ${first},\n\nCongrats on the new home plans. We'll earmark down payment funds and review emergency reserves.`,
            offsetDays: 121,
          },
          {
            subject: `Tax-loss harvesting opportunity`,
            body: `Hello ${first},\n\nWe identified positions for harvesting losses without altering risk. This can improve after-tax returns.`,
            offsetDays: 175,
          },
          {
            subject: `Quarterly touchpoint scheduling`,
            body: `Hi ${first},\n\nLet's schedule our quarterly call to review progress and next actions.`,
            offsetDays: 228,
          },
        ]
      : variant === 2
      ? [
          {
            subject: `College savings strategy`,
            body: `Hi ${first},\n\nLet's map out 529 contributions to meet education goals while managing taxes.`,
            offsetDays: 18,
          },
          {
            subject: `Investment research: sector rotation`,
            body: `Hello ${first},\n\nResearch suggests modest rotation toward quality and dividends could fit your preferences.`,
            offsetDays: 59,
          },
          {
            subject: `Career change and cash flow plan`,
            body: `Hi ${first},\n\nWith your potential role change, let's revisit savings rate and liquidity needs.`,
            offsetDays: 132,
          },
          {
            subject: `Vacation home analysis`,
            body: `Hi ${first},\n\nAttaching affordability analysis and impact on long-term plan.`,
            offsetDays: 186,
          },
          {
            subject: `Annual review: performance & goals`,
            body: `Hi ${first},\n\nLet's review performance vs. benchmarks and confirm your priorities for the next 12 months.`,
            offsetDays: 238,
          },
        ]
      : variant === 3
      ? [
          {
            subject: `Risk review after market drop`,
            body: `Hello ${first},\n\nGiven recent drawdowns, confirming comfort with volatility and whether we should adjust targets.`,
            offsetDays: 7,
          },
          {
            subject: `Charitable giving strategy`,
            body: `Hi ${first},\n\nWe can optimize your donations via donor-advised funds to maximize deductions.`,
            offsetDays: 77,
          },
          {
            subject: `Healthcare/HSAs update`,
            body: `Hi ${first},\n\nOpen enrollment approaches—review HSA and coverage choices in context of your plan.`,
            offsetDays: 137,
          },
          {
            subject: `RSU vesting schedule`,
            body: `Hi ${first},\n\nYour RSUs vest next quarter—proposing a sell-to-cover plan and diversification.`,
            offsetDays: 193,
          },
          {
            subject: `Year-end tax planning`,
            body: `Hi ${first},\n\nLet's finalize tax strategies (harvesting, gifting, retirement contributions) before year end.`,
            offsetDays: 246,
          },
        ]
      : [
          {
            subject: `Retirement income simulation`,
            body: `Hi ${first},\n\nAttaching scenarios for withdrawal rates and Social Security timing to meet income needs.`,
            offsetDays: 22,
          },
          {
            subject: `Insurance coverage review`,
            body: `Hello ${first},\n\nReviewing life/disability/umbrella coverage to ensure appropriate protection.`,
            offsetDays: 68,
          },
          {
            subject: `Travel plans and budgeting`,
            body: `Hi ${first},\n\nIncorporating travel budget for the next year into cash flow plan.`,
            offsetDays: 128,
          },
          {
            subject: `ESG preference questionnaire`,
            body: `Hi ${first},\n\nSharing updated ESG questionnaire to better reflect your values in the portfolio.`,
            offsetDays: 182,
          },
          {
            subject: `Mid-year review scheduling`,
            body: `Hi ${first},\n\nPlease pick a time for mid-year check-in to revisit goals and progress.`,
            offsetDays: 234,
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
    // Add chats around market/life events with varied tones
    if (i === 2 || i === 3) {
      chats.push({
        id: `${client.id}-chat-${i + 1}`,
        clientId: client.id,
        from: client.name,
        createdDateTime: formatISO(addDays(when, 1)),
        content:
          i === 2
            ? variant % 2 === 0
              ? "Appreciate the update—comfortable staying the course for now."
              : "Concerned about volatility. Should we de-risk a bit?"
            : variant % 2 === 0
            ? "We'll confirm dates—thank you for proactive planning."
            : "Can we accelerate planning? Timelines moved up.",
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


