/**
 * Server-only AI Services
 * 
 * This module contains server-side AI processing functions that should only
 * be used in API routes or server components. It avoids browser compatibility
 * issues with Node.js-specific libraries.
 */

// Re-export server-side functions from ai-insights
export { 
  analyzeClientCommunications as analyzeClientCommunicationsServer,
  initializeAIProcessing,
  switchAIMode as switchAIModeServer,
  getCurrentAIMode as getCurrentAIModeServer,
  getAIProcessingManager,
  analyzeMockInsights
} from './ai-insights';

// Re-export types
export type { 
  ClientInsights, 
  Communication,
  EnhancedClientInsights 
} from './ai-insights';

export type { AIProcessingMode } from '@/types';
