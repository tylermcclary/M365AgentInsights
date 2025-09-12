# AI Configuration System Guide

## Overview

The AI Configuration System provides centralized, validated configuration management for the hybrid AI processing capabilities. It ensures reliable operation with comprehensive error handling, fallback mechanisms, and runtime validation.

## Architecture

### Core Components

1. **`lib/ai-config.ts`** - Main configuration system
2. **`lib/ai-config-validator.ts`** - Configuration validation and health checks
3. **`services/ai-processing-manager.ts`** - Updated to use configuration system
4. **`services/ai-insights.ts`** - Integration with configuration system

### Configuration Flow

```
Environment Variables → AI_CONFIG → Validation → Safe Config → AIProcessingManager
```

## Configuration Options

### Environment Variables

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `NEXT_PUBLIC_DEFAULT_AI_MODE` | Default AI processing mode | `'mock'` | `'openai'` |
| `OPENAI_API_KEY` | OpenAI API key | `undefined` | `'sk-...'` |
| `OPENAI_MODEL` | OpenAI model to use | `'gpt-4o-mini'` | `'gpt-4'` |
| `OPENAI_MAX_TOKENS` | Maximum tokens per request | `2000` | `3000` |
| `OPENAI_TEMPERATURE` | Response creativity (0-2) | `0.7` | `0.3` |
| `AI_TIMEOUT_MS` | Processing timeout | `15000` | `20000` |
| `AI_MAX_RETRIES` | Maximum retry attempts | `2` | `3` |
| `AI_FALLBACK_TO_MOCK` | Enable fallback to mock | `true` | `false` |
| `AI_ENABLE_CACHING` | Enable response caching | `false` | `true` |
| `AI_VERBOSE_LOGGING` | Enable detailed logging | `false` | `true` |

### Feature Flags

| Flag | Description | Default |
|------|-------------|---------|
| `OPENAI_ENABLED` | OpenAI processing available | Auto-detected |
| `NLP_ENABLED` | Local NLP processing available | `true` |
| `SENTIMENT_ANALYSIS_ENABLED` | Enable sentiment analysis | `true` |
| `TOPIC_EXTRACTION_ENABLED` | Enable topic extraction | `true` |
| `LANGUAGE_DETECTION_ENABLED` | Enable language detection | `true` |

## Usage Examples

### Basic Configuration

```typescript
import { AI_CONFIG, validateAIMode, getAvailableModes } from '@/lib/ai-config';

// Check available modes
const modes = getAvailableModes(); // ['mock', 'nlp', 'openai']

// Validate a mode
const isValid = validateAIMode('openai'); // true if OpenAI is configured

// Access configuration
console.log(AI_CONFIG.DEFAULT_MODE); // 'mock' or configured mode
console.log(AI_CONFIG.OPENAI_ENABLED); // true if API key is present
```

### Safe Configuration Creation

```typescript
import { createSafeAIConfig } from '@/lib/ai-config';

// Create configuration with validation and fallbacks
const config = createSafeAIConfig({
  mode: 'openai',
  timeout: 20000,
  maxRetries: 3
});

// Invalid configurations are automatically corrected
const badConfig = createSafeAIConfig({
  mode: 'invalid-mode', // Will fallback to best available
  timeout: 100, // Will be corrected to default
  maxRetries: 10 // Will be corrected to max allowed
});
```

### AI Processing Manager Integration

```typescript
import { AIProcessingManager } from '@/services/ai-processing-manager';

// Initialize with automatic configuration
const manager = new AIProcessingManager();

// Initialize with custom configuration
const customManager = new AIProcessingManager({
  mode: 'nlp',
  timeout: 10000,
  maxRetries: 1
});

// Update configuration at runtime
manager.updateConfig({ mode: 'openai' });
```

## Validation and Health Checks

### Configuration Validation

```typescript
import { validateAIConfiguration } from '@/lib/ai-config-validator';

const result = validateAIConfiguration();

if (result.isValid) {
  console.log('✅ Configuration is valid');
} else {
  console.error('❌ Configuration errors:', result.errors);
}
```

### Health Check

```typescript
import { performAIHealthCheck } from '@/lib/ai-config-validator';

const health = await performAIHealthCheck();

if (health.healthy) {
  console.log('✅ AI system is healthy');
  console.log('Available modes:', health.availableModes);
} else {
  console.error('❌ AI system has issues:', health.issues);
}
```

### Configuration Recommendations

```typescript
import { getConfigurationRecommendations, logConfigurationRecommendations } from '@/lib/ai-config-validator';

// Get recommendations
const recommendations = getConfigurationRecommendations();
console.log('Recommendations:', recommendations);

// Log recommendations to console
logConfigurationRecommendations();
```

## Error Handling

### Retry Logic

The system implements exponential backoff retry logic:

```typescript
// Configuration
const config = {
  maxRetries: 3, // Maximum retry attempts
  timeout: 15000 // Request timeout
};

// Retry behavior
// Attempt 1: Immediate
// Attempt 2: Wait 1s, then retry
// Attempt 3: Wait 2s, then retry
// Attempt 4: Wait 3s (max), then retry
```

### Fallback Strategy

```typescript
// Fallback hierarchy
try {
  // Try OpenAI
  return await processWithOpenAI();
} catch (error) {
  if (fallbackToMock) {
    // Fallback to mock
    return await processWithMock();
  }
  throw error;
}
```

### Error Types

| Error Type | Description | Handling |
|------------|-------------|----------|
| Configuration Error | Invalid configuration | Auto-correction with warnings |
| API Error | External API failure | Retry with fallback |
| Processing Error | Analysis failure | Fallback to mock |
| Validation Error | Input validation failure | Immediate failure with clear message |

## Debugging and Logging

### Debug Mode

Enable debug logging by setting `NODE_ENV=development` or `AI_VERBOSE_LOGGING=true`:

```typescript
// Debug output example
🤖 AI Configuration Summary
  Default Mode: openai
  Available Modes: mock, nlp, openai
  OpenAI Enabled: true
  NLP Enabled: true
  Fallback Enabled: true
  Timeout: 15000ms
  Max Retries: 2
  Caching: Disabled
```

### Configuration Logging

```typescript
import { logAIConfig } from '@/lib/ai-config';

// Log current configuration
logAIConfig();
```

### Processing Logs

```typescript
// Processing attempt logs
🔄 Processing attempt 1/2 with openai mode
✅ Processing completed in 1250ms with openai mode

// Error logs
❌ Processing attempt 1 failed: API timeout
⏳ Waiting 1000ms before retry...
🔄 All attempts failed, falling back to mock AI processing
```

## Best Practices

### Configuration Management

1. **Environment Variables**: Use environment variables for sensitive data
2. **Validation**: Always validate configuration before use
3. **Fallbacks**: Enable fallback mechanisms for reliability
4. **Timeouts**: Set appropriate timeouts for your use case
5. **Retries**: Configure retry logic for network operations

### Error Handling

1. **Graceful Degradation**: Always have a fallback mode available
2. **User Feedback**: Provide clear error messages to users
3. **Logging**: Log errors for debugging and monitoring
4. **Retry Logic**: Implement retry logic for transient failures
5. **Circuit Breaker**: Consider implementing circuit breaker pattern for external APIs

### Performance

1. **Caching**: Enable caching for repeated analyses
2. **Timeouts**: Set reasonable timeouts to prevent hanging
3. **Resource Limits**: Configure token limits appropriately
4. **Monitoring**: Monitor processing times and success rates

## Troubleshooting

### Common Issues

#### OpenAI API Key Not Working

```bash
# Check environment variable
echo $OPENAI_API_KEY

# Verify in application
console.log('OpenAI enabled:', !!process.env.OPENAI_API_KEY);
```

#### Configuration Not Loading

```typescript
// Check configuration summary
import { getConfigSummary } from '@/lib/ai-config';
console.log(getConfigSummary());
```

#### Processing Failures

```typescript
// Check health status
import { performAIHealthCheck } from '@/lib/ai-config-validator';
const health = await performAIHealthCheck();
console.log(health);
```

### Debug Checklist

1. ✅ Environment variables are set correctly
2. ✅ API keys are valid and have proper permissions
3. ✅ Network connectivity is available
4. ✅ Configuration validation passes
5. ✅ Health check shows system is healthy
6. ✅ Fallback mechanisms are enabled
7. ✅ Debug logging is enabled for troubleshooting

## Migration Guide

### From Basic to Advanced Configuration

```typescript
// Before: Basic configuration
const manager = new AIProcessingManager({
  mode: 'openai',
  fallbackToMock: true
});

// After: Advanced configuration with validation
const manager = new AIProcessingManager({
  mode: 'openai',
  fallbackToMock: true,
  timeout: 20000,
  maxRetries: 3
});
```

### Adding Health Checks

```typescript
// Add to application startup
import { performAIHealthCheck } from '@/lib/ai-config-validator';

const health = await performAIHealthCheck();
if (!health.healthy) {
  console.error('AI system not ready:', health.error);
  // Handle startup failure
}
```

### Monitoring and Alerting

```typescript
// Add monitoring
import { exportConfiguration } from '@/lib/ai-config-validator';

const config = exportConfiguration();
// Send to monitoring system
monitoringService.reportConfig(config);
```

## API Reference

### Core Functions

- `validateAIMode(mode)` - Validate AI processing mode
- `getAvailableModes()` - Get available processing modes
- `getBestAvailableMode(preferred?)` - Get best available mode
- `createSafeAIConfig(userConfig?)` - Create validated configuration
- `validateAIConfig()` - Validate entire configuration

### Manager Methods

- `new AIProcessingManager(config?)` - Initialize with configuration
- `updateConfig(newConfig)` - Update configuration at runtime
- `getCurrentConfig()` - Get current configuration
- `getCurrentMode()` - Get current processing mode

### Validator Functions

- `validateAIConfiguration()` - Validate and log configuration
- `performAIHealthCheck()` - Perform comprehensive health check
- `getConfigurationRecommendations()` - Get improvement recommendations
- `exportConfiguration()` - Export configuration for external use

This configuration system provides a robust foundation for reliable AI processing with comprehensive error handling, validation, and monitoring capabilities.
