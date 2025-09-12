export type GraphUser = {
  id: string;
  displayName?: string;
  mail?: string;
  userPrincipalName?: string;
};

export type GraphEmailAddress = {
  name?: string;
  address?: string;
};

export type GraphRecipient = {
  emailAddress?: GraphEmailAddress;
};

export type GraphMailItem = {
  id: string;
  subject?: string;
  from?: GraphRecipient;
  receivedDateTime: string;
};

export type GraphDateTimeTimeZone = {
  dateTime: string;
  timeZone?: string;
};

export type GraphOrganizer = {
  emailAddress?: GraphEmailAddress;
};

export type GraphCalendarEvent = {
  id: string;
  subject?: string;
  start: GraphDateTimeTimeZone;
  end: GraphDateTimeTimeZone;
  organizer?: GraphOrganizer;
  attendees?: GraphRecipient[];
};

// AI Processing Types
export type AIProcessingMode = 'mock' | 'nlp' | 'openai';

export interface AIProcessingConfig {
  mode: AIProcessingMode;
  openaiModel?: 'gpt-3.5-turbo' | 'gpt-4' | 'gpt-4o-mini';
  timeout?: number;
  fallbackToMock?: boolean;
}

export interface ProcessingMetrics {
  processingTime: number;
  tokensUsed?: number;
  confidence?: number;
  method: AIProcessingMode;
}

// Import ClientInsights from ai-insights service for the extended type
export interface EnhancedClientInsights {
  summary: {
    text: string;
    topics: string[];
    sentiment: "positive" | "neutral" | "negative";
    frequencyPerWeek: number;
  };
  lastInteraction: {
    when: string;
    type: "email" | "event" | "chat";
    subject?: string;
    snippet?: string;
  } | null;
  recommendedActions: Array<{
    id: string;
    title: string;
    rationale: string;
    dueDate?: string;
    priority: "low" | "medium" | "high";
  }>;
  highlights: Array<{
    label: string;
    value: string;
  }>;
  processingMetrics: ProcessingMetrics;
  aiMethod: AIProcessingMode;
}

// Enhanced text analysis types
export interface EnhancedTextAnalysis {
  sentiment: {
    score: number;
    comparative: number;
    positive: string[];
    negative: string[];
    neutral: string[];
  };
  entities: {
    people: string[];
    organizations: string[];
    topics: string[];
    keywords: string[];
  };
  summary: string;
  language: string;
  readability: {
    score: number;
    level: string;
  };
}

// AI-powered insight types
export interface AIInsight {
  id: string;
  type: 'task' | 'reminder' | 'summary' | 'alert' | 'opportunity';
  title: string;
  detail: string;
  confidence: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  suggestedActions: string[];
  metadata: {
    source: string;
    timestamp: string;
    aiGenerated: boolean;
  };
}

// Communication types for AI processing
export interface Communication {
  id: string;
  type: "email" | "event" | "chat";
  from?: string;
  subject?: string;
  body?: string;
  timestamp: string; // ISO
}

export interface ClientSummary {
  text: string;
  topics: string[];
  sentiment: "positive" | "neutral" | "negative";
  frequencyPerWeek: number;
}

export interface LastInteraction {
  when: string;
  type: Communication["type"];
  subject?: string;
  snippet?: string;
}

export interface NextBestAction {
  id: string;
  title: string;
  rationale: string;
  dueDate?: string;
  priority: "low" | "medium" | "high";
}

export interface ClientHighlight {
  label: string;
  value: string;
}

export interface ClientInsights {
  summary: ClientSummary;
  lastInteraction: LastInteraction | null;
  recommendedActions: NextBestAction[];
  highlights: ClientHighlight[];
}

