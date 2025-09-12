/**
 * Enhanced AI Processing Service
 * 
 * This service provides advanced AI capabilities using OpenAI, sentiment analysis,
 * natural language processing, and text processing libraries.
 */

import OpenAI from 'openai';
import * as compromise from 'compromise';
import * as sentiment from 'sentiment';
import * as natural from 'natural';
import { getAIConfig, validateAIConfig } from '@/lib/ai-config';
import type { GraphMailItem, GraphCalendarEvent } from '@/types';

// Initialize AI services
const aiConfig = getAIConfig();
const configValidation = validateAIConfig(aiConfig);

// Initialize OpenAI client only if API key is available
const openai = aiConfig.openai.apiKey ? new OpenAI({
  apiKey: aiConfig.openai.apiKey,
}) : null;

// Initialize sentiment analyzer
const sentimentAnalyzer = new sentiment.SentimentAnalyzer();
const stemmer = natural.PorterStemmer;

/**
 * Enhanced text analysis result
 */
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

/**
 * AI-powered insight generation
 */
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

/**
 * Analyze text using multiple NLP techniques
 */
export async function analyzeText(text: string): Promise<EnhancedTextAnalysis> {
  try {
    if (!text || text.trim().length === 0) {
      return getDefaultAnalysis();
    }

    // Sentiment analysis
    const sentimentResult = sentimentAnalyzer.analyze(text);
    
    // Entity extraction using compromise
    const doc = compromise(text);
    const people = doc.people().out('array');
    const organizations = doc.organizations().out('array');
    
    // Topic extraction using natural language processing
    const topics = extractTopics(text);
    const keywords = extractKeywords(text);
    
    // Language detection
    const language = detectLanguage(text);
    
    // Readability analysis
    const readability = analyzeReadability(text);
    
    // Generate summary using AI if available, otherwise use extractive summarization
    let summary = '';
    if (openai && aiConfig.features.aiSummaryEnabled) {
      summary = await generateAISummary(text);
    } else {
      summary = generateExtractiveSummary(text);
    }

    return {
      sentiment: sentimentResult,
      entities: {
        people,
        organizations,
        topics,
        keywords,
      },
      summary,
      language,
      readability,
    };
  } catch (error) {
    console.error('Error in text analysis:', error);
    return getDefaultAnalysis();
  }
}

/**
 * Generate AI-powered insights from emails and calendar events
 */
export async function generateAIInsights(
  emails: GraphMailItem[],
  events: GraphCalendarEvent[]
): Promise<AIInsight[]> {
  const insights: AIInsight[] = [];
  
  try {
    if (!configValidation.isValid) {
      console.warn('AI configuration is invalid:', configValidation.errors);
      return getFallbackInsights();
    }

    // Process emails for insights
    for (const email of emails.slice(0, 10)) { // Limit to prevent API overuse
      const emailText = `${email.subject || ''} ${email.bodyPreview || ''}`;
      const analysis = await analyzeText(emailText);
      
      // Generate insights based on analysis
      const emailInsights = await generateEmailInsights(email, analysis);
      insights.push(...emailInsights);
    }

    // Process calendar events for insights
    for (const event of events.slice(0, 5)) {
      const eventText = `${event.subject || ''} ${event.bodyPreview || ''}`;
      const analysis = await analyzeText(eventText);
      
      const eventInsights = await generateEventInsights(event, analysis);
      insights.push(...eventInsights);
    }

    // Sort by priority and confidence
    return insights
      .sort((a, b) => {
        const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority] || b.confidence - a.confidence;
      })
      .slice(0, 10); // Limit total insights

  } catch (error) {
    console.error('Error generating AI insights:', error);
    return getFallbackInsights();
  }
}

/**
 * Generate insights specific to email content
 */
async function generateEmailInsights(
  email: GraphMailItem,
  analysis: EnhancedTextAnalysis
): Promise<AIInsight[]> {
  const insights: AIInsight[] = [];
  
  // Urgent sentiment detection
  if (analysis.sentiment.comparative < -0.5) {
    insights.push({
      id: `urgent-${email.id}`,
      type: 'alert',
      title: 'Urgent: Negative Sentiment Detected',
      detail: `Email from ${email.from?.emailAddress?.name} shows concerning sentiment. Immediate attention recommended.`,
      confidence: Math.abs(analysis.sentiment.comparative),
      priority: 'urgent',
      suggestedActions: ['Schedule immediate follow-up call', 'Review client relationship status'],
      metadata: {
        source: 'email',
        timestamp: email.receivedDateTime,
        aiGenerated: true,
      },
    });
  }

  // Action items detection
  const actionKeywords = ['action required', 'please review', 'approval needed', 'deadline', 'urgent'];
  const hasActionItems = actionKeywords.some(keyword => 
    email.subject?.toLowerCase().includes(keyword) || 
    email.bodyPreview?.toLowerCase().includes(keyword)
  );

  if (hasActionItems) {
    insights.push({
      id: `action-${email.id}`,
      type: 'task',
      title: 'Action Item Detected',
      detail: `Email requires action: ${email.subject}`,
      confidence: 0.8,
      priority: 'high',
      suggestedActions: ['Review email content', 'Schedule response', 'Add to task list'],
      metadata: {
        source: 'email',
        timestamp: email.receivedDateTime,
        aiGenerated: true,
      },
    });
  }

  // Topic-based insights
  if (analysis.entities.topics.includes('meeting')) {
    insights.push({
      id: `meeting-${email.id}`,
      type: 'reminder',
      title: 'Meeting Discussion',
      detail: `Email discusses meeting arrangements or follow-ups`,
      confidence: 0.7,
      priority: 'medium',
      suggestedActions: ['Check calendar for related events', 'Prepare meeting materials'],
      metadata: {
        source: 'email',
        timestamp: email.receivedDateTime,
        aiGenerated: true,
      },
    });
  }

  return insights;
}

/**
 * Generate insights specific to calendar events
 */
async function generateEventInsights(
  event: GraphCalendarEvent,
  analysis: EnhancedTextAnalysis
): Promise<AIInsight[]> {
  const insights: AIInsight[] = [];
  
  // Upcoming important meetings
  const eventDate = new Date(event.start.dateTime);
  const now = new Date();
  const hoursUntilEvent = (eventDate.getTime() - now.getTime()) / (1000 * 60 * 60);

  if (hoursUntilEvent > 0 && hoursUntilEvent < 24) {
    insights.push({
      id: `upcoming-${event.id}`,
      type: 'reminder',
      title: 'Upcoming Meeting Tomorrow',
      detail: `Meeting "${event.subject}" is scheduled for tomorrow`,
      confidence: 1.0,
      priority: 'high',
      suggestedActions: ['Review meeting agenda', 'Prepare materials', 'Confirm attendance'],
      metadata: {
        source: 'calendar',
        timestamp: event.start.dateTime,
        aiGenerated: true,
      },
    });
  }

  // Meeting preparation based on content
  if (analysis.entities.topics.includes('presentation') || analysis.entities.topics.includes('review')) {
    insights.push({
      id: `prep-${event.id}`,
      type: 'task',
      title: 'Meeting Preparation Required',
      detail: `Meeting "${event.subject}" may require preparation based on content analysis`,
      confidence: 0.6,
      priority: 'medium',
      suggestedActions: ['Prepare presentation materials', 'Review relevant documents'],
      metadata: {
        source: 'calendar',
        timestamp: event.start.dateTime,
        aiGenerated: true,
      },
    });
  }

  return insights;
}

/**
 * Generate AI summary using OpenAI
 */
async function generateAISummary(text: string): Promise<string> {
  if (!openai || text.length < 100) {
    return generateExtractiveSummary(text);
  }

  try {
    const response = await openai.chat.completions.create({
      model: aiConfig.openai.model,
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that creates concise, professional summaries of business communications. Focus on key points, action items, and important details.',
        },
        {
          role: 'user',
          content: `Please provide a brief summary of the following text:\n\n${text}`,
        },
      ],
      max_tokens: Math.min(aiConfig.openai.maxTokens, 500),
      temperature: aiConfig.openai.temperature,
    });

    return response.choices[0]?.message?.content || generateExtractiveSummary(text);
  } catch (error) {
    console.error('Error generating AI summary:', error);
    return generateExtractiveSummary(text);
  }
}

/**
 * Generate extractive summary (fallback when AI is not available)
 */
function generateExtractiveSummary(text: string): string {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);
  const summary = sentences.slice(0, 2).join('. ');
  return summary.length > 0 ? summary + '.' : 'No summary available.';
}

/**
 * Extract topics from text
 */
function extractTopics(text: string): string[] {
  const topics: string[] = [];
  
  // Financial topics
  if (/\b(portfolio|investment|stocks|bonds|funds|retirement|financial)\b/i.test(text)) {
    topics.push('finance');
  }
  
  // Meeting topics
  if (/\b(meeting|call|schedule|appointment|conference)\b/i.test(text)) {
    topics.push('meeting');
  }
  
  // Project topics
  if (/\b(project|deliverable|milestone|deadline|task)\b/i.test(text)) {
    topics.push('project');
  }
  
  // Client topics
  if (/\b(client|customer|account|relationship)\b/i.test(text)) {
    topics.push('client');
  }

  return topics;
}

/**
 * Extract keywords from text
 */
function extractKeywords(text: string): string[] {
  // Simple keyword extraction using natural language processing
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3);
  
  // Remove common stop words
  const stopWords = new Set(['this', 'that', 'with', 'have', 'will', 'from', 'they', 'know', 'want', 'been', 'good', 'much', 'some', 'time', 'very', 'when', 'come', 'here', 'just', 'like', 'long', 'make', 'many', 'over', 'such', 'take', 'than', 'them', 'well', 'were']);
  
  const filteredWords = words.filter(word => !stopWords.has(word));
  
  // Count word frequency and return top keywords
  const wordCount: Record<string, number> = {};
  filteredWords.forEach(word => {
    wordCount[word] = (wordCount[word] || 0) + 1;
  });
  
  return Object.entries(wordCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([word]) => word);
}

/**
 * Detect language of text
 */
function detectLanguage(text: string): string {
  // Simple language detection based on common words
  const englishWords = /\b(the|and|or|but|in|on|at|to|for|of|with|by)\b/gi;
  const spanishWords = /\b(el|la|de|que|y|en|un|es|se|no|te|lo|le|da|su|por|son|con|para|al|del|los|las)\b/gi;
  
  const englishMatches = text.match(englishWords)?.length || 0;
  const spanishMatches = text.match(spanishWords)?.length || 0;
  
  if (spanishMatches > englishMatches && spanishMatches > 5) {
    return 'es';
  }
  
  return 'en'; // Default to English
}

/**
 * Analyze readability of text
 */
function analyzeReadability(text: string): { score: number; level: string } {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const words = text.split(/\s+/).filter(w => w.length > 0);
  const syllables = words.reduce((total, word) => total + countSyllables(word), 0);
  
  if (sentences.length === 0 || words.length === 0) {
    return { score: 0, level: 'Unknown' };
  }
  
  // Simple Flesch Reading Ease formula
  const score = 206.835 - (1.015 * (words.length / sentences.length)) - (84.6 * (syllables / words.length));
  
  let level = 'College';
  if (score >= 90) level = 'Very Easy';
  else if (score >= 80) level = 'Easy';
  else if (score >= 70) level = 'Fairly Easy';
  else if (score >= 60) level = 'Standard';
  else if (score >= 50) level = 'Fairly Difficult';
  else if (score >= 30) level = 'Difficult';
  else if (score >= 0) level = 'Very Difficult';
  
  return { score: Math.max(0, Math.min(100, score)), level };
}

/**
 * Count syllables in a word
 */
function countSyllables(word: string): number {
  word = word.toLowerCase();
  if (word.length <= 3) return 1;
  
  const vowels = 'aeiouy';
  let count = 0;
  let previousWasVowel = false;
  
  for (let i = 0; i < word.length; i++) {
    const isVowel = vowels.includes(word[i]);
    if (isVowel && !previousWasVowel) {
      count++;
    }
    previousWasVowel = isVowel;
  }
  
  // Handle silent 'e'
  if (word.endsWith('e')) count--;
  
  return Math.max(1, count);
}

/**
 * Get default analysis for empty or error cases
 */
function getDefaultAnalysis(): EnhancedTextAnalysis {
  return {
    sentiment: { score: 0, comparative: 0, positive: [], negative: [], neutral: [] },
    entities: { people: [], organizations: [], topics: [], keywords: [] },
    summary: 'No analysis available.',
    language: 'en',
    readability: { score: 0, level: 'Unknown' },
  };
}

/**
 * Get fallback insights when AI processing fails
 */
function getFallbackInsights(): AIInsight[] {
  return [
    {
      id: 'fallback-1',
      type: 'summary',
      title: 'AI Processing Unavailable',
      detail: 'AI insights are temporarily unavailable. Please check your configuration.',
      confidence: 1.0,
      priority: 'low',
      suggestedActions: ['Check API configuration', 'Review error logs'],
      metadata: {
        source: 'system',
        timestamp: new Date().toISOString(),
        aiGenerated: false,
      },
    },
  ];
}

export default {
  analyzeText,
  generateAIInsights,
  getAIConfig,
  validateAIConfig,
};
