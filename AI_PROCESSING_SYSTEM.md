# AI Processing System Documentation

## Overview

The M365 Agent Insights project now includes a comprehensive AI processing system that provides three-tier processing capabilities:

1. **OpenAI Processing** - Full AI-powered analysis using GPT models
2. **Local NLP Processing** - Local natural language processing using installed libraries
3. **Mock Processing** - Rule-based fallback processing

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    AI Processing Manager                     │
├─────────────────────────────────────────────────────────────┤
│  • Centralized processing orchestration                     │
│  • Mode switching and fallback handling                     │
│  • Configuration management                                 │
│  • Performance metrics tracking                             │
└─────────────────────────────────────────────────────────────┘
                                │
                ┌───────────────┼───────────────┐
                │               │               │
┌───────────────▼───┐ ┌─────────▼─────────┐ ┌──▼─────────────┐
│  OpenAI Processor │ │ Local NLP Processor│ │ Mock Processor │
├───────────────────┤ ├───────────────────┤ ├────────────────┤
│ • GPT-4/GPT-3.5   │ │ • Sentiment       │ │ • Rule-based   │
│ • Advanced AI     │ │ • Entity Extract  │ │ • Pattern      │
│ • JSON responses  │ │ • Topic Analysis  │ │ • Fallback     │
│ • High confidence │ │ • Local processing│ │ • Always avail │
└───────────────────┘ └───────────────────┘ └────────────────┘
```

## Quick Start

### Basic Usage

```typescript
import { createAutoProcessor } from '@/services/ai-factory';

// Create processor (automatically chooses best available mode)
const processor = createAutoProcessor();

// Process client communications
const insights = await processor.processClientCommunications(
  'client@example.com',
  communications
);

console.log('Processing method:', insights.aiMethod);
console.log('Summary:', insights.summary.text);
console.log('Actions:', insights.recommendedActions);
```

### Specific Mode Usage

```typescript
import { 
  createOpenAIProcessor, 
  createLocalNLPProcessor, 
  createMockProcessor 
} from '@/services/ai-factory';

// OpenAI processing
const openaiProcessor = createOpenAIProcessor();
const openaiInsights = await openaiProcessor.processClientCommunications(clientEmail, communications);

// Local NLP processing
const nlpProcessor = createLocalNLPProcessor();
const nlpInsights = await nlpProcessor.processClientCommunications(clientEmail, communications);

// Mock processing
const mockProcessor = createMockProcessor();
const mockInsights = await mockProcessor.processClientCommunications(clientEmail, communications);
```

## Processing Modes

### 1. OpenAI Processing (`openai`)

**Capabilities:**
- Advanced natural language understanding
- Context-aware analysis
- Intelligent summarization
- Sophisticated recommendation generation
- High confidence scores (0.9)

**Requirements:**
- OpenAI API key configured
- Internet connection
- Higher processing time (30s timeout)

**Best For:**
- Complex client communications
- Detailed analysis requirements
- High-stakes decision making
- Sophisticated client relationships

### 2. Local NLP Processing (`nlp`)

**Capabilities:**
- Sentiment analysis
- Entity extraction
- Topic detection
- Keyword analysis
- Medium confidence scores (0.7)

**Requirements:**
- Installed NLP packages (sentiment, natural, compromise)
- No internet required
- Fast processing (10s timeout)

**Best For:**
- Privacy-sensitive data
- Offline processing
- Quick analysis needs
- Basic insight generation

### 3. Mock Processing (`mock`)

**Capabilities:**
- Rule-based pattern matching
- Keyword-based analysis
- Basic recommendation generation
- Low confidence scores (0.5)

**Requirements:**
- No external dependencies
- Always available
- Instant processing (1s timeout)

**Best For:**
- Development and testing
- Fallback scenarios
- Basic functionality
- System reliability

## Configuration

### Environment Variables

```env
# OpenAI Configuration
OPENAI_API_KEY=your_api_key_here
OPENAI_MODEL=gpt-4o-mini
OPENAI_MAX_TOKENS=2000
OPENAI_TEMPERATURE=0.7

# Feature Toggles
SENTIMENT_ANALYSIS_ENABLED=true
TOPIC_EXTRACTION_ENABLED=true
LANGUAGE_DETECTION_ENABLED=true
AI_INSIGHTS_ENABLED=true
AI_SUMMARY_ENABLED=true
AI_RECOMMENDATIONS_ENABLED=true
```

### Programmatic Configuration

```typescript
import { AIProcessingConfig } from '@/types';

const config: AIProcessingConfig = {
  mode: 'openai',
  openaiModel: 'gpt-4o-mini',
  timeout: 30000,
  fallbackToMock: true
};

const processor = new AIProcessingManager(config);
```

## API Reference

### AIProcessingManager

#### Constructor
```typescript
constructor(config: AIProcessingConfig)
```

#### Methods

##### `processClientCommunications(clientEmail: string, communications: any[]): Promise<EnhancedClientInsights>`
Processes client communications and returns comprehensive insights.

**Parameters:**
- `clientEmail`: Email address of the client
- `communications`: Array of communication objects (emails, events, etc.)

**Returns:**
- `EnhancedClientInsights` object with analysis results and processing metrics

##### `updateConfig(newConfig: Partial<AIProcessingConfig>): void`
Updates the processor configuration dynamically.

##### `getCurrentConfig(): AIProcessingConfig`
Returns the current configuration.

### Factory Functions

#### `createAutoProcessor(config?: Partial<AIProcessingConfig>): AIProcessingManager`
Creates a processor that automatically selects the best available mode.

#### `createOpenAIProcessor(config?: Partial<AIProcessingConfig>): AIProcessingManager`
Creates a processor configured for OpenAI processing.

#### `createLocalNLPProcessor(config?: Partial<AIProcessingConfig>): AIProcessingManager`
Creates a processor configured for local NLP processing.

#### `createMockProcessor(config?: Partial<AIProcessingConfig>): AIProcessingManager`
Creates a processor configured for mock processing.

#### `getAvailableModes(): AIProcessingMode[]`
Returns an array of available processing modes.

#### `isModeAvailable(mode: AIProcessingMode): boolean`
Checks if a specific processing mode is available.

## Data Types

### EnhancedClientInsights
```typescript
interface EnhancedClientInsights {
  summary: {
    text: string;
    topics: string[];
    sentiment: "positive" | "neutral" | "negative";
    frequencyPerWeek: number;
  };
  lastInteraction: {
    when: string;
    type: "email" | "event" | "chat";
    subject?: string;
    snippet?: string;
  } | null;
  recommendedActions: Array<{
    id: string;
    title: string;
    rationale: string;
    priority: "low" | "medium" | "high";
    dueDate?: string;
  }>;
  highlights: Array<{
    label: string;
    value: string;
  }>;
  processingMetrics: {
    processingTime: number;
    tokensUsed?: number;
    confidence?: number;
    method: AIProcessingMode;
  };
  aiMethod: AIProcessingMode;
}
```

### AIProcessingConfig
```typescript
interface AIProcessingConfig {
  mode: AIProcessingMode;
  openaiModel?: 'gpt-3.5-turbo' | 'gpt-4' | 'gpt-4o-mini';
  timeout?: number;
  fallbackToMock?: boolean;
}
```

## Integration Examples

### React Component Integration

```typescript
import React, { useState, useEffect } from 'react';
import { createAutoProcessor } from '@/services/ai-factory';

export function ClientInsightsPanel({ clientEmail, communications }) {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadInsights() {
      setLoading(true);
      try {
        const processor = createAutoProcessor();
        const result = await processor.processClientCommunications(
          clientEmail, 
          communications
        );
        setInsights(result);
      } catch (error) {
        console.error('Failed to load insights:', error);
      } finally {
        setLoading(false);
      }
    }

    if (clientEmail && communications.length > 0) {
      loadInsights();
    }
  }, [clientEmail, communications]);

  if (loading) return <div>Analyzing communications...</div>;
  if (!insights) return <div>No insights available</div>;

  return (
    <div>
      <h3>Client Insights ({insights.aiMethod})</h3>
      <p>{insights.summary.text}</p>
      <div>
        <h4>Recommended Actions</h4>
        {insights.recommendedActions.map(action => (
          <div key={action.id}>
            <strong>{action.title}</strong> - {action.rationale}
          </div>
        ))}
      </div>
    </div>
  );
}
```

### API Route Integration

```typescript
// app/api/insights/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createAutoProcessor } from '@/services/ai-factory';

export async function POST(request: NextRequest) {
  try {
    const { clientEmail, communications } = await request.json();
    
    const processor = createAutoProcessor();
    const insights = await processor.processClientCommunications(
      clientEmail,
      communications
    );
    
    return NextResponse.json(insights);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to process insights' },
      { status: 500 }
    );
  }
}
```

## Performance Considerations

### Processing Times
- **OpenAI**: 2-10 seconds (depending on complexity)
- **Local NLP**: 100-500ms
- **Mock**: 10-50ms

### Memory Usage
- **OpenAI**: Minimal (API calls)
- **Local NLP**: Moderate (NLP libraries loaded)
- **Mock**: Minimal

### Cost Considerations
- **OpenAI**: Pay per token usage
- **Local NLP**: No ongoing costs
- **Mock**: No costs

## Error Handling

The system includes comprehensive error handling:

1. **Automatic Fallback**: Falls back to mock processing if configured
2. **Graceful Degradation**: Continues operation even if AI services fail
3. **Detailed Logging**: Comprehensive error logging for debugging
4. **Timeout Handling**: Configurable timeouts for each processing mode

## Best Practices

### 1. Use Auto Processing for Production
```typescript
// Recommended for production
const processor = createAutoProcessor();
```

### 2. Implement Proper Error Handling
```typescript
try {
  const insights = await processor.processClientCommunications(clientEmail, communications);
  // Handle success
} catch (error) {
  // Handle error gracefully
  console.error('Processing failed:', error);
  // Show fallback UI or retry
}
```

### 3. Cache Results When Appropriate
```typescript
// Cache insights for frequently accessed clients
const cacheKey = `insights-${clientEmail}`;
let cachedInsights = getFromCache(cacheKey);

if (!cachedInsights) {
  cachedInsights = await processor.processClientCommunications(clientEmail, communications);
  setCache(cacheKey, cachedInsights, 3600); // Cache for 1 hour
}
```

### 4. Monitor Performance
```typescript
const startTime = Date.now();
const insights = await processor.processClientCommunications(clientEmail, communications);
const processingTime = Date.now() - startTime;

console.log(`Processing completed in ${processingTime}ms using ${insights.aiMethod}`);
```

## Troubleshooting

### Common Issues

1. **OpenAI API Key Not Working**
   - Verify the key is correct in `.env.local`
   - Check OpenAI account status and billing
   - Ensure the key has proper permissions

2. **Local NLP Processing Slow**
   - Check if packages are properly installed
   - Verify memory availability
   - Consider reducing communication batch size

3. **Mock Processing Too Basic**
   - This is expected behavior
   - Configure fallback to more advanced modes
   - Ensure environment variables are set correctly

### Debug Mode

Enable debug logging by setting:
```env
NODE_ENV=development
```

This will provide detailed logs of the processing pipeline.

## Future Enhancements

Planned improvements include:

1. **Custom Model Support**: Support for other AI providers
2. **Advanced Caching**: Intelligent caching with invalidation
3. **Batch Processing**: Optimized batch processing capabilities
4. **Custom Prompts**: Configurable AI prompts for different use cases
5. **Analytics Dashboard**: Built-in performance and usage analytics

## Support

For issues or questions:

1. Check the troubleshooting section above
2. Review the example usage in `services/ai-usage-examples.ts`
3. Examine the configuration in `lib/ai-config.ts`
4. Test with the factory functions in `services/ai-factory.ts`
