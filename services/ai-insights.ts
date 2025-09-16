import { addDays, differenceInCalendarWeeks, format } from "date-fns";
import type { GraphMailItem, GraphCalendarEvent } from "@/types";
import { AIProcessingManager } from './ai-processing-manager';
import { AIProcessingMode, EnhancedClientInsights } from '@/types';
import { getBestAvailableMode, getConfigSummary } from '@/lib/ai-config';

// Existing exports used by UI
export type Insight = {
  id: string;
  type: "task" | "reminder" | "summary";
  title: string;
  detail?: string;
};

export function generateInsightsFromGraph(
  emails: GraphMailItem[],
  events: GraphCalendarEvent[]
): Insight[] {
  const insights: Insight[] = [];

  const upcoming = events.slice(0, 3).map(e => ({
    id: `event-${e.id}`,
    type: "reminder" as const,
    title: `Upcoming: ${e.subject}`,
    detail: `${format(new Date(e.start.dateTime), "PPpp")} with ${e.organizer?.emailAddress?.name ?? "Unknown"}`,
  }));
  insights.push(...upcoming);

  const followUps = emails
    .filter(m => /follow\s*up|action required|approve/i.test(m.subject ?? ""))
    .slice(0, 3)
    .map(m => ({
      id: `mail-${m.id}`,
      type: "task" as const,
      title: `Follow up: ${m.subject}`,
      detail: `From ${m.from?.emailAddress?.name ?? "Unknown"} by ${format(addDays(new Date(m.receivedDateTime), 2), "PP")}`,
    }));
  insights.push(...followUps);

  if (insights.length === 0) {
    insights.push({ id: "summary-1", type: "summary", title: "You're all caught up!" });
  }

  return insights;
}

/**
 * Enhanced insights generation using AI capabilities
 * Falls back to basic insights if AI is not available
 */
export async function generateEnhancedInsights(
  emails: GraphMailItem[],
  events: GraphCalendarEvent[]
): Promise<Insight[]> {
  try {
    // For now, use basic insights generation
    // TODO: Integrate with server-side AI processing when needed
    return generateInsightsFromGraph(emails, events);
  } catch (error) {
    console.warn('Enhanced insights unavailable, falling back to basic insights:', error);
    // Fall back to basic insights generation
    return generateInsightsFromGraph(emails, events);
  }
}

// ==============================
// POC AI Insights (mock engine)
// ==============================

export type Communication = {
  id: string;
  type: "email" | "event" | "chat" | "meeting";
  from?: string;
  subject?: string;
  body?: string;
  timestamp: string; // ISO
  // Meeting-specific fields
  meetingType?: "scheduled_call" | "portfolio_review" | "planning_session" | "urgent_consultation";
  meetingStatus?: "scheduled" | "completed" | "cancelled";
  meetingDuration?: number; // in minutes
  meetingLocation?: string;
  meetingUrl?: string;
  meetingAgenda?: string;
  meetingNotes?: string;
  attendees?: Array<{ name: string; address: string }>;
  endTime?: string; // ISO timestamp for meetings
};

export type ClientSummary = {
  text: string;
  topics: string[];
  sentiment: "positive" | "neutral" | "negative";
  frequencyPerWeek: number;
};

export type LastInteraction = {
  when: string;
  type: Communication["type"];
  subject?: string;
  snippet?: string;
};

export type NextBestAction = {
  id: string;
  title: string;
  rationale: string;
  dueDate?: string;
  priority: "low" | "medium" | "high";
};

export type ClientHighlight = {
  label: string;
  value: string;
};

export type ClientInsights = {
  summary: ClientSummary;
  lastInteraction: LastInteraction | null;
  recommendedActions: NextBestAction[];
  highlights: ClientHighlight[];
  // Meeting-specific insights
  meetingInsights?: {
    frequency: {
      totalMeetings: number;
      averagePerMonth: number;
      lastMeetingDate?: string;
      nextScheduledMeeting?: string;
    };
    patterns: {
      preferredMeetingTypes: string[];
      averageDuration: number;
      virtualVsInPerson: { virtual: number; inPerson: number };
      completionRate: number; // percentage of completed vs scheduled meetings
    };
    engagement: {
      level: "high" | "medium" | "low";
      indicators: string[];
      followUpActions: string[];
    };
    topics: {
      frequentlyDiscussed: string[];
      meetingSpecificTopics: string[];
      emailVsMeetingTopics: { emails: string[]; meetings: string[] };
    };
  };
};

const TOPIC_KEYWORDS: Record<string, RegExp> = {
  portfolio: /(portfolio|allocation|rebalance|holdings)/i,
  meeting: /(meet|call|schedule|zoom|teams)/i,
  performance: /(performance|returns|benchmark|alpha|beta)/i,
  risk: /(risk|volatility|drawdown|hedge|market drop|crash|anxiety|worried|concerned)/i,
  fees: /(fee|billing|invoice|cost)/i,
  goals: /(goal|retirement|college|house|wedding|vacation)/i,
  market_anxiety: /(market crash|market drop|worried|anxious|nervous|panic|can't afford|move to cash)/i,
};

const POSITIVE_WORDS = /(thanks|great|appreciate|good|pleased|glad|happy|excellent|pleased|excellent|outstanding|fantastic|wonderful|amazing)/i;
const NEGATIVE_WORDS = /(concern|issue|problem|delay|bad|unhappy|angry|frustrated|worried|anxious|nervous|scared|afraid|panic|crash|drop|loss|lose|can't afford|volatility|uncertain|stress|pressure)/i;

function safeText(...parts: Array<string | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

function normalizeCommunications(communications: any[]): Communication[] {
  return (communications ?? []).map((c, idx) => ({
    id: String(c.id ?? idx),
    type: (c.type ?? "email") as Communication["type"],
    from: c.from?.emailAddress?.address ?? c.from?.email ?? c.from ?? undefined,
    subject: c.subject ?? c.summary ?? "",
    body: c.body?.content ?? c.bodyPreview ?? c.preview ?? c.body ?? "",
    timestamp: c.timestamp ?? c.createdDateTime ?? c.receivedDateTime ?? c.start?.dateTime ?? c.startTime ?? new Date().toISOString(),
    // Meeting-specific fields
    meetingType: c.meetingType,
    meetingStatus: c.meetingStatus ?? c.status,
    meetingDuration: c.meetingDuration,
    meetingLocation: c.meetingLocation ?? c.location,
    meetingUrl: c.meetingUrl,
    meetingAgenda: c.meetingAgenda ?? c.agenda,
    meetingNotes: c.meetingNotes ?? c.notes,
    attendees: c.attendees,
    endTime: c.endTime,
  }));
}

export function generateClientSummary(communications: any[]): ClientSummary {
  try {
    const items = normalizeCommunications(communications);
    const textBlob = items.map(i => safeText(i.subject, i.body)).join(" \n ");
    const topics = Object.entries(TOPIC_KEYWORDS)
      .filter(([, re]) => re.test(textBlob))
      .map(([topic]) => topic);

    let score = 0;
    score += (textBlob.match(POSITIVE_WORDS)?.length ?? 0);
    score -= (textBlob.match(NEGATIVE_WORDS)?.length ?? 0);
    const sentiment: ClientSummary["sentiment"] = score > 1 ? "positive" : score < -1 ? "negative" : "neutral";

    // Frequency approx: messages per week across the range
    const timestamps = items.map(i => new Date(i.timestamp)).sort((a, b) => a.getTime() - b.getTime());
    let frequencyPerWeek = items.length;
    if (timestamps.length >= 2) {
      const weeks = Math.max(1, differenceInCalendarWeeks(timestamps[timestamps.length - 1], timestamps[0]));
      frequencyPerWeek = Math.round((items.length / weeks) * 10) / 10;
    }

    const text = `Client communications discuss ${topics.length > 0 ? topics.join(", ") : "general topics"}. Overall sentiment appears ${sentiment}. Estimated frequency ~${frequencyPerWeek}/week.`;
    return { text, topics, sentiment, frequencyPerWeek };
  } catch (error) {
    return { text: "No summary available.", topics: [], sentiment: "neutral", frequencyPerWeek: 0 };
  }
}

export function identifyLastInteraction(communications: any[]): LastInteraction | null {
  try {
    console.log("identifyLastInteraction - input:", communications?.length, "items");
    const items = normalizeCommunications(communications);
    console.log("identifyLastInteraction - normalized:", items?.length, "items");
    if (items.length === 0) {
      console.log("identifyLastInteraction - no items, returning null");
      return null;
    }
    const last = items.reduce((a, b) => (new Date(a.timestamp) > new Date(b.timestamp) ? a : b));
    console.log("identifyLastInteraction - last item:", last);
    const result = {
      when: last.timestamp,
      type: last.type,
      subject: last.subject,
      snippet: (last.body ?? "").slice(0, 140),
    };
    console.log("identifyLastInteraction - result:", result);
    return result;
  } catch (error) {
    console.log("identifyLastInteraction - error:", error);
    return null;
  }
}

export function suggestNextBestActions(clientData: any): NextBestAction[] {
  try {
    const communications = normalizeCommunications(clientData?.communications ?? []);
    const meetings = communications.filter(c => c.type === "meeting");
    const emails = communications.filter(c => c.type === "email");
    
    const hasMeeting = communications.some(c => TOPIC_KEYWORDS.meeting.test(safeText(c.subject, c.body)));
    const hasRebalance = communications.some(c => TOPIC_KEYWORDS.portfolio.test(safeText(c.subject, c.body)));
    const hasMarketAnxiety = communications.some(c => TOPIC_KEYWORDS.market_anxiety.test(safeText(c.subject, c.body)));

    const actions: NextBestAction[] = [];
    
    if (hasMarketAnxiety) {
      actions.push({
        id: "nba-anxiety",
        title: "Schedule urgent risk tolerance review",
        rationale: "Client expressed market anxiety and concerns about portfolio safety. Immediate reassurance and risk assessment needed.",
        dueDate: format(addDays(new Date(), 1), "yyyy-MM-dd"),
        priority: "high",
      });
    }
    
    // Meeting-specific actions
    const scheduledMeetings = meetings.filter(m => m.meetingStatus === "scheduled");
    const completedMeetings = meetings.filter(m => m.meetingStatus === "completed");
    const cancelledMeetings = meetings.filter(m => m.meetingStatus === "cancelled");
    
    if (cancelledMeetings.length > 0) {
      actions.push({
        id: "nba-meeting-cancelled",
        title: "Follow up on cancelled meeting",
        rationale: `${cancelledMeetings.length} meeting(s) cancelled recently. Check in on client availability and reschedule.`,
        dueDate: format(addDays(new Date(), 1), "yyyy-MM-dd"),
        priority: "high",
      });
    }
    
    if (scheduledMeetings.length === 0 && completedMeetings.length > 0) {
      const lastMeeting = completedMeetings.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
      const daysSinceLastMeeting = Math.floor((new Date().getTime() - new Date(lastMeeting.timestamp).getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysSinceLastMeeting > 30) {
        actions.push({
          id: "nba-meeting-overdue",
          title: "Schedule next client meeting",
          rationale: `Last meeting was ${daysSinceLastMeeting} days ago. Time for regular check-in.`,
          dueDate: format(addDays(new Date(), 3), "yyyy-MM-dd"),
          priority: "medium",
        });
      }
    }
    
    if (!hasMeeting && meetings.length === 0) {
      actions.push({
        id: "nba-1",
        title: "Propose next meeting times",
        rationale: "No recent scheduling detected; maintain cadence.",
        dueDate: format(addDays(new Date(), 2), "yyyy-MM-dd"),
        priority: "medium",
      });
    }
    
    if (hasRebalance) {
      actions.push({
        id: "nba-2",
        title: "Send portfolio change summary",
        rationale: "Recent portfolio discussions detected; summarize and request confirmation.",
        dueDate: format(addDays(new Date(), 1), "yyyy-MM-dd"),
        priority: "high",
      });
    }
    
    if (actions.length === 0) {
      actions.push({
        id: "nba-3",
        title: "Share market insights",
        rationale: "Keep client engaged with relevant updates.",
        priority: "low",
      });
    }
    return actions;
  } catch {
    return [
      { id: "nba-fallback", title: "Follow up with client", rationale: "General check-in.", priority: "low" },
    ];
  }
}

export function extractClientHighlights(communications: any[]): ClientHighlight[] {
  try {
    const items = normalizeCommunications(communications);
    const meetings = items.filter(c => c.type === "meeting");
    const blob = items.map(i => safeText(i.subject, i.body)).join(" \n ");
    const highlights: ClientHighlight[] = [];

    if (TOPIC_KEYWORDS.market_anxiety.test(blob)) {
      highlights.push({ label: "Risk Profile", value: "Expressed market anxiety and safety concerns" });
    }
    if (TOPIC_KEYWORDS.goals.test(blob)) {
      highlights.push({ label: "Investment Goal", value: "Long-term retirement planning" });
    }
    if (/(wedding|anniversary|baby|graduation|move|relocation)/i.test(blob)) {
      highlights.push({ label: "Life Event", value: "Upcoming personal milestone" });
    }
    if (/(etf|index fund|dividend|esg)/i.test(blob)) {
      highlights.push({ label: "Preference", value: "Prefers diversified/ESG strategies" });
    }

    // Meeting-specific highlights
    if (meetings.length > 0) {
      const completedMeetings = meetings.filter(m => m.meetingStatus === "completed");
      const scheduledMeetings = meetings.filter(m => m.meetingStatus === "scheduled");
      
      if (completedMeetings.length > 0) {
        const avgDuration = completedMeetings.reduce((sum, m) => sum + (m.meetingDuration || 60), 0) / completedMeetings.length;
        highlights.push({ 
          label: "Meeting Engagement", 
          value: `${completedMeetings.length} completed meetings (avg ${Math.round(avgDuration)} min)` 
        });
      }
      
      if (scheduledMeetings.length > 0) {
        highlights.push({ 
          label: "Upcoming Meetings", 
          value: `${scheduledMeetings.length} scheduled meeting(s)` 
        });
      }
      
      const meetingTypes = meetings.map(m => m.meetingType).filter(Boolean);
      if (meetingTypes.length > 0) {
        const mostCommonType = meetingTypes.reduce((a, b, i, arr) => 
          arr.filter(v => v === a).length >= arr.filter(v => v === b).length ? a : b
        );
        highlights.push({ 
          label: "Preferred Meeting Type", 
          value: mostCommonType?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || "Various" 
        });
      }
    }

    if (highlights.length === 0) {
      highlights.push({ label: "Preference", value: "No explicit preferences detected" });
    }
    return highlights;
  } catch {
    return [{ label: "Info", value: "No highlights available" }];
  }
}

// New function to generate meeting-specific insights
export function generateMeetingInsights(communications: any[]): ClientInsights["meetingInsights"] {
  try {
    const items = normalizeCommunications(communications);
    const meetings = items.filter(c => c.type === "meeting");
    
    if (meetings.length === 0) {
      return undefined;
    }
    
    const now = new Date();
    const completedMeetings = meetings.filter(m => m.meetingStatus === "completed");
    const scheduledMeetings = meetings.filter(m => m.meetingStatus === "scheduled");
    const cancelledMeetings = meetings.filter(m => m.meetingStatus === "cancelled");
    
    // Calculate frequency metrics
    const totalMeetings = meetings.length;
    const firstMeeting = meetings.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())[0];
    const lastMeeting = completedMeetings.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
    const nextMeeting = scheduledMeetings.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())[0];
    
    const monthsSinceFirst = firstMeeting ? 
      Math.max(1, Math.floor((now.getTime() - new Date(firstMeeting.timestamp).getTime()) / (1000 * 60 * 60 * 24 * 30))) : 1;
    const averagePerMonth = totalMeetings / monthsSinceFirst;
    
    // Analyze patterns
    const meetingTypes = meetings.map(m => m.meetingType).filter((type): type is NonNullable<typeof type> => Boolean(type));
    const typeCounts = meetingTypes.reduce((acc, type) => {
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const preferredMeetingTypes = Object.entries(typeCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 2)
      .map(([type]) => type);
    
    const durations = completedMeetings.map(m => m.meetingDuration).filter(Boolean) as number[];
    const averageDuration = durations.length > 0 ? durations.reduce((sum, d) => sum + d, 0) / durations.length : 0;
    
    const virtualMeetings = meetings.filter(m => m.meetingUrl).length;
    const inPersonMeetings = meetings.filter(m => m.meetingLocation && !m.meetingUrl).length;
    
    const completionRate = totalMeetings > 0 ? (completedMeetings.length / totalMeetings) * 100 : 0;
    
    // Analyze engagement
    let engagementLevel: "high" | "medium" | "low" = "medium";
    const engagementIndicators: string[] = [];
    const followUpActions: string[] = [];
    
    if (averagePerMonth >= 2) {
      engagementLevel = "high";
      engagementIndicators.push("High meeting frequency");
    } else if (averagePerMonth < 0.5) {
      engagementLevel = "low";
      engagementIndicators.push("Low meeting frequency");
    }
    
    if (completionRate >= 80) {
      engagementIndicators.push("High meeting completion rate");
    } else if (completionRate < 60) {
      engagementIndicators.push("Low meeting completion rate");
      followUpActions.push("Address meeting cancellation patterns");
    }
    
    if (cancelledMeetings.length > 0) {
      followUpActions.push("Follow up on cancelled meetings");
    }
    
    if (scheduledMeetings.length === 0 && completedMeetings.length > 0) {
      const daysSinceLastMeeting = lastMeeting ? 
        Math.floor((now.getTime() - new Date(lastMeeting.timestamp).getTime()) / (1000 * 60 * 60 * 24)) : 0;
      if (daysSinceLastMeeting > 30) {
        followUpActions.push("Schedule next meeting - overdue");
      }
    }
    
    // Analyze topics
    const meetingTexts = meetings.map(m => safeText(m.subject, m.body, m.meetingAgenda, m.meetingNotes));
    const emailTexts = items.filter(c => c.type === "email").map(e => safeText(e.subject, e.body));
    
    const meetingTopics = Object.entries(TOPIC_KEYWORDS)
      .filter(([, re]) => re.test(meetingTexts.join(" ")))
      .map(([topic]) => topic);
    
    const emailTopics = Object.entries(TOPIC_KEYWORDS)
      .filter(([, re]) => re.test(emailTexts.join(" ")))
      .map(([topic]) => topic);
    
    const frequentlyDiscussed = [...new Set([...meetingTopics, ...emailTopics])];
    const meetingSpecificTopics = meetingTopics.filter(topic => !emailTopics.includes(topic));
    
    return {
      frequency: {
        totalMeetings,
        averagePerMonth: Math.round(averagePerMonth * 10) / 10,
        lastMeetingDate: lastMeeting?.timestamp,
        nextScheduledMeeting: nextMeeting?.timestamp,
      },
      patterns: {
        preferredMeetingTypes,
        averageDuration: Math.round(averageDuration),
        virtualVsInPerson: { virtual: virtualMeetings, inPerson: inPersonMeetings },
        completionRate: Math.round(completionRate),
      },
      engagement: {
        level: engagementLevel,
        indicators: engagementIndicators,
        followUpActions,
      },
      topics: {
        frequentlyDiscussed,
        meetingSpecificTopics,
        emailVsMeetingTopics: { emails: emailTopics, meetings: meetingTopics },
      },
    };
  } catch (error) {
    console.error("Error generating meeting insights:", error);
    return undefined;
  }
}

// ==============================
// Hybrid AI Processing Integration
// ==============================

// Global AI processing manager instance
let aiProcessingManager: AIProcessingManager | null = null;

// Initialize the AI processing manager
export const initializeAIProcessing = (mode?: AIProcessingMode) => {
  const configSummary = getConfigSummary();
  
  const config = {
    mode: mode || getBestAvailableMode(),
    fallbackToMock: true,
    timeout: 15000,
    maxRetries: 2
  };
  
  aiProcessingManager = new AIProcessingManager(config);
  
  console.log('🤖 AI Processing Manager initialized with:', {
    mode: config.mode,
    availableModes: configSummary.availableModes,
    openaiEnabled: configSummary.openaiEnabled,
    nlpEnabled: configSummary.nlpEnabled
  });
  
  return aiProcessingManager;
};

// Switch AI processing mode
export const switchAIMode = async (mode: AIProcessingMode) => {
  console.log(`🔄 Switching AI mode to: ${mode}`);
  if (aiProcessingManager) {
    const oldConfig = aiProcessingManager.getCurrentConfig();
    console.log(`🔄 Current mode before switch: ${oldConfig.mode}`);
    aiProcessingManager.updateConfig({ mode });
    const newConfig = aiProcessingManager.getCurrentConfig();
    console.log(`✅ AI mode updated from ${oldConfig.mode} to: ${newConfig.mode}`);
  } else {
    console.log(`🔄 Initializing new AI processing manager with mode: ${mode}`);
    aiProcessingManager = initializeAIProcessing(mode);
  }
  
  // Verify the mode was set correctly
  const currentMode = aiProcessingManager?.getCurrentMode();
  console.log(`🔍 Verified current mode: ${currentMode}`);
  return currentMode;
};

// Main analysis function that now uses hybrid processing
export const analyzeClientCommunications = async (
  clientEmail: string,
  communications: any[]
): Promise<EnhancedClientInsights> => {
  console.log('analyzeClientCommunications called with:', { clientEmail, communicationsCount: communications.length });
  
  // Get the current mode from the existing manager or initialize with default
  let currentMode: AIProcessingMode = 'mock';
  if (aiProcessingManager) {
    currentMode = aiProcessingManager.getCurrentMode();
    console.log('Using existing AI processing manager with mode:', currentMode);
  } else {
    console.log('No existing manager, initializing with default mode...');
    aiProcessingManager = initializeAIProcessing();
    currentMode = aiProcessingManager.getCurrentMode();
  }
  
  console.log('Current AI mode:', currentMode);
  
  try {
    console.log('Processing with AI manager...');
    const result = await aiProcessingManager.processClientCommunications(clientEmail, communications);
    console.log('AI processing completed successfully:', result);
    return result;
  } catch (error) {
    console.error('AI analysis failed:', error);
    console.error('Error details:', error);
    
    // Fallback to mock analysis but preserve the intended mode
    console.log(`Falling back to mock analysis for mode: ${currentMode}...`);
    
    // Ensure we have a processing manager for fallback
    if (!aiProcessingManager) {
      aiProcessingManager = initializeAIProcessing(currentMode);
    }
    
    // Force the manager to use mock mode for fallback
    aiProcessingManager.updateConfig({ mode: 'mock' });
    
    // Use the improved mock processing from the AI manager
    const mockInsights = await aiProcessingManager.processClientCommunications(clientEmail, communications);
    console.log('Mock analysis completed:', mockInsights);
    
    // Add mode-specific indicators to the fallback result
    let modeSpecificText = mockInsights.summary.text;
    if (currentMode === 'nlp') {
      modeSpecificText = `[NLP Fallback] ${modeSpecificText}`;
    } else if (currentMode === 'openai') {
      modeSpecificText = `[OpenAI Fallback] ${modeSpecificText}`;
    } else {
      modeSpecificText = `[Mock Analysis] ${modeSpecificText}`;
    }
    
    return {
      ...mockInsights,
      summary: {
        ...mockInsights.summary,
        text: modeSpecificText
      },
      processingMetrics: {
        processingTime: mockInsights.processingMetrics?.processingTime || 100,
        method: currentMode,
        confidence: 0.3, // Lower confidence for fallback
        tokensUsed: 0
      },
      aiMethod: currentMode
    };
  }
};

// Keep your existing mock analysis function for fallbacks
export const analyzeMockInsights = async (communications: any[]): Promise<ClientInsights> => {
  try {
    console.log("analyzeMockInsights - input:", communications?.length, "items");
    // Since communications are already filtered for the specific client, don't filter again
    const items = normalizeCommunications(communications);
    console.log("analyzeMockInsights - normalized items:", items?.length);
    const summary = generateClientSummary(items);
    const lastInteraction = identifyLastInteraction(items);
    const recommendedActions = suggestNextBestActions({ communications: items });
    const highlights = extractClientHighlights(items);
    const meetingInsights = generateMeetingInsights(items);
    return { summary, lastInteraction, recommendedActions, highlights, meetingInsights };
  } catch (error) {
    console.log("analyzeMockInsights - error:", error);
    return {
      summary: { text: "No summary available.", topics: [], sentiment: "neutral", frequencyPerWeek: 0 },
      lastInteraction: null,
      recommendedActions: [
        { id: "nba-fallback", title: "Follow up with client", rationale: "General check-in.", priority: "low" },
      ],
      highlights: [{ label: "Info", value: "No highlights available" }],
    };
  }
};

// Utility function to get current AI mode
export const getCurrentAIMode = (): AIProcessingMode => {
  return aiProcessingManager?.getCurrentMode() || 'mock';
};

// Utility function to get processing manager
export const getAIProcessingManager = (): AIProcessingManager | null => {
  return aiProcessingManager;
};


