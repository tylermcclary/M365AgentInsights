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

export type MeetingType = "scheduled_call" | "portfolio_review" | "planning_session" | "urgent_consultation";
export type MeetingStatus = "scheduled" | "completed" | "cancelled";

export type SampleMeeting = {
  id: string;
  clientId: string;
  subject: string;
  description: string;
  agenda?: string;
  startTime: string; // ISO
  endTime: string; // ISO
  location?: string;
  meetingUrl?: string;
  attendees: { name: string; address: string }[];
  status: MeetingStatus;
  notes?: string;
  meetingType: MeetingType;
  createdDateTime: string; // ISO
  lastModifiedDateTime: string; // ISO
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

// Generate comprehensive meeting scenarios for testing different AI processing modes
function generateMeetingScenarios(client: SampleClient, variant: number, first: string, start: Date, now: Date): SampleMeeting[] {
  const meetings: SampleMeeting[] = [];
  const meetingTypes: MeetingType[] = ["scheduled_call", "portfolio_review", "planning_session", "urgent_consultation"];
  
  // Create specific test scenarios based on variant
  const scenarios = getMeetingScenariosForVariant(variant, client, first);
  
  scenarios.forEach((scenario, index) => {
    const meetingDate = addDays(start, scenario.offsetDays);
    const startHour = scenario.startHour || (9 + Math.floor(Math.random() * 8));
    const duration = scenario.duration || (scenario.type === "urgent_consultation" ? 0.5 : scenario.type === "portfolio_review" ? 1.5 : 1);
    
    const startTime = new Date(meetingDate);
    startTime.setHours(startHour, 0, 0, 0);
    const endTime = new Date(startTime.getTime() + duration * 60 * 60 * 1000);
    
    const isCompleted = meetingDate < now;
    const isCancelled = scenario.status === "cancelled" || (!isCompleted && Math.random() < 0.1);
    
    meetings.push({
      id: `${client.id}-meeting-${index + 1}`,
      clientId: client.id,
      subject: scenario.subject,
      description: scenario.description,
      agenda: scenario.agenda,
      startTime: formatISO(startTime),
      endTime: formatISO(endTime),
      location: scenario.location,
      meetingUrl: scenario.meetingUrl,
      attendees: [
        { name: "You", address: "advisor@example.com" },
        { name: client.name, address: client.email }
      ],
      status: isCancelled ? "cancelled" : isCompleted ? "completed" : "scheduled",
      notes: isCompleted ? scenario.notes : "",
      meetingType: scenario.type,
      createdDateTime: formatISO(addDays(meetingDate, -7)),
      lastModifiedDateTime: formatISO(addDays(meetingDate, isCompleted ? 1 : -1))
    });
  });
  
  return meetings;
}

// Define specific test scenarios for different AI processing modes
function getMeetingScenariosForVariant(variant: number, client: SampleClient, first: string) {
  const scenarios = [];
  
  switch (variant) {
    case 0: // High-performing client with regular meetings
      scenarios.push(
        {
          type: "portfolio_review" as MeetingType,
          subject: `Q1 Portfolio Review - ${first}`,
          description: `Comprehensive quarterly review of ${first}'s portfolio performance, asset allocation, and rebalancing opportunities.`,
          agenda: `1. YTD Performance Analysis (${(Math.random() * 15 + 8).toFixed(1)}%)\n2. Asset Allocation Review\n3. Rebalancing Opportunities\n4. Risk Assessment Update\n5. Goal Progress Review\n6. Tax-Loss Harvesting\n7. Next Quarter Planning`,
          notes: `Excellent performance this quarter. Portfolio up ${(Math.random() * 15 + 8).toFixed(1)}% YTD vs S&P 500's ${(Math.random() * 10 + 5).toFixed(1)}%. Client very satisfied. Recommended minor rebalancing to maintain target allocation. Discussed increasing monthly contributions by $500.`,
          offsetDays: 15,
          startHour: 10,
          duration: 1.5,
          location: "Office Conference Room A",
          meetingUrl: `https://teams.microsoft.com/l/meetup-join/${Math.random().toString(36).substr(2, 9)}`,
          status: "completed"
        },
        {
          type: "planning_session" as MeetingType,
          subject: `Annual Planning Session - ${first}`,
          description: `Strategic annual planning session to review financial goals, life changes, and adjust investment strategy for the upcoming year.`,
          agenda: `1. Annual Goal Review\n2. Life Changes Assessment\n3. Investment Strategy Updates\n4. Tax Planning for ${new Date().getFullYear()}\n5. Estate Planning Review\n6. Risk Tolerance Reassessment\n7. Contribution Schedule Planning`,
          notes: `Comprehensive planning session completed. Updated goals based on recent promotion (salary increase 15%). Adjusted contribution schedule to maximize 401k match. Discussed college funding strategy for children. Client committed to increasing emergency fund to 6 months expenses.`,
          offsetDays: 45,
          startHour: 14,
          duration: 2,
          location: "Office Conference Room B",
          status: "completed"
        },
        {
          type: "scheduled_call" as MeetingType,
          subject: `Monthly Check-in - ${first}`,
          description: `Regular monthly check-in call to discuss portfolio performance, address questions, and provide market updates.`,
          agenda: `1. Monthly Performance Update\n2. Market Outlook Discussion\n3. Client Questions\n4. Upcoming Events\n5. Next Steps`,
          notes: `Monthly check-in completed. Portfolio performing well. Client had questions about international allocation - reassured about diversification benefits. Discussed upcoming earnings season impact. Scheduled next month's call.`,
          offsetDays: 75,
          startHour: 11,
          duration: 1,
          meetingUrl: `https://teams.microsoft.com/l/meetup-join/${Math.random().toString(36).substr(2, 9)}`,
          status: "completed"
        },
        {
          type: "portfolio_review" as MeetingType,
          subject: `Mid-Year Portfolio Review - ${first}`,
          description: `Mid-year comprehensive portfolio review including performance analysis, rebalancing, and strategy adjustments.`,
          agenda: `1. Mid-Year Performance Review\n2. Asset Allocation Analysis\n3. Rebalancing Recommendations\n4. Risk Assessment\n5. Goal Progress Update\n6. Strategy Adjustments\n7. Tax Planning Updates`,
          notes: `Mid-year review completed. Portfolio up ${(Math.random() * 20 + 10).toFixed(1)}% YTD. Excellent performance across all asset classes. Recommended rebalancing to maintain target allocation. Client very pleased with results. Discussed increasing international exposure.`,
          offsetDays: 120,
          startHour: 9,
          duration: 1.5,
          location: "Office Conference Room A",
          status: "completed"
        },
        {
          type: "scheduled_call" as MeetingType,
          subject: `Market Update Call - ${first}`,
          description: `Scheduled call to discuss recent market volatility and its impact on the client's portfolio strategy.`,
          agenda: `1. Market Volatility Analysis\n2. Portfolio Impact Assessment\n3. Strategy Discussion\n4. Risk Management\n5. Client Concerns\n6. Next Steps`,
          notes: `Market update call completed. Discussed recent volatility and its impact on portfolio. Client remained calm and focused on long-term strategy. Reassured about diversification benefits. No changes to strategy recommended.`,
          offsetDays: 150,
          startHour: 15,
          duration: 1,
          meetingUrl: `https://teams.microsoft.com/l/meetup-join/${Math.random().toString(36).substr(2, 9)}`,
          status: "completed"
        },
        {
          type: "planning_session" as MeetingType,
          subject: `Year-End Planning - ${first}`,
          description: `Year-end planning session to review annual performance, tax optimization, and set goals for the next year.`,
          agenda: `1. Annual Performance Review\n2. Tax Optimization Strategies\n3. Goal Achievement Assessment\n4. Next Year Planning\n5. Contribution Adjustments\n6. Estate Planning Updates\n7. Risk Review`,
          notes: `Year-end planning session completed. Excellent year with ${(Math.random() * 25 + 15).toFixed(1)}% returns. Implemented tax-loss harvesting. Client exceeded all goals. Set ambitious targets for next year. Increased contribution schedule.`,
          offsetDays: 200,
          startHour: 10,
          duration: 2,
          location: "Office Conference Room B",
          status: "scheduled"
        }
      );
      break;
      
    case 1: // Client with market anxiety and urgent consultations
      scenarios.push(
        {
          type: "urgent_consultation" as MeetingType,
          subject: `URGENT: Market Crash Concerns - ${first}`,
          description: `Urgent consultation to address client's concerns about recent market volatility and potential portfolio adjustments.`,
          agenda: `1. Immediate Concerns Discussion\n2. Market Impact Assessment\n3. Portfolio Analysis\n4. Risk Management Options\n5. Emotional Support\n6. Action Plan`,
          notes: `Urgent consultation completed. Client very anxious about market volatility. Portfolio down ${(Math.random() * 8 + 2).toFixed(1)}% this month. Reassured client about long-term strategy and diversification. Discussed defensive positioning options. Client calmed but still concerned.`,
          offsetDays: 5,
          startHour: 9,
          duration: 0.5,
          meetingUrl: `https://teams.microsoft.com/l/meetup-join/${Math.random().toString(36).substr(2, 9)}`,
          status: "completed"
        },
        {
          type: "portfolio_review" as MeetingType,
          subject: `Emergency Portfolio Review - ${first}`,
          description: `Emergency portfolio review following market volatility to assess damage and determine next steps.`,
          agenda: `1. Portfolio Damage Assessment\n2. Asset Class Analysis\n3. Risk Exposure Review\n4. Rebalancing Options\n5. Defensive Strategies\n6. Recovery Planning`,
          notes: `Emergency review completed. Portfolio down ${(Math.random() * 12 + 5).toFixed(1)}% from peak. Some asset classes hit harder than others. Recommended defensive rebalancing. Client still anxious but agreed to stay course with minor adjustments.`,
          offsetDays: 12,
          startHour: 14,
          duration: 1.5,
          location: "Office Conference Room A",
          status: "completed"
        },
        {
          type: "urgent_consultation" as MeetingType,
          subject: `Follow-up: Market Recovery - ${first}`,
          description: `Follow-up consultation to discuss market recovery and portfolio performance improvements.`,
          agenda: `1. Market Recovery Discussion\n2. Portfolio Performance Update\n3. Strategy Effectiveness\n4. Client Sentiment\n5. Future Planning\n6. Risk Management`,
          notes: `Follow-up consultation completed. Market showing signs of recovery. Portfolio up ${(Math.random() * 5 + 2).toFixed(1)}% from low. Client relieved but still cautious. Discussed gradual rebalancing back to target allocation. Client more confident in strategy.`,
          offsetDays: 25,
          startHour: 11,
          duration: 0.5,
          meetingUrl: `https://teams.microsoft.com/l/meetup-join/${Math.random().toString(36).substr(2, 9)}`,
          status: "completed"
        },
        {
          type: "scheduled_call" as MeetingType,
          subject: `Monthly Anxiety Check - ${first}`,
          description: `Regular check-in call to monitor client's anxiety levels and provide reassurance about portfolio strategy.`,
          agenda: `1. Client Anxiety Assessment\n2. Portfolio Performance Update\n3. Market Outlook Discussion\n4. Strategy Reassurance\n5. Emotional Support\n6. Next Steps`,
          notes: `Monthly anxiety check completed. Client still concerned about market volatility. Portfolio recovering well. Provided additional reassurance about diversification benefits. Client appreciated regular check-ins. Scheduled next month's call.`,
          offsetDays: 45,
          startHour: 16,
          duration: 1,
          meetingUrl: `https://teams.microsoft.com/l/meetup-join/${Math.random().toString(36).substr(2, 9)}`,
          status: "completed"
        },
        {
          type: "planning_session" as MeetingType,
          subject: `Risk Tolerance Reassessment - ${first}`,
          description: `Planning session to reassess client's risk tolerance after market volatility experience.`,
          agenda: `1. Risk Tolerance Assessment\n2. Market Experience Discussion\n3. Portfolio Strategy Review\n4. Goal Adjustment\n5. Risk Management Planning\n6. Future Strategy`,
          notes: `Risk tolerance reassessment completed. Client's risk tolerance has decreased due to market experience. Recommended more conservative allocation. Adjusted goals to be more realistic. Client agreed to gradual transition to more conservative strategy.`,
          offsetDays: 80,
          startHour: 10,
          duration: 2,
          location: "Office Conference Room B",
          status: "completed"
        },
        {
          type: "scheduled_call" as MeetingType,
          subject: `Quarterly Review - ${first}`,
          description: `Quarterly review to assess portfolio performance and client satisfaction with new conservative strategy.`,
          agenda: `1. Quarterly Performance Review\n2. Conservative Strategy Assessment\n3. Client Satisfaction\n4. Goal Progress\n5. Strategy Adjustments\n6. Next Quarter Planning`,
          notes: `Quarterly review completed. Conservative strategy performing well with ${(Math.random() * 8 + 3).toFixed(1)}% returns. Client much more comfortable with lower volatility. Goals on track. No changes needed to strategy.`,
          offsetDays: 120,
          startHour: 13,
          duration: 1,
          meetingUrl: `https://teams.microsoft.com/l/meetup-join/${Math.random().toString(36).substr(2, 9)}`,
          status: "scheduled"
        }
      );
      break;
      
    case 2: // Life event planning client
      scenarios.push(
        {
          type: "planning_session" as MeetingType,
          subject: `Wedding Planning Impact - ${first}`,
          description: `Planning session to assess the financial impact of upcoming wedding and adjust investment strategy accordingly.`,
          agenda: `1. Wedding Budget Review\n2. Financial Impact Assessment\n3. Investment Strategy Adjustments\n4. Cash Flow Planning\n5. Goal Prioritization\n6. Timeline Adjustments`,
          notes: `Wedding planning session completed. Budget set at $50,000. Adjusted monthly contributions to accommodate wedding expenses. Delayed some investment goals by 6 months. Client comfortable with adjustments. Discussed post-wedding financial planning.`,
          offsetDays: 20,
          startHour: 14,
          duration: 2,
          location: "Office Conference Room A",
          status: "completed"
        },
        {
          type: "scheduled_call" as MeetingType,
          subject: `Home Purchase Planning - ${first}`,
          description: `Scheduled call to discuss home purchase planning and its impact on investment strategy.`,
          agenda: `1. Home Purchase Budget\n2. Down Payment Planning\n3. Investment Strategy Impact\n4. Cash Flow Adjustments\n5. Timeline Planning\n6. Next Steps`,
          notes: `Home purchase planning call completed. Budget set at $400,000 with $80,000 down payment. Adjusted investment strategy to be more conservative for down payment. Reduced monthly contributions temporarily. Client excited about home purchase.`,
          offsetDays: 50,
          startHour: 11,
          duration: 1,
          meetingUrl: `https://teams.microsoft.com/l/meetup-join/${Math.random().toString(36).substr(2, 9)}`,
          status: "completed"
        },
        {
          type: "planning_session" as MeetingType,
          subject: `Post-Wedding Financial Planning - ${first}`,
          description: `Planning session to reassess financial goals and strategy after wedding completion.`,
          agenda: `1. Post-Wedding Financial Assessment\n2. Goal Reprioritization\n3. Investment Strategy Updates\n4. Cash Flow Optimization\n5. New Goals Setting\n6. Timeline Planning`,
          notes: `Post-wedding planning session completed. Wedding came in under budget by $5,000. Adjusted investment strategy back to original plan. Increased monthly contributions. Set new goals for home purchase and children's education. Client very satisfied with progress.`,
          offsetDays: 90,
          startHour: 10,
          duration: 2,
          location: "Office Conference Room B",
          status: "completed"
        },
        {
          type: "portfolio_review" as MeetingType,
          subject: `Life Changes Portfolio Review - ${first}`,
          description: `Portfolio review to assess performance and make adjustments based on recent life changes.`,
          agenda: `1. Life Changes Impact Assessment\n2. Portfolio Performance Review\n3. Strategy Effectiveness\n4. Goal Progress Update\n5. Adjustments Needed\n6. Future Planning`,
          notes: `Life changes portfolio review completed. Portfolio performing well despite life changes. Strategy adjustments working effectively. Goals back on track. Client very pleased with progress. Discussed increasing contributions now that wedding is over.`,
          offsetDays: 130,
          startHour: 15,
          duration: 1.5,
          location: "Office Conference Room A",
          status: "completed"
        },
        {
          type: "scheduled_call" as MeetingType,
          subject: `Home Purchase Update - ${first}`,
          description: `Update call to discuss home purchase progress and any adjustments needed to financial strategy.`,
          agenda: `1. Home Purchase Progress\n2. Financial Strategy Assessment\n3. Down Payment Status\n4. Timeline Updates\n5. Strategy Adjustments\n6. Next Steps`,
          notes: `Home purchase update call completed. Found perfect home within budget. Down payment ready. Closing scheduled for next month. Adjusted investment strategy for post-purchase planning. Client very excited about new home.`,
          offsetDays: 160,
          startHour: 12,
          duration: 1,
          meetingUrl: `https://teams.microsoft.com/l/meetup-join/${Math.random().toString(36).substr(2, 9)}`,
          status: "completed"
        },
        {
          type: "planning_session" as MeetingType,
          subject: `New Home Financial Planning - ${first}`,
          description: `Planning session to establish new financial goals and strategy after home purchase.`,
          agenda: `1. New Home Financial Assessment\n2. Mortgage Planning\n3. New Goals Setting\n4. Investment Strategy Updates\n5. Cash Flow Optimization\n6. Future Planning`,
          notes: `New home financial planning session completed. Mortgage secured at 3.5% rate. Adjusted investment strategy for new cash flow. Set new goals for home improvements and children's education. Client very happy with new home and financial plan.`,
          offsetDays: 200,
          startHour: 9,
          duration: 2,
          location: "Office Conference Room B",
          status: "scheduled"
        }
      );
      break;
      
    case 3: // Market volatility response client
      scenarios.push(
        {
          type: "urgent_consultation" as MeetingType,
          subject: `Market Volatility Response - ${first}`,
          description: `Urgent consultation to discuss market volatility and determine appropriate response strategy.`,
          agenda: `1. Market Volatility Analysis\n2. Portfolio Impact Assessment\n3. Response Strategy Options\n4. Risk Management\n5. Client Decision\n6. Action Plan`,
          notes: `Market volatility response consultation completed. Portfolio down ${(Math.random() * 10 + 3).toFixed(1)}% this month. Client wants to stay course but concerned. Discussed defensive strategies. Client agreed to minor rebalancing.`,
          offsetDays: 8,
          startHour: 9,
          duration: 0.5,
          meetingUrl: `https://teams.microsoft.com/l/meetup-join/${Math.random().toString(36).substr(2, 9)}`,
          status: "completed"
        },
        {
          type: "portfolio_review" as MeetingType,
          subject: `Volatility Impact Review - ${first}`,
          description: `Portfolio review to assess the impact of market volatility and determine recovery strategy.`,
          agenda: `1. Volatility Impact Analysis\n2. Asset Class Performance\n3. Recovery Strategy\n4. Risk Assessment\n5. Rebalancing Options\n6. Future Planning`,
          notes: `Volatility impact review completed. Portfolio down ${(Math.random() * 15 + 5).toFixed(1)}% from peak. Some asset classes hit harder. Recommended defensive rebalancing. Client agreed to gradual recovery strategy.`,
          offsetDays: 20,
          startHour: 14,
          duration: 1.5,
          location: "Office Conference Room A",
          status: "completed"
        },
        {
          type: "scheduled_call" as MeetingType,
          subject: `Market Recovery Update - ${first}`,
          description: `Update call to discuss market recovery and portfolio performance improvements.`,
          agenda: `1. Market Recovery Discussion\n2. Portfolio Performance Update\n3. Strategy Effectiveness\n4. Client Sentiment\n5. Future Planning\n6. Risk Management`,
          notes: `Market recovery update call completed. Market showing signs of recovery. Portfolio up ${(Math.random() * 8 + 3).toFixed(1)}% from low. Client relieved. Discussed gradual rebalancing back to target allocation.`,
          offsetDays: 40,
          startHour: 11,
          duration: 1,
          meetingUrl: `https://teams.microsoft.com/l/meetup-join/${Math.random().toString(36).substr(2, 9)}`,
          status: "completed"
        },
        {
          type: "portfolio_review" as MeetingType,
          subject: `Post-Volatility Portfolio Review - ${first}`,
          description: `Comprehensive portfolio review after market volatility to assess recovery and strategy effectiveness.`,
          agenda: `1. Post-Volatility Performance\n2. Strategy Effectiveness Assessment\n3. Recovery Analysis\n4. Risk Management Review\n5. Goal Progress Update\n6. Future Strategy`,
          notes: `Post-volatility portfolio review completed. Portfolio recovered well, up ${(Math.random() * 12 + 8).toFixed(1)}% from low. Strategy proved effective. Client confident in approach. Discussed increasing contributions.`,
          offsetDays: 80,
          startHour: 10,
          duration: 1.5,
          location: "Office Conference Room B",
          status: "completed"
        },
        {
          type: "scheduled_call" as MeetingType,
          subject: `Quarterly Volatility Review - ${first}`,
          description: `Quarterly review to assess portfolio performance and client satisfaction after volatility experience.`,
          agenda: `1. Quarterly Performance Review\n2. Volatility Experience Assessment\n3. Strategy Satisfaction\n4. Goal Progress\n5. Risk Management\n6. Next Quarter Planning`,
          notes: `Quarterly volatility review completed. Portfolio performing well with ${(Math.random() * 15 + 10).toFixed(1)}% returns. Client satisfied with volatility response. Goals on track. No changes needed to strategy.`,
          offsetDays: 120,
          startHour: 13,
          duration: 1,
          meetingUrl: `https://teams.microsoft.com/l/meetup-join/${Math.random().toString(36).substr(2, 9)}`,
          status: "completed"
        },
        {
          type: "planning_session" as MeetingType,
          subject: `Volatility Lessons Planning - ${first}`,
          description: `Planning session to incorporate lessons learned from market volatility into future strategy.`,
          agenda: `1. Volatility Lessons Learned\n2. Strategy Improvements\n3. Risk Management Updates\n4. Goal Adjustments\n5. Future Planning\n6. Risk Tolerance Review`,
          notes: `Volatility lessons planning session completed. Incorporated lessons learned into strategy. Improved risk management approach. Client more confident in long-term strategy. Adjusted goals to be more realistic.`,
          offsetDays: 180,
          startHour: 9,
          duration: 2,
          location: "Office Conference Room A",
          status: "scheduled"
        }
      );
      break;
      
    case 4: // Business owner with complex planning needs
      scenarios.push(
        {
          type: "planning_session" as MeetingType,
          subject: `Business Succession Planning - ${first}`,
          description: `Strategic planning session to discuss business succession planning and its impact on personal finances.`,
          agenda: `1. Business Succession Timeline\n2. Financial Impact Assessment\n3. Tax Planning Strategies\n4. Investment Strategy Updates\n5. Estate Planning\n6. Timeline Planning`,
          notes: `Business succession planning session completed. Timeline set for 3 years. Estimated sale value $2M after taxes. Developed comprehensive tax strategy. Adjusted investment strategy for post-sale planning. Client excited about retirement planning.`,
          offsetDays: 25,
          startHour: 10,
          duration: 2,
          location: "Office Conference Room A",
          status: "completed"
        },
        {
          type: "portfolio_review" as MeetingType,
          subject: `Business Owner Portfolio Review - ${first}`,
          description: `Comprehensive portfolio review for business owner with complex financial situation.`,
          agenda: `1. Business Performance Impact\n2. Portfolio Performance Review\n3. Diversification Analysis\n4. Risk Assessment\n5. Tax Optimization\n6. Succession Planning Updates`,
          notes: `Business owner portfolio review completed. Portfolio performing well with ${(Math.random() * 20 + 12).toFixed(1)}% returns. Business performance strong. Discussed diversification strategies. Tax optimization opportunities identified.`,
          offsetDays: 60,
          startHour: 14,
          duration: 1.5,
          location: "Office Conference Room B",
          status: "completed"
        },
        {
          type: "scheduled_call" as MeetingType,
          subject: `Business Sale Progress - ${first}`,
          description: `Update call to discuss business sale progress and financial planning adjustments.`,
          agenda: `1. Business Sale Progress\n2. Financial Planning Updates\n3. Tax Strategy Review\n4. Investment Adjustments\n5. Timeline Updates\n6. Next Steps`,
          notes: `Business sale progress call completed. Sale negotiations progressing well. Estimated value increased to $2.5M. Adjusted financial planning for higher proceeds. Tax strategy updated. Client optimistic about sale.`,
          offsetDays: 100,
          startHour: 11,
          duration: 1,
          meetingUrl: `https://teams.microsoft.com/l/meetup-join/${Math.random().toString(36).substr(2, 9)}`,
          status: "completed"
        },
        {
          type: "planning_session" as MeetingType,
          subject: `Post-Sale Financial Planning - ${first}`,
          description: `Planning session to establish comprehensive financial plan for post-business sale life.`,
          agenda: `1. Post-Sale Financial Assessment\n2. Investment Strategy Development\n3. Retirement Planning\n4. Tax Optimization\n5. Estate Planning\n6. Lifestyle Planning`,
          notes: `Post-sale financial planning session completed. Business sold for $2.3M after taxes. Developed comprehensive investment strategy for retirement. Tax optimization implemented. Estate planning updated. Client ready for retirement.`,
          offsetDays: 140,
          startHour: 9,
          duration: 2,
          location: "Office Conference Room A",
          status: "completed"
        },
        {
          type: "portfolio_review" as MeetingType,
          subject: `Retirement Portfolio Review - ${first}`,
          description: `Portfolio review to assess retirement readiness and investment strategy effectiveness.`,
          agenda: `1. Retirement Readiness Assessment\n2. Portfolio Performance Review\n3. Income Strategy\n4. Risk Management\n5. Tax Optimization\n6. Estate Planning Updates`,
          notes: `Retirement portfolio review completed. Portfolio performing well with ${(Math.random() * 18 + 10).toFixed(1)}% returns. Retirement goals exceeded. Income strategy effective. Tax optimization working well. Client very satisfied with retirement planning.`,
          offsetDays: 180,
          startHour: 15,
          duration: 1.5,
          location: "Office Conference Room B",
          status: "completed"
        },
        {
          type: "scheduled_call" as MeetingType,
          subject: `Retirement Lifestyle Planning - ${first}`,
          description: `Call to discuss retirement lifestyle planning and ongoing financial management.`,
          agenda: `1. Retirement Lifestyle Planning\n2. Ongoing Financial Management\n3. Income Strategy Review\n4. Tax Planning\n5. Estate Planning\n6. Future Planning`,
          notes: `Retirement lifestyle planning call completed. Client enjoying retirement. Lifestyle expenses within budget. Income strategy working well. Tax planning optimized. Estate planning updated. Client very happy with retirement.`,
          offsetDays: 220,
          startHour: 12,
          duration: 1,
          meetingUrl: `https://teams.microsoft.com/l/meetup-join/${Math.random().toString(36).substr(2, 9)}`,
          status: "scheduled"
        }
      );
      break;
      
    case 5: // Young professional with growth focus
      scenarios.push(
        {
          type: "planning_session" as MeetingType,
          subject: `Career Growth Financial Planning - ${first}`,
          description: `Planning session to align financial strategy with career growth and increasing income potential.`,
          agenda: `1. Career Growth Assessment\n2. Income Increase Planning\n3. Investment Strategy Updates\n4. Goal Setting\n5. Risk Management\n6. Future Planning`,
          notes: `Career growth financial planning session completed. Client received promotion with 20% salary increase. Adjusted investment strategy for higher income. Increased monthly contributions. Set new goals for home purchase and retirement.`,
          offsetDays: 30,
          startHour: 16,
          duration: 1.5,
          location: "Office Conference Room A",
          status: "completed"
        },
        {
          type: "portfolio_review" as MeetingType,
          subject: `Growth Portfolio Review - ${first}`,
          description: `Portfolio review focused on growth opportunities and risk management for young professional.`,
          agenda: `1. Growth Strategy Assessment\n2. Portfolio Performance Review\n3. Risk Management\n4. Diversification Analysis\n5. Goal Progress\n6. Strategy Adjustments`,
          notes: `Growth portfolio review completed. Portfolio performing well with ${(Math.random() * 25 + 15).toFixed(1)}% returns. Growth strategy effective. Risk management appropriate. Goals on track. Discussed increasing contributions.`,
          offsetDays: 70,
          startHour: 11,
          duration: 1.5,
          location: "Office Conference Room B",
          status: "completed"
        },
        {
          type: "scheduled_call" as MeetingType,
          subject: `Monthly Growth Check - ${first}`,
          description: `Monthly check-in call to monitor progress and discuss growth opportunities.`,
          agenda: `1. Monthly Progress Review\n2. Growth Opportunities\n3. Portfolio Performance\n4. Goal Updates\n5. Strategy Discussion\n6. Next Steps`,
          notes: `Monthly growth check completed. Excellent progress this month. Portfolio up ${(Math.random() * 8 + 4).toFixed(1)}%. Discussed additional investment opportunities. Client very motivated. Scheduled next month's call.`,
          offsetDays: 100,
          startHour: 13,
          duration: 1,
          meetingUrl: `https://teams.microsoft.com/l/meetup-join/${Math.random().toString(36).substr(2, 9)}`,
          status: "completed"
        },
        {
          type: "planning_session" as MeetingType,
          subject: `Home Purchase Planning - ${first}`,
          description: `Planning session to discuss home purchase goals and adjust investment strategy accordingly.`,
          agenda: `1. Home Purchase Goals\n2. Down Payment Planning\n3. Investment Strategy Impact\n4. Cash Flow Planning\n5. Timeline Planning\n6. Next Steps`,
          notes: `Home purchase planning session completed. Goal set for $300,000 home with $60,000 down payment. Adjusted investment strategy for down payment savings. Reduced growth allocation temporarily. Client excited about home purchase.`,
          offsetDays: 130,
          startHour: 10,
          duration: 2,
          location: "Office Conference Room A",
          status: "completed"
        },
        {
          type: "portfolio_review" as MeetingType,
          subject: `Pre-Home Purchase Review - ${first}`,
          description: `Portfolio review to assess readiness for home purchase and finalize strategy.`,
          agenda: `1. Home Purchase Readiness\n2. Portfolio Performance Review\n3. Down Payment Status\n4. Strategy Finalization\n5. Risk Assessment\n6. Post-Purchase Planning`,
          notes: `Pre-home purchase review completed. Down payment ready. Portfolio performing well. Strategy finalized for home purchase. Post-purchase planning discussed. Client ready to proceed with home purchase.`,
          offsetDays: 170,
          startHour: 14,
          duration: 1.5,
          location: "Office Conference Room B",
          status: "completed"
        },
        {
          type: "scheduled_call" as MeetingType,
          subject: `Post-Home Purchase Planning - ${first}`,
          description: `Call to discuss financial planning adjustments after home purchase.`,
          agenda: `1. Post-Home Purchase Assessment\n2. Financial Strategy Updates\n3. Investment Adjustments\n4. Goal Reprioritization\n5. Cash Flow Planning\n6. Future Planning`,
          notes: `Post-home purchase planning call completed. Home purchased successfully. Adjusted financial strategy for new cash flow. Increased investment contributions. Set new goals for home improvements and retirement.`,
          offsetDays: 210,
          startHour: 12,
          duration: 1,
          meetingUrl: `https://teams.microsoft.com/l/meetup-join/${Math.random().toString(36).substr(2, 9)}`,
          status: "scheduled"
        }
      );
      break;
      
    default: // Default scenario with mixed meeting types
      scenarios.push(
        {
          type: "scheduled_call" as MeetingType,
          subject: `Regular Check-in - ${first}`,
          description: `Regular check-in call to discuss portfolio performance and address any questions.`,
          agenda: `1. Portfolio Performance Review\n2. Market Outlook Discussion\n3. Client Questions\n4. Next Steps`,
          notes: `Regular check-in completed. Portfolio performing well. Client satisfied with current strategy. No changes needed.`,
          offsetDays: 20,
          startHour: 11,
          duration: 1,
          meetingUrl: `https://teams.microsoft.com/l/meetup-join/${Math.random().toString(36).substr(2, 9)}`,
          status: "completed"
        },
        {
          type: "portfolio_review" as MeetingType,
          subject: `Portfolio Review - ${first}`,
          description: `Comprehensive portfolio review including performance analysis and rebalancing recommendations.`,
          agenda: `1. Performance Metrics\n2. Asset Allocation Review\n3. Rebalancing Opportunities\n4. Risk Assessment\n5. Goal Progress`,
          notes: `Portfolio review completed. Portfolio up ${(Math.random() * 15 + 5).toFixed(1)}% YTD. Recommended minor rebalancing.`,
          offsetDays: 60,
          startHour: 14,
          duration: 1.5,
          location: "Office Conference Room A",
          status: "completed"
        },
        {
          type: "planning_session" as MeetingType,
          subject: `Financial Planning Session - ${first}`,
          description: `Strategic planning session to review financial goals and adjust investment strategy.`,
          agenda: `1. Goal Review\n2. Life Changes Discussion\n3. Investment Strategy\n4. Tax Planning\n5. Estate Planning Updates`,
          notes: `Planning session completed. Updated goals based on life changes. Adjusted contribution schedule.`,
          offsetDays: 120,
          startHour: 10,
          duration: 2,
          location: "Office Conference Room B",
          status: "completed"
        },
        {
          type: "urgent_consultation" as MeetingType,
          subject: `Urgent Consultation - ${first}`,
          description: `Urgent consultation to address immediate concerns or market volatility questions.`,
          agenda: `1. Immediate Concerns\n2. Market Impact Assessment\n3. Risk Management\n4. Action Items`,
          notes: `Urgent consultation completed. Addressed market concerns. Reassured client about long-term strategy.`,
          offsetDays: 150,
          startHour: 9,
          duration: 0.5,
          meetingUrl: `https://teams.microsoft.com/l/meetup-join/${Math.random().toString(36).substr(2, 9)}`,
          status: "completed"
        },
        {
          type: "scheduled_call" as MeetingType,
          subject: `Follow-up Call - ${first}`,
          description: `Follow-up call to check on client's concerns and provide additional support.`,
          agenda: `1. Follow-up on Concerns\n2. Additional Support\n3. Strategy Reassurance\n4. Next Steps`,
          notes: `Follow-up call completed. Client concerns addressed. Additional support provided. Strategy reaffirmed.`,
          offsetDays: 180,
          startHour: 15,
          duration: 1,
          meetingUrl: `https://teams.microsoft.com/l/meetup-join/${Math.random().toString(36).substr(2, 9)}`,
          status: "completed"
        },
        {
          type: "portfolio_review" as MeetingType,
          subject: `Year-End Review - ${first}`,
          description: `Year-end portfolio review to assess annual performance and plan for next year.`,
          agenda: `1. Annual Performance Review\n2. Goal Achievement Assessment\n3. Next Year Planning\n4. Strategy Adjustments\n5. Risk Review`,
          notes: `Year-end review completed. Excellent year with ${(Math.random() * 20 + 10).toFixed(1)}% returns. Goals exceeded.`,
          offsetDays: 240,
          startHour: 9,
          duration: 1.5,
          location: "Office Conference Room A",
          status: "scheduled"
        }
      );
      break;
  }
  
  return scenarios;
}

// Utility to create a rolling 9-month window of communications with realistic subjects/bodies
function createClientThread(client: SampleClient) {
  const now = new Date();
  const start = addMonths(now, -9);
  const messages: SampleEmail[] = [];
  const events: SampleEvent[] = [];
  const chats: SampleTeamsMessage[] = [];
  const meetings: SampleMeeting[] = [];

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

  // Generate comprehensive meeting scenarios for testing different AI processing modes
  const meetingScenarios = generateMeetingScenarios(client, variant, first, start, now);
  meetings.push(...meetingScenarios);

  return { messages, events, chats, meetings };
}

const allEmails: SampleEmail[] = [];
const allEvents: SampleEvent[] = [];
const allChats: SampleTeamsMessage[] = [];
const allMeetings: SampleMeeting[] = [];

clients.forEach(c => {
  const { messages, events, chats, meetings } = createClientThread(c);
  allEmails.push(...messages);
  allEvents.push(...events);
  allChats.push(...chats);
  allMeetings.push(...meetings);
});

export const emails: SampleEmail[] = allEmails.sort((a, b) => b.receivedDateTime.localeCompare(a.receivedDateTime));
export const events: SampleEvent[] = allEvents.sort((a, b) => a.start.localeCompare(b.start));
export const teamsMessages: SampleTeamsMessage[] = allChats.sort((a, b) => a.createdDateTime.localeCompare(b.createdDateTime));
export const meetings: SampleMeeting[] = allMeetings.sort((a, b) => a.startTime.localeCompare(b.startTime));

export function getClientById(id: string): SampleClient | undefined {
  return clients.find(c => c.id === id);
}

export function getCommunicationsByClient(id: string) {
  return {
    emails: emails.filter(e => e.clientId === id),
    events: events.filter(e => e.clientId === id),
    chats: teamsMessages.filter(t => t.clientId === id),
    meetings: meetings.filter(m => m.clientId === id),
  };
}


