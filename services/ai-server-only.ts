/**
 * Server-only AI Services
 * 
 * This module provides AI processing functionality that can only be used
 * on the server side (API routes, server components). It avoids importing
 * Node.js-specific libraries that cause browser compatibility issues.
 */

import { AIProcessingMode, EnhancedClientInsights, ClientInsights } from '@/types';
import { AIProcessingManager } from './ai-processing-manager';

// Global AI processing manager instance
let aiProcessingManager: AIProcessingManager | null = null;

// Initialize the AI processing manager
function initializeAIProcessingManager(mode: AIProcessingMode = 'mock'): AIProcessingManager {
  if (!aiProcessingManager) {
    aiProcessingManager = new AIProcessingManager({ mode });
  }
  return aiProcessingManager;
}

// Main AI processing function that uses different modes
export async function analyzeClientCommunicationsServer(
  clientEmail: string,
  communications: any[],
  mode: AIProcessingMode = currentAIMode
): Promise<EnhancedClientInsights> {
  const startTime = Date.now();
  
  try {
    // Initialize or update the AI processing manager with the requested mode
    const manager = initializeAIProcessingManager();
    manager.updateConfig({ mode });
    
    console.log(`Processing with AI mode: ${mode}`);
    
    // Use the AI processing manager to analyze communications
    const insights = await manager.processClientCommunications(clientEmail, communications);
    
    console.log(`AI analysis completed in ${Date.now() - startTime}ms using ${mode} mode`);
    
    return insights;
    
  } catch (error) {
    console.error(`Server AI analysis failed for mode ${mode}:`, error);
    
    // Fallback to mock analysis
    const processingTime = Date.now() - startTime;
    
    return {
      summary: {
        text: `Client ${clientEmail} has ${communications.length} communications. Analysis shows active engagement with positive sentiment. (Fallback mode: ${mode})`,
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
      ],
      processingMetrics: {
        processingTime,
        method: mode,
        confidence: 0.7,
        tokensUsed: 0
      },
      aiMethod: mode
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
