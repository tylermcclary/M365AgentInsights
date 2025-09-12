import { AIProcessingManager } from './ai-processing-manager';
import { AIProcessingConfig, AIProcessingMode } from '@/types';
import { getAIConfig } from '@/lib/ai-config';

/**
 * Factory function to create AI processing managers with different configurations
 */

/**
 * Create an AI processing manager with OpenAI capabilities
 */
export function createOpenAIProcessor(config?: Partial<AIProcessingConfig>): AIProcessingManager {
  const aiConfig = getAIConfig();
  
  const defaultConfig: AIProcessingConfig = {
    mode: 'openai',
    openaiModel: aiConfig.openai.model as 'gpt-3.5-turbo' | 'gpt-4' | 'gpt-4o-mini',
    timeout: 30000,
    fallbackToMock: true,
    ...config
  };

  return new AIProcessingManager(defaultConfig);
}

/**
 * Create an AI processing manager with local NLP capabilities only
 */
export function createLocalNLPProcessor(config?: Partial<AIProcessingConfig>): AIProcessingManager {
  const defaultConfig: AIProcessingConfig = {
    mode: 'nlp',
    timeout: 10000,
    fallbackToMock: true,
    ...config
  };

  return new AIProcessingManager(defaultConfig);
}

/**
 * Create an AI processing manager with mock/rule-based capabilities only
 */
export function createMockProcessor(config?: Partial<AIProcessingConfig>): AIProcessingManager {
  const defaultConfig: AIProcessingConfig = {
    mode: 'mock',
    timeout: 1000,
    fallbackToMock: false,
    ...config
  };

  return new AIProcessingManager(defaultConfig);
}

/**
 * Create an AI processing manager based on environment configuration
 * Automatically chooses the best available mode
 */
export function createAutoProcessor(config?: Partial<AIProcessingConfig>): AIProcessingManager {
  const aiConfig = getAIConfig();
  
  let mode: AIProcessingMode = 'mock';
  
  // Check if OpenAI is available
  if (aiConfig.openai.apiKey && aiConfig.features.aiInsightsEnabled) {
    mode = 'openai';
  }
  // Check if local NLP is available
  else if (aiConfig.nlp.sentimentAnalysisEnabled || aiConfig.nlp.topicExtractionEnabled) {
    mode = 'nlp';
  }
  
  const defaultConfig: AIProcessingConfig = {
    mode,
    openaiModel: aiConfig.openai.model as 'gpt-3.5-turbo' | 'gpt-4' | 'gpt-4o-mini',
    timeout: mode === 'openai' ? 30000 : mode === 'nlp' ? 10000 : 1000,
    fallbackToMock: mode !== 'mock',
    ...config
  };

  return new AIProcessingManager(defaultConfig);
}

/**
 * Get the recommended AI processing mode based on available resources
 */
export function getRecommendedMode(): AIProcessingMode {
  const aiConfig = getAIConfig();
  
  if (aiConfig.openai.apiKey && aiConfig.features.aiInsightsEnabled) {
    return 'openai';
  }
  
  if (aiConfig.nlp.sentimentAnalysisEnabled || aiConfig.nlp.topicExtractionEnabled) {
    return 'nlp';
  }
  
  return 'mock';
}

/**
 * Check if a specific AI processing mode is available
 */
export function isModeAvailable(mode: AIProcessingMode): boolean {
  const aiConfig = getAIConfig();
  
  switch (mode) {
    case 'openai':
      return !!(aiConfig.openai.apiKey && aiConfig.features.aiInsightsEnabled);
    case 'nlp':
      return !!(aiConfig.nlp.sentimentAnalysisEnabled || aiConfig.nlp.topicExtractionEnabled);
    case 'mock':
      return true; // Mock is always available
    default:
      return false;
  }
}

/**
 * Get available AI processing modes
 */
export function getAvailableModes(): AIProcessingMode[] {
  const modes: AIProcessingMode[] = [];
  
  if (isModeAvailable('openai')) modes.push('openai');
  if (isModeAvailable('nlp')) modes.push('nlp');
  modes.push('mock'); // Mock is always available
  
  return modes;
}

export default {
  createOpenAIProcessor,
  createLocalNLPProcessor,
  createMockProcessor,
  createAutoProcessor,
  getRecommendedMode,
  isModeAvailable,
  getAvailableModes
};
