/**
 * Client-side AI Service
 * 
 * This service provides AI functionality for client components by calling
 * server-side API routes. This avoids browser compatibility issues with
 * Node.js-specific libraries.
 */

import { AIProcessingMode, EnhancedClientInsights } from '@/types';

/**
 * Analyze client communications using the AI processing system
 */
export const analyzeClientCommunications = async (
  clientEmail: string,
  communications: any[],
  mode?: AIProcessingMode
): Promise<EnhancedClientInsights> => {
  try {
    const response = await fetch('/api/ai/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        clientEmail,
        communications,
        mode
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    return result.insights;

  } catch (error) {
    console.error('Client AI analysis failed:', error);
    throw error;
  }
};

/**
 * Get available AI processing modes
 */
export const getAvailableModes = async (): Promise<AIProcessingMode[]> => {
  try {
    const response = await fetch('/api/ai/modes');
    
    if (!response.ok) {
      throw new Error(`Failed to fetch available modes: ${response.statusText}`);
    }
    
    const result = await response.json();
    return result.modes;
    
  } catch (error) {
    console.error('Failed to get available modes:', error);
    // Return default modes as fallback
    return ['mock', 'nlp'];
  }
};

/**
 * Switch AI processing mode
 */
export const switchAIMode = async (mode: AIProcessingMode): Promise<void> => {
  try {
    const response = await fetch('/api/ai/mode', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ mode })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Failed to switch AI mode: ${response.statusText}`);
    }

  } catch (error) {
    console.error('Failed to switch AI mode:', error);
    throw error;
  }
};

/**
 * Get current AI processing mode
 */
export const getCurrentAIMode = async (): Promise<AIProcessingMode> => {
  try {
    const response = await fetch('/api/ai/mode');
    
    if (!response.ok) {
      throw new Error(`Failed to get current AI mode: ${response.statusText}`);
    }
    
    const result = await response.json();
    return result.mode;
    
  } catch (error) {
    console.error('Failed to get current AI mode:', error);
    // Return default mode as fallback
    return 'mock';
  }
};

/**
 * Initialize AI processing with specified mode
 */
export const initializeAIProcessing = async (mode?: AIProcessingMode): Promise<void> => {
  try {
    const response = await fetch('/api/ai/initialize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ mode })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Failed to initialize AI processing: ${response.statusText}`);
    }

  } catch (error) {
    console.error('Failed to initialize AI processing:', error);
    throw error;
  }
};
