import { AIProcessingMode, AIProcessingConfig } from '@/types';

/**
 * AI Configuration System
 * 
 * This module provides centralized configuration management for the AI processing system.
 * It handles environment variables, validation, and provides utility functions for
 * determining available AI modes and capabilities.
 */

export const AI_CONFIG = {
  // Default AI processing mode (can be overridden via environment variable)
  DEFAULT_MODE: (process.env.NEXT_PUBLIC_DEFAULT_AI_MODE as AIProcessingMode) || 'mock',
  
  // OpenAI configuration
  OPENAI_ENABLED: !!process.env.OPENAI_API_KEY,
  OPENAI_MODEL: process.env.OPENAI_MODEL || 'gpt-4o-mini',
  OPENAI_MAX_TOKENS: parseInt(process.env.OPENAI_MAX_TOKENS || '2000'),
  OPENAI_TEMPERATURE: parseFloat(process.env.OPENAI_TEMPERATURE || '0.7'),
  
  // NLP configuration
  NLP_ENABLED: true, // Local NLP is always available
  SENTIMENT_ANALYSIS_ENABLED: process.env.SENTIMENT_ANALYSIS_ENABLED !== 'false',
  TOPIC_EXTRACTION_ENABLED: process.env.TOPIC_EXTRACTION_ENABLED !== 'false',
  LANGUAGE_DETECTION_ENABLED: process.env.LANGUAGE_DETECTION_ENABLED !== 'false',
  
  // Processing configuration
  FALLBACK_TO_MOCK: process.env.AI_FALLBACK_TO_MOCK !== 'false',
  TIMEOUT_MS: parseInt(process.env.AI_TIMEOUT_MS || '15000'),
  MAX_RETRIES: parseInt(process.env.AI_MAX_RETRIES || '2'),
  
  // Performance configuration
  ENABLE_CACHING: process.env.AI_ENABLE_CACHING === 'true',
  CACHE_TTL_MS: parseInt(process.env.AI_CACHE_TTL_MS || '300000'), // 5 minutes
  
  // Debug configuration
  DEBUG_MODE: process.env.NODE_ENV === 'development',
  VERBOSE_LOGGING: process.env.AI_VERBOSE_LOGGING === 'true'
};

/**
 * Validates if an AI processing mode is available and properly configured
 */
export const validateAIMode = (mode: AIProcessingMode): boolean => {
  switch (mode) {
    case 'openai':
      if (!AI_CONFIG.OPENAI_ENABLED) {
        console.warn('OpenAI mode requested but no API key configured');
        return false;
      }
      return true;
      
    case 'nlp':
      if (!AI_CONFIG.NLP_ENABLED) {
        console.warn('NLP mode requested but local NLP processing is disabled');
        return false;
      }
      return true;
      
    case 'mock':
      return true; // Mock mode is always available
      
    default:
      console.warn(`Unknown AI mode requested: ${mode}`);
      return false;
  }
};

/**
 * Returns an array of available AI processing modes based on current configuration
 */
export const getAvailableModes = (): AIProcessingMode[] => {
  const modes: AIProcessingMode[] = ['mock']; // Mock is always available
  
  if (AI_CONFIG.NLP_ENABLED) {
    modes.push('nlp');
  }
  
  if (AI_CONFIG.OPENAI_ENABLED) {
    modes.push('openai');
  }
  
  return modes;
};

/**
 * Gets the best available AI mode based on configuration and preferences
 */
export const getBestAvailableMode = (preferredMode?: AIProcessingMode): AIProcessingMode => {
  const availableModes = getAvailableModes();
  
  // If preferred mode is available, use it
  if (preferredMode && availableModes.includes(preferredMode)) {
    return preferredMode;
  }
  
  // Fallback hierarchy: openai -> nlp -> mock
  if (availableModes.includes('openai')) return 'openai';
  if (availableModes.includes('nlp')) return 'nlp';
  return 'mock';
};

/**
 * Validates the entire AI configuration
 */
export const validateAIConfig = (): { isValid: boolean; errors: string[]; warnings: string[] } => {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Check OpenAI configuration
  if (AI_CONFIG.OPENAI_ENABLED) {
    if (!process.env.OPENAI_API_KEY) {
      errors.push('OpenAI enabled but no API key provided');
    }
    if (AI_CONFIG.OPENAI_MAX_TOKENS < 100 || AI_CONFIG.OPENAI_MAX_TOKENS > 4000) {
      warnings.push(`OpenAI max tokens (${AI_CONFIG.OPENAI_MAX_TOKENS}) should be between 100 and 4000`);
    }
    if (AI_CONFIG.OPENAI_TEMPERATURE < 0 || AI_CONFIG.OPENAI_TEMPERATURE > 2) {
      warnings.push(`OpenAI temperature (${AI_CONFIG.OPENAI_TEMPERATURE}) should be between 0 and 2`);
    }
  }
  
  // Check timeout configuration
  if (AI_CONFIG.TIMEOUT_MS < 1000) {
    warnings.push(`AI timeout (${AI_CONFIG.TIMEOUT_MS}ms) is very low, may cause premature failures`);
  }
  
  // Check retry configuration
  if (AI_CONFIG.MAX_RETRIES < 0 || AI_CONFIG.MAX_RETRIES > 5) {
    warnings.push(`Max retries (${AI_CONFIG.MAX_RETRIES}) should be between 0 and 5`);
  }
  
  // Check available modes
  const availableModes = getAvailableModes();
  if (availableModes.length === 1 && availableModes[0] === 'mock') {
    warnings.push('Only mock AI mode is available - consider enabling OpenAI or NLP for enhanced capabilities');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Gets configuration summary for debugging/logging
 */
export const getConfigSummary = () => {
  const validation = validateAIConfig();
  const availableModes = getAvailableModes();
  
  return {
    defaultMode: AI_CONFIG.DEFAULT_MODE,
    availableModes,
    openaiEnabled: AI_CONFIG.OPENAI_ENABLED,
    nlpEnabled: AI_CONFIG.NLP_ENABLED,
    fallbackEnabled: AI_CONFIG.FALLBACK_TO_MOCK,
    timeoutMs: AI_CONFIG.TIMEOUT_MS,
    maxRetries: AI_CONFIG.MAX_RETRIES,
    cachingEnabled: AI_CONFIG.ENABLE_CACHING,
    debugMode: AI_CONFIG.DEBUG_MODE,
    validation
  };
};

/**
 * Logs the current AI configuration (useful for debugging)
 */
export const logAIConfig = () => {
  if (!AI_CONFIG.DEBUG_MODE) return;
  
  const summary = getConfigSummary();
  console.group('🤖 AI Configuration Summary');
  console.log('Default Mode:', summary.defaultMode);
  console.log('Available Modes:', summary.availableModes.join(', '));
  console.log('OpenAI Enabled:', summary.openaiEnabled);
  console.log('NLP Enabled:', summary.nlpEnabled);
  console.log('Fallback Enabled:', summary.fallbackEnabled);
  console.log('Timeout:', summary.timeoutMs + 'ms');
  console.log('Max Retries:', summary.maxRetries);
  console.log('Caching:', summary.cachingEnabled ? 'Enabled' : 'Disabled');
  
  if (summary.validation.errors.length > 0) {
    console.error('❌ Configuration Errors:', summary.validation.errors);
  }
  
  if (summary.validation.warnings.length > 0) {
    console.warn('⚠️ Configuration Warnings:', summary.validation.warnings);
  }
  
  console.groupEnd();
};

/**
 * Creates a safe AI processing configuration with validation
 */
export const createSafeAIConfig = (userConfig?: Partial<ExtendedAIProcessingConfig>): ExtendedAIProcessingConfig => {
  const config = {
    mode: AI_CONFIG.DEFAULT_MODE,
    fallbackToMock: AI_CONFIG.FALLBACK_TO_MOCK,
    timeout: AI_CONFIG.TIMEOUT_MS,
    maxRetries: AI_CONFIG.MAX_RETRIES,
    ...userConfig
  };
  
  // Validate and fix the mode
  if (!validateAIMode(config.mode)) {
    console.warn(`Invalid AI mode '${config.mode}', falling back to best available mode`);
    config.mode = getBestAvailableMode();
  }
  
  // Validate timeout
  if (config.timeout && (config.timeout < 1000 || config.timeout > 60000)) {
    console.warn(`Invalid timeout ${config.timeout}ms, using default ${AI_CONFIG.TIMEOUT_MS}ms`);
    config.timeout = AI_CONFIG.TIMEOUT_MS;
  }
  
  // Validate max retries
  if (config.maxRetries && (config.maxRetries < 0 || config.maxRetries > 5)) {
    console.warn(`Invalid max retries ${config.maxRetries}, using default ${AI_CONFIG.MAX_RETRIES}`);
    config.maxRetries = AI_CONFIG.MAX_RETRIES;
  }
  
  return config;
};

// Extend the existing type with additional properties
export interface ExtendedAIProcessingConfig extends AIProcessingConfig {
  maxRetries?: number;
}

export default {
  AI_CONFIG,
  validateAIMode,
  getAvailableModes,
  getBestAvailableMode,
  validateAIConfig,
  getConfigSummary,
  logAIConfig,
  createSafeAIConfig
};