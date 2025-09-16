/**
 * AI Service Types
 * 
 * This file contains only type definitions for AI services,
 * avoiding any server-side imports that could cause browser compatibility issues.
 */

export type Insight = {
  id: string;
  type: "task" | "reminder" | "summary";
  title: string;
  detail?: string;
};

export type Communication = {
  id: string;
  type: "email" | "event" | "chat" | "meeting";
  from: string;
  subject?: string;
  body?: string;
  timestamp: string;
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

export type ClientInsights = {
  summary: {
    text: string;
    topics: string[];
    sentiment: "positive" | "neutral" | "negative";
    frequencyPerWeek: number;
  };
  lastInteraction: {
    when: string;
    type: string;
    subject: string;
    snippet: string;
  } | null;
  recommendedActions: Array<{
    id: string;
    title: string;
    rationale: string;
    priority: "high" | "medium" | "low";
  }>;
  highlights: Array<{
    label: string;
    value: string;
  }>;
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

export type EnhancedClientInsights = ClientInsights & {
  processingMetrics: {
    processingTime: number;
    method: "mock" | "nlp" | "openai";
    confidence: number;
    tokensUsed?: number;
  };
  aiMethod: "mock" | "nlp" | "openai";
};

export type AIProcessingMode = "mock" | "nlp" | "openai";
