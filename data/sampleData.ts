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
  const variant = Number((client.id.match(/\d+/)?.[0] ?? 1)) % 6; // 0-5
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
            subject: `Re: Portfolio allocation questions`,
            body: `Hi there,\n\nThanks for the detailed proposal. I have a few questions about the international allocation - is 20% too aggressive given current market conditions? Also, what's your view on emerging markets?\n\nBest,\n${first}`,
            offsetDays: 45,
          },
          {
            subject: `Market volatility concerns`,
            body: `Hello ${first},\n\nI understand your concerns about recent market volatility. Your portfolio is designed to weather these fluctuations, but let's discuss if we should adjust your risk tolerance or rebalance.\n\nBest,\nYour Advisor`,
            offsetDays: 67,
          },
          {
            subject: `Re: Market volatility concerns`,
            body: `Thanks for the reassurance. I'm still comfortable with the strategy, but can we schedule a call to review the performance numbers?\n\n${first}`,
            offsetDays: 70,
          },
          {
            subject: `Performance review and rebalancing`,
            body: `Hi ${first},\n\nYour portfolio has performed well despite the volatility. We've identified some rebalancing opportunities to maintain your target allocation. The attached report shows 8.2% YTD returns.\n\nThanks,\nYour Advisor`,
            offsetDays: 95,
          },
          {
            subject: `Re: Performance review`,
            body: `Excellent news! I'm pleased with the returns. When can we discuss increasing my monthly contributions?\n\n${first}`,
            offsetDays: 98,
          },
        ]
      : variant === 1
      ? [
          {
            subject: `Urgent: Market crash concerns`,
            body: `Hi ${first},\n\nI'm really worried about the recent market drop. Should we move everything to cash? I can't afford to lose more money right now.\n\n${first}`,
            offsetDays: 5,
          },
          {
            subject: `Re: Market crash concerns - Stay the course`,
            body: `Hello ${first},\n\nI understand your anxiety. Market volatility is normal, and your diversified portfolio is designed for long-term growth. Let's discuss your risk tolerance and consider if any adjustments are needed.\n\nBest,\nYour Advisor`,
            offsetDays: 6,
          },
          {
            subject: `Tax planning for year-end`,
            body: `Hi ${first},\n\nWith the market volatility, we have excellent tax-loss harvesting opportunities. We can sell some losing positions and reinvest in similar assets to maintain your allocation while reducing taxes.\n\nThanks,\nYour Advisor`,
            offsetDays: 45,
          },
          {
            subject: `Re: Tax planning - sounds good`,
            body: `That makes sense. I trust your judgment on the tax strategy. When will you execute these trades?\n\n${first}`,
            offsetDays: 47,
          },
          {
            subject: `Estate planning update needed`,
            body: `Hi ${first},\n\nYour estate plan needs updating after the recent life changes. Let's coordinate with your attorney to ensure proper beneficiary designations and trust funding.\n\nRegards,\nYour Advisor`,
            offsetDays: 89,
          },
          {
            subject: `Quarterly performance report`,
            body: `Hi ${first},\n\nDespite the challenging market, your portfolio recovered well. Q3 performance was -2.1% vs -8.3% for the S&P 500. Your diversification strategy is working.\n\nBest,\nYour Advisor`,
            offsetDays: 120,
          },
        ]
      : variant === 2
      ? [
          {
            subject: `Wedding planning and financial impact`,
            body: `Hi ${first},\n\nCongratulations on your engagement! Let's discuss how the wedding expenses and potential home purchase will affect your retirement timeline and investment strategy.\n\nBest,\nYour Advisor`,
            offsetDays: 15,
          },
          {
            subject: `Re: Wedding planning - budget questions`,
            body: `Thanks! We're budgeting $50k for the wedding. How should we adjust our monthly contributions? Also, we're thinking about buying a house next year.\n\n${first}`,
            offsetDays: 17,
          },
          {
            subject: `ESG investment preferences`,
            body: `Hi ${first},\n\nYou mentioned interest in sustainable investing. I've researched ESG funds that align with your values while maintaining diversification. The performance has been competitive with traditional funds.\n\nThanks,\nYour Advisor`,
            offsetDays: 42,
          },
          {
            subject: `Re: ESG investments - very interested`,
            body: `That's exactly what I was looking for! Can we transition 30% of my portfolio to ESG funds? I want to make sure my investments reflect my values.\n\n${first}`,
            offsetDays: 44,
          },
          {
            subject: `RSU vesting and tax strategy`,
            body: `Hi ${first},\n\nYour RSUs vest next month. We should discuss a sell-to-cover strategy to manage taxes and diversify your concentrated position in company stock.\n\nRegards,\nYour Advisor`,
            offsetDays: 78,
          },
          {
            subject: `Re: RSU strategy - need guidance`,
            body: `I'm nervous about selling company stock, but I understand the diversification benefits. What percentage would you recommend selling?\n\n${first}`,
            offsetDays: 80,
          },
        ]
      : variant === 3
      ? [
          {
            subject: `Retirement income planning`,
            body: `Hi ${first},\n\nWith retirement approaching in 5 years, let's model different withdrawal strategies and Social Security timing. We need to ensure your portfolio can support your desired lifestyle.\n\nBest,\nYour Advisor`,
            offsetDays: 8,
          },
          {
            subject: `Re: Retirement planning - concerns about sequence risk`,
            body: `I'm worried about retiring during a market downturn. Should we be more conservative with our allocation? The 4% rule seems risky given current valuations.\n\n${first}`,
            offsetDays: 10,
          },
          {
            subject: `Long-term care insurance review`,
            body: `Hi ${first},\n\nGiven your family history, we should discuss long-term care insurance options. This could protect your retirement assets and provide peace of mind.\n\nThanks,\nYour Advisor`,
            offsetDays: 35,
          },
          {
            subject: `Re: Long-term care - need to think about it`,
            body: `You're right, this is something we should address. Can you send me some quotes and coverage options? I want to make sure we're not over-insuring.\n\n${first}`,
            offsetDays: 37,
          },
          {
            subject: `Inflation hedge strategies`,
            body: `Hi ${first},\n\nWith inflation concerns, we should consider adding TIPS and real estate exposure to your portfolio. These can help preserve purchasing power in retirement.\n\nRegards,\nYour Advisor`,
            offsetDays: 65,
          },
          {
            subject: `Re: Inflation hedge - makes sense`,
            body: `Good point about inflation protection. I'm comfortable with TIPS, but I'm not sure about real estate. Can we discuss REITs instead?\n\n${first}`,
            offsetDays: 67,
          },
        ]
      : variant === 4
      ? [
          {
            subject: `Crypto investment inquiry`,
            body: `Hi ${first},\n\nI've been reading about Bitcoin and other cryptocurrencies. Should we add some crypto exposure to my portfolio? I know it's risky but the potential returns are tempting.\n\n${first}`,
            offsetDays: 9,
          },
          {
            subject: `Re: Crypto investment - proceed with caution`,
            body: `Hello ${first},\n\nCryptocurrency is highly speculative and volatile. If you're interested, we could allocate a small percentage (1-3%) as a satellite position, but it shouldn't be a core holding. Let's discuss your risk tolerance first.\n\nBest,\nYour Advisor`,
            offsetDays: 10,
          },
          {
            subject: `Divorce settlement and asset division`,
            body: `Hi ${first},\n\nI understand this is a difficult time. We need to review your financial plan and adjust for the asset division. This will impact your retirement timeline and investment strategy.\n\nRegards,\nYour Advisor`,
            offsetDays: 25,
          },
          {
            subject: `Re: Divorce settlement - need to rebuild`,
            body: `Thanks for your support. I'll be getting about 40% of the assets. I need to rebuild my financial foundation and make sure I'm on track for retirement. Can we schedule a comprehensive review?\n\n${first}`,
            offsetDays: 27,
          },
          {
            subject: `Healthcare cost planning`,
            body: `Hi ${first},\n\nWith healthcare costs rising, we should discuss HSA contributions and Medicare planning. These strategies can significantly reduce your retirement healthcare expenses.\n\nThanks,\nYour Advisor`,
            offsetDays: 48,
          },
          {
            subject: `Re: Healthcare planning - good timing`,
            body: `Perfect timing. My company is switching to a high-deductible plan next year. I want to maximize the HSA and understand how it fits into my retirement strategy.\n\n${first}`,
            offsetDays: 50,
          },
        ]
      : [
          {
            subject: `College funding strategy for kids`,
            body: `Hi ${first},\n\nLet's discuss 529 plans and education funding strategies for your children. We should consider the tax benefits and contribution limits to maximize your savings.\n\nBest,\nYour Advisor`,
            offsetDays: 12,
          },
          {
            subject: `Re: College funding - 529 vs other options`,
            body: `Thanks for the info. I'm wondering if we should also consider UTMA accounts or just focus on 529s? Also, what about grandparents contributing?\n\n${first}`,
            offsetDays: 14,
          },
          {
            subject: `Market timing concerns`,
            body: `Hi ${first},\n\nI keep hearing about a potential recession. Should we wait to invest or continue with dollar-cost averaging? I don't want to buy at the top.\n\n${first}`,
            offsetDays: 28,
          },
          {
            subject: `Re: Market timing - stay disciplined`,
            body: `Hello ${first},\n\nMarket timing is extremely difficult even for professionals. Your systematic investment approach has served you well. Let's stick to the plan and use any market weakness as an opportunity.\n\nBest,\nYour Advisor`,
            offsetDays: 29,
          },
          {
            subject: `Business succession planning`,
            body: `Hi ${first},\n\nAs you consider selling your business, we need to plan for the tax implications and how to invest the proceeds. This could significantly impact your retirement timeline.\n\nThanks,\nYour Advisor`,
            offsetDays: 55,
          },
          {
            subject: `Re: Business sale - need tax strategy`,
            body: `The sale is looking like $2M after taxes. I want to make sure we're optimizing the tax treatment and have a plan for the proceeds. Can we model different scenarios?\n\n${first}`,
            offsetDays: 57,
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

export const emails: SampleEmail[] = allEmails.sort((a, b) => b.receivedDateTime.localeCompare(a.receivedDateTime));
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


