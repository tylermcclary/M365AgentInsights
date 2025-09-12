# Hybrid AI Processing System Migration Guide

## Overview

The `services/ai-insights.ts` file has been updated to integrate with the new hybrid AI processing system. This guide explains how to migrate existing components to take advantage of the enhanced capabilities while maintaining backward compatibility.

## Key Changes

### 1. Enhanced Return Type

The `analyzeClientCommunications` function now returns `EnhancedClientInsights` instead of `ClientInsights`:

```typescript
// Before
export function analyzeClientCommunications(
  clientEmail: string,
  communications: any[]
): ClientInsights

// After
export const analyzeClientCommunications = async (
  clientEmail: string,
  communications: any[]
): Promise<EnhancedClientInsights>
```

### 2. New EnhancedClientInsights Type

```typescript
interface EnhancedClientInsights {
  // Existing ClientInsights properties
  summary: ClientSummary;
  lastInteraction: LastInteraction | null;
  recommendedActions: NextBestAction[];
  highlights: ClientHighlight[];
  
  // New AI processing properties
  processingMetrics: {
    processingTime: number;
    tokensUsed?: number;
    confidence?: number;
    method: AIProcessingMode;
  };
  aiMethod: AIProcessingMode;
}
```

### 3. New Functions Available

```typescript
// Initialize AI processing with specific mode
initializeAIProcessing(mode: AIProcessingMode): AIProcessingManager

// Switch AI processing mode dynamically
switchAIMode(mode: AIProcessingMode): void

// Get current AI processing mode
getCurrentAIMode(): AIProcessingMode

// Access the processing manager directly
getAIProcessingManager(): AIProcessingManager | null

// Direct mock analysis (fallback)
analyzeMockInsights(communications: any[]): Promise<ClientInsights>
```

## Migration Steps

### Step 1: Update Function Calls

**Before:**
```typescript
const insights = analyzeClientCommunications(clientEmail, communications);
// insights is ClientInsights
```

**After:**
```typescript
const insights = await analyzeClientCommunications(clientEmail, communications);
// insights is EnhancedClientInsights
```

### Step 2: Handle New Properties

**Before:**
```typescript
const insights = await analyzeClientCommunications(clientEmail, communications);
console.log('Summary:', insights.summary.text);
console.log('Actions:', insights.recommendedActions.length);
```

**After:**
```typescript
const insights = await analyzeClientCommunications(clientEmail, communications);
console.log('Summary:', insights.summary.text);
console.log('Actions:', insights.recommendedActions.length);

// New properties available
console.log('AI Method:', insights.aiMethod);
console.log('Processing Time:', insights.processingMetrics.processingTime, 'ms');
console.log('Confidence:', insights.processingMetrics.confidence);
console.log('Tokens Used:', insights.processingMetrics.tokensUsed);
```

### Step 3: Component Updates

#### React Component Example

**Before:**
```typescript
import { analyzeClientCommunications } from '@/services/ai-insights';

function ClientInsightsPanel({ clientEmail, communications }) {
  const [insights, setInsights] = useState(null);
  
  useEffect(() => {
    const loadInsights = () => {
      const result = analyzeClientCommunications(clientEmail, communications);
      setInsights(result);
    };
    
    loadInsights();
  }, [clientEmail, communications]);
  
  return (
    <div>
      <h3>Client Insights</h3>
      <p>{insights?.summary.text}</p>
      <ul>
        {insights?.recommendedActions.map(action => (
          <li key={action.id}>{action.title}</li>
        ))}
      </ul>
    </div>
  );
}
```

**After:**
```typescript
import { analyzeClientCommunications } from '@/services/ai-insights';

function ClientInsightsPanel({ clientEmail, communications }) {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    const loadInsights = async () => {
      setLoading(true);
      try {
        const result = await analyzeClientCommunications(clientEmail, communications);
        setInsights(result);
      } catch (error) {
        console.error('Failed to load insights:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (clientEmail && communications.length > 0) {
      loadInsights();
    }
  }, [clientEmail, communications]);
  
  if (loading) return <div>Analyzing communications...</div>;
  if (!insights) return <div>No insights available</div>;
  
  return (
    <div>
      <h3>Client Insights</h3>
      
      {/* Show AI processing info */}
      <div className="ai-processing-info">
        <span className={`ai-method ${insights.aiMethod}`}>
          {insights.aiMethod.toUpperCase()}
        </span>
        <span className="processing-time">
          {insights.processingMetrics.processingTime}ms
        </span>
        {insights.processingMetrics.confidence && (
          <span className="confidence">
            {Math.round(insights.processingMetrics.confidence * 100)}% confidence
          </span>
        )}
      </div>
      
      <p>{insights.summary.text}</p>
      
      <h4>Recommended Actions</h4>
      <ul>
        {insights.recommendedActions.map(action => (
          <li key={action.id}>
            <strong>{action.title}</strong>
            <span className={`priority ${action.priority}`}>
              {action.priority}
            </span>
            <p>{action.rationale}</p>
          </li>
        ))}
      </ul>
      
      <h4>Highlights</h4>
      <ul>
        {insights.highlights.map((highlight, index) => (
          <li key={index}>
            <strong>{highlight.label}:</strong> {highlight.value}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### Step 4: Add AI Mode Controls (Optional)

```typescript
import { switchAIMode, getCurrentAIMode } from '@/services/ai-insights';

function AIModeSelector() {
  const [currentMode, setCurrentMode] = useState(getCurrentAIMode());
  
  const handleModeChange = (mode: AIProcessingMode) => {
    switchAIMode(mode);
    setCurrentMode(mode);
  };
  
  return (
    <div className="ai-mode-selector">
      <label>AI Processing Mode:</label>
      <select 
        value={currentMode} 
        onChange={(e) => handleModeChange(e.target.value as AIProcessingMode)}
      >
        <option value="mock">Mock (Rule-based)</option>
        <option value="nlp">Local NLP</option>
        <option value="openai">OpenAI (GPT)</option>
      </select>
    </div>
  );
}
```

### Step 5: Error Handling

```typescript
import { analyzeClientCommunications } from '@/services/ai-insights';

async function loadClientInsights(clientEmail: string, communications: any[]) {
  try {
    const insights = await analyzeClientCommunications(clientEmail, communications);
    
    // Handle successful analysis
    console.log('Analysis completed with method:', insights.aiMethod);
    return insights;
    
  } catch (error) {
    console.error('AI analysis failed:', error);
    
    // The system automatically falls back to mock analysis
    // but you can also handle errors explicitly
    throw new Error('Unable to analyze client communications');
  }
}
```

## Backward Compatibility

The system maintains backward compatibility:

1. **Existing Mock Analysis**: The `analyzeMockInsights` function is still available for direct use
2. **Legacy Data Structure**: All existing `ClientInsights` properties are preserved
3. **Graceful Fallback**: If AI services fail, the system automatically falls back to mock analysis
4. **Type Safety**: TypeScript will help identify areas that need updates

## Benefits of Migration

### 1. Enhanced Insights
- More sophisticated analysis with AI capabilities
- Better sentiment analysis and topic extraction
- Improved recommendation generation

### 2. Processing Transparency
- See which AI method was used for analysis
- Monitor processing performance and confidence
- Track token usage for cost management

### 3. Flexibility
- Switch between different AI modes as needed
- Use local NLP for privacy-sensitive data
- Fall back to mock for development/testing

### 4. Future-Proof
- Easy to add new AI processing modes
- Extensible architecture for new capabilities
- Consistent interface across all processing methods

## Testing Migration

### 1. Test with Existing Data
```typescript
// Test with your existing communication data
const testCommunications = [
  // Your existing test data
];

const insights = await analyzeClientCommunications('test@example.com', testCommunications);
console.log('Migration test successful:', insights.aiMethod);
```

### 2. Verify Fallback
```typescript
// Test fallback by using mock mode
switchAIMode('mock');
const insights = await analyzeClientCommunications('test@example.com', testCommunications);
console.log('Fallback test successful:', insights.aiMethod === 'mock');
```

### 3. Test Mode Switching
```typescript
// Test dynamic mode switching
switchAIMode('nlp');
console.log('Current mode:', getCurrentAIMode());

switchAIMode('openai');
console.log('Current mode:', getCurrentAIMode());
```

## Common Issues and Solutions

### Issue 1: Async/Await Not Used
**Error**: `TypeError: insights is not a promise`
**Solution**: Add `await` to the function call and make the calling function `async`

### Issue 2: Missing New Properties
**Error**: `Property 'aiMethod' does not exist`
**Solution**: Update TypeScript types to use `EnhancedClientInsights`

### Issue 3: AI Services Not Available
**Error**: OpenAI API errors or NLP processing failures
**Solution**: The system automatically falls back to mock analysis

### Issue 4: Performance Concerns
**Issue**: AI processing takes longer than expected
**Solution**: Use local NLP mode for faster processing, or implement caching

## Migration Checklist

- [ ] Update function calls to use `await`
- [ ] Update TypeScript types to `EnhancedClientInsights`
- [ ] Add loading states for async operations
- [ ] Display AI processing information (optional)
- [ ] Add error handling for AI failures
- [ ] Test with existing data
- [ ] Verify fallback behavior
- [ ] Update component tests
- [ ] Document new features for users

## Support

For questions or issues with migration:

1. Check the examples in `services/hybrid-ai-examples.ts`
2. Review the AI processing system documentation
3. Test with mock mode first before enabling AI services
4. Use the fallback system for reliable operation

The hybrid AI processing system is designed to be a seamless upgrade that enhances your existing functionality while maintaining reliability and backward compatibility.
