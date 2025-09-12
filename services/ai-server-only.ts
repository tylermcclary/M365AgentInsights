/**
 * Server-only AI Services
 * 
 * This module provides AI processing functionality that can only be used
 * on the server side (API routes, server components). It avoids importing
 * Node.js-specific libraries that cause browser compatibility issues.
 */

import { AIProcessingMode, EnhancedClientInsights, ClientInsights } from '@/types';

// Mock AI processing function for server-side use
export async function analyzeClientCommunicationsServer(
  clientEmail: string,
  communications: any[]
): Promise<EnhancedClientInsights> {
  const startTime = Date.now();
  
  try {
    // Simple mock analysis for now
    const mockInsights: ClientInsights = {
      summary: {
        text: `Client ${clientEmail} has ${communications.length} communications. Analysis shows active engagement with positive sentiment.`,
        topics: ['portfolio', 'meeting', 'performance'],
        sentiment: 'positive',
        frequencyPerWeek: communications.length > 5 ? 2.5 : 1.0
      },
      lastInteraction: communications.length > 0 ? {
        when: communications[0].timestamp || new Date().toISOString(),
        type: 'email',
        subject: communications[0].subject || 'Recent communication',
        snippet: communications[0].body?.substring(0, 100) || 'No content available'
      } : null,
      recommendedActions: [
        {
          id: 'action-1',
          title: 'Schedule follow-up meeting',
          rationale: 'Client engagement detected',
          priority: 'medium'
        }
      ],
      highlights: [
        {
          label: 'Engagement Level',
          value: 'Active'
        },
        {
          label: 'Communication Frequency',
          value: `${communications.length} recent interactions`
        }
      ]
    };
    
    const processingTime = Date.now() - startTime;
    
    return {
      ...mockInsights,
      processingMetrics: {
        processingTime,
        method: 'mock',
        confidence: 0.7,
        tokensUsed: 0
      },
      aiMethod: 'mock'
    };
    
  } catch (error) {
    console.error('Server AI analysis failed:', error);
    
    // Fallback response
    const processingTime = Date.now() - startTime;
    
    return {
      summary: {
        text: 'AI analysis temporarily unavailable. Using basic insights.',
        topics: [],
        sentiment: 'neutral',
        frequencyPerWeek: 0
      },
      lastInteraction: null,
      recommendedActions: [
        {
          id: 'fallback-1',
          title: 'Manual review recommended',
          rationale: 'AI analysis unavailable',
          priority: 'low'
        }
      ],
      highlights: [
        {
          label: 'Status',
          value: 'Analysis unavailable'
        }
      ],
      processingMetrics: {
        processingTime,
        method: 'mock',
        confidence: 0.3,
        tokensUsed: 0
      },
      aiMethod: 'mock'
    };
  }
}

// Mock AI mode management
let currentAIMode: AIProcessingMode = 'mock';

export function switchAIModeServer(mode: AIProcessingMode): void {
  currentAIMode = mode;
  console.log(`AI mode switched to: ${mode}`);
}

export function getCurrentAIModeServer(): AIProcessingMode {
  return currentAIMode;
}

export function initializeAIProcessingServer(mode?: AIProcessingMode): void {
  if (mode) {
    currentAIMode = mode;
  }
  console.log(`AI processing initialized with mode: ${currentAIMode}`);
}

// Mock processing manager
export function getAIProcessingManagerServer() {
  return {
    getCurrentMode: () => currentAIMode,
    updateConfig: (config: any) => {
      if (config.mode) {
        currentAIMode = config.mode;
      }
    }
  };
}
