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
  type: "email" | "call" | "meeting" | "calendar" | "teams";
  from: string;
  subject?: string;
  body?: string;
  timestamp: string;
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
