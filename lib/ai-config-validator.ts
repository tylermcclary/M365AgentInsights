/**
 * AI Configuration Validator
 * 
 * This utility provides runtime validation and health checks for the AI configuration system.
 * It can be used to verify configuration before starting the application or during runtime.
 */

import { AI_CONFIG, validateAIConfig, getAvailableModes, getConfigSummary } from './ai-config';

/**
 * Validates the AI configuration and returns detailed results
 */
export const validateAIConfiguration = () => {
  console.group('🔍 AI Configuration Validation');
  
  const validation = validateAIConfig();
  const availableModes = getAvailableModes();
  const summary = getConfigSummary();
  
  console.log('📋 Configuration Summary:');
  console.log('  Default Mode:', AI_CONFIG.DEFAULT_MODE);
  console.log('  Available Modes:', availableModes.join(', '));
  console.log('  OpenAI Enabled:', AI_CONFIG.OPENAI_ENABLED);
  console.log('  NLP Enabled:', AI_CONFIG.NLP_ENABLED);
  console.log('  Fallback Enabled:', AI_CONFIG.FALLBACK_TO_MOCK);
  console.log('  Timeout:', AI_CONFIG.TIMEOUT_MS + 'ms');
  console.log('  Max Retries:', AI_CONFIG.MAX_RETRIES);
  
  if (validation.isValid) {
    console.log('✅ Configuration is valid');
  } else {
    console.error('❌ Configuration has errors:');
    validation.errors.forEach(error => console.error('  -', error));
  }
  
  if (validation.warnings.length > 0) {
    console.warn('⚠️ Configuration warnings:');
    validation.warnings.forEach(warning => console.warn('  -', warning));
  }
  
  console.groupEnd();
  
  return {
    isValid: validation.isValid,
    errors: validation.errors,
    warnings: validation.warnings,
    availableModes,
    summary
  };
};

/**
 * Performs a health check on the AI processing system
 */
export const performAIHealthCheck = async () => {
  console.group('🏥 AI System Health Check');
  
  try {
    // Check configuration
    const configValidation = validateAIConfiguration();
    
    if (!configValidation.isValid) {
      console.error('❌ Health check failed: Configuration errors detected');
      return { healthy: false, issues: configValidation.errors };
    }
    
    // Check environment variables
    const envChecks = {
      openaiApiKey: !!process.env.OPENAI_API_KEY,
      nodeEnv: !!process.env.NODE_ENV,
      defaultMode: !!process.env.NEXT_PUBLIC_DEFAULT_AI_MODE
    };
    
    console.log('🔧 Environment Variables:');
    console.log('  OpenAI API Key:', envChecks.openaiApiKey ? '✅ Present' : '❌ Missing');
    console.log('  Node Environment:', envChecks.nodeEnv ? '✅ Set' : '⚠️ Not set');
    console.log('  Default AI Mode:', envChecks.defaultMode ? '✅ Custom' : '✅ Default');
    
    // Check available processing modes
    const availableModes = getAvailableModes();
    console.log('🤖 Available Processing Modes:', availableModes.length);
    availableModes.forEach(mode => {
      console.log(`  - ${mode}: ✅ Available`);
    });
    
    // Check if at least one non-mock mode is available
    const hasAdvancedMode = availableModes.some(mode => mode !== 'mock');
    if (!hasAdvancedMode) {
      console.warn('⚠️ Only mock mode available - consider enabling OpenAI or NLP for enhanced capabilities');
    }
    
    console.log('✅ AI System Health Check completed successfully');
    console.groupEnd();
    
    return {
      healthy: true,
      availableModes,
      hasAdvancedMode,
      configValidation
    };
    
  } catch (error) {
    console.error('❌ Health check failed:', error);
    console.groupEnd();
    return {
      healthy: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
};

/**
 * Provides recommendations for improving AI configuration
 */
export const getConfigurationRecommendations = () => {
  const recommendations: string[] = [];
  const availableModes = getAvailableModes();
  
  if (!AI_CONFIG.OPENAI_ENABLED) {
    recommendations.push('Add OPENAI_API_KEY to enable advanced AI processing with GPT models');
  }
  
  if (AI_CONFIG.TIMEOUT_MS < 5000) {
    recommendations.push('Consider increasing AI_TIMEOUT_MS for better reliability with slower networks');
  }
  
  if (AI_CONFIG.MAX_RETRIES < 2) {
    recommendations.push('Consider increasing AI_MAX_RETRIES for better fault tolerance');
  }
  
  if (availableModes.length === 1 && availableModes[0] === 'mock') {
    recommendations.push('Enable at least one advanced AI mode (OpenAI or NLP) for production use');
  }
  
  if (!AI_CONFIG.ENABLE_CACHING) {
    recommendations.push('Consider enabling AI_ENABLE_CACHING to improve performance for repeated analyses');
  }
  
  if (AI_CONFIG.DEBUG_MODE && process.env.NODE_ENV === 'production') {
    recommendations.push('Disable debug mode in production for better performance');
  }
  
  return recommendations;
};

/**
 * Logs configuration recommendations
 */
export const logConfigurationRecommendations = () => {
  const recommendations = getConfigurationRecommendations();
  
  if (recommendations.length === 0) {
    console.log('✅ No configuration recommendations - your setup looks good!');
    return;
  }
  
  console.group('💡 Configuration Recommendations');
  recommendations.forEach((rec, index) => {
    console.log(`${index + 1}. ${rec}`);
  });
  console.groupEnd();
};

/**
 * Exports configuration for external tools or documentation
 */
export const exportConfiguration = () => {
  return {
    config: AI_CONFIG,
    validation: validateAIConfig(),
    availableModes: getAvailableModes(),
    summary: getConfigSummary(),
    recommendations: getConfigurationRecommendations()
  };
};

export default {
  validateAIConfiguration,
  performAIHealthCheck,
  getConfigurationRecommendations,
  logConfigurationRecommendations,
  exportConfiguration
};
