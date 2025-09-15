/**
 * Hybrid AI Processing System Usage Examples
 * 
 * This file demonstrates how to use the updated ai-insights.ts service
 * with the new hybrid AI processing capabilities.
 */

import { 
  analyzeClientCommunications,
  initializeAIProcessing,
  switchAIMode,
  getCurrentAIMode,
  getAIProcessingManager,
  analyzeMockInsights
} from './ai-insights';
import { AIProcessingMode, EnhancedClientInsights } from '@/types';

/**
 * Example 1: Basic hybrid AI analysis with auto-initialization
 */
export async function exampleBasicHybridAnalysis() {
  console.log('=== Basic Hybrid AI Analysis ===');
  
  const communications = [
    {
      timestamp: '2024-01-15T10:00:00Z',
      sender: 'John Smith',
      subject: 'Portfolio Performance Review',
      body: `Hi Sarah,
      
      I wanted to follow up on our conversation last week about my portfolio performance. I'm concerned about the recent market volatility and would like to review our risk allocation.
      
      The recent downturn has me worried about my retirement timeline. I'm wondering if we should consider moving some funds to more conservative investments.
      
      Can we schedule a call this week to discuss?
      
      Best regards,
      John`
    },
    {
      timestamp: '2024-01-10T14:30:00Z',
      sender: 'John Smith',
      subject: 'Meeting Request',
      body: `Hi Sarah,
      
      I hope you're doing well. I'd like to schedule our quarterly review meeting. I have some questions about my 401k allocation and want to discuss my daughter's college fund.
      
      She's starting high school next year, so we need to think about increasing our education savings contributions.
      
      Let me know what works for your schedule.
      
      Thanks,
      John`
    }
  ];
  
  try {
    // The function will auto-initialize with mock mode if not already initialized
    const insights = await analyzeClientCommunications('john.smith@example.com', communications);
    
    console.log('Analysis Results:');
    console.log('================');
    console.log('AI Method:', insights.aiMethod);
    console.log('Processing Time:', insights.processingMetrics.processingTime, 'ms');
    console.log('Confidence:', insights.processingMetrics.confidence);
    console.log('Tokens Used:', insights.processingMetrics.tokensUsed);
    console.log('Summary:', insights.summary.text);
    console.log('Sentiment:', insights.summary.sentiment);
    console.log('Topics:', insights.summary.topics);
    console.log('Frequency:', insights.summary.frequencyPerWeek, '/week');
    console.log('Recommended Actions:', insights.recommendedActions.length);
    
    return insights;
  } catch (error) {
    console.error('Analysis failed:', error);
    throw error;
  }
}

/**
 * Example 2: Initialize with specific AI mode
 */
export async function exampleSpecificAIMode() {
  console.log('\n=== Specific AI Mode Initialization ===');
  
  // Initialize with OpenAI mode
  const openaiManager = initializeAIProcessing('openai');
  console.log('Initialized OpenAI manager:', openaiManager !== null);
  
  // Initialize with Local NLP mode
  const nlpManager = initializeAIProcessing('nlp');
  console.log('Initialized NLP manager:', nlpManager !== null);
  
  // Initialize with Mock mode
  const mockManager = initializeAIProcessing('mock');
  console.log('Initialized Mock manager:', mockManager !== null);
  
  console.log('Current AI Mode:', getCurrentAIMode());
  
  const communications = [
    {
      timestamp: '2024-01-15T10:00:00Z',
      sender: 'Jane Doe',
      subject: 'Investment Questions',
      body: 'I have some questions about my investment strategy and would like to discuss my portfolio allocation.'
    }
  ];
  
  try {
    const insights = await analyzeClientCommunications('jane.doe@example.com', communications);
    console.log('Analysis completed with mode:', insights.aiMethod);
    return insights;
  } catch (error) {
    console.error('Specific mode analysis failed:', error);
    throw error;
  }
}

/**
 * Example 3: Dynamic AI mode switching
 */
export async function exampleDynamicModeSwitching() {
  console.log('\n=== Dynamic AI Mode Switching ===');
  
  const communications = [
    {
      timestamp: '2024-01-15T10:00:00Z',
      sender: 'Robert Johnson',
      subject: 'Financial Planning Discussion',
      body: `Hi Michael,
      
      I wanted to discuss my financial planning goals. I'm getting married next year and we're planning to buy a house.
      
      I'd like to review our investment strategy and make sure we're on track for our long-term goals.
      
      Best,
      Robert`
    }
  ];
  
  try {
    // Start with mock mode
    switchAIMode('mock');
    console.log('Switched to:', getCurrentAIMode());
    
    let insights = await analyzeClientCommunications('robert.johnson@example.com', communications);
    console.log('Mock analysis - Method:', insights.aiMethod, 'Time:', insights.processingMetrics.processingTime, 'ms');
    
    // Switch to NLP mode
    switchAIMode('nlp');
    console.log('Switched to:', getCurrentAIMode());
    
    insights = await analyzeClientCommunications('robert.johnson@example.com', communications);
    console.log('NLP analysis - Method:', insights.aiMethod, 'Time:', insights.processingMetrics.processingTime, 'ms');
    
    // Switch to OpenAI mode (if available)
    switchAIMode('openai');
    console.log('Switched to:', getCurrentAIMode());
    
    insights = await analyzeClientCommunications('robert.johnson@example.com', communications);
    console.log('OpenAI analysis - Method:', insights.aiMethod, 'Time:', insights.processingMetrics.processingTime, 'ms');
    
    return insights;
  } catch (error) {
    console.error('Dynamic switching failed:', error);
    throw error;
  }
}

/**
 * Example 4: Processing manager access and configuration
 */
export async function exampleProcessingManagerAccess() {
  console.log('\n=== Processing Manager Access ===');
  
  const manager = getAIProcessingManager();
  if (manager) {
    console.log('Processing manager available');
    console.log('Current config:', manager.getCurrentConfig());
    
    // Update configuration
    manager.updateConfig({
      timeout: 20000,
      fallbackToMock: true
    });
    
    console.log('Updated config:', manager.getCurrentConfig());
  } else {
    console.log('No processing manager available, initializing...');
    initializeAIProcessing('nlp');
  }
  
  const communications = [
    {
      timestamp: '2024-01-15T10:00:00Z',
      sender: 'Susan Chen',
      subject: 'Account Update',
      body: 'I wanted to update my account information and discuss my investment preferences.'
    }
  ];
  
  try {
    const insights = await analyzeClientCommunications('susan.chen@example.com', communications);
    console.log('Analysis with custom config - Method:', insights.aiMethod);
    return insights;
  } catch (error) {
    console.error('Processing manager access failed:', error);
    throw error;
  }
}

/**
 * Example 5: Fallback handling demonstration
 */
export async function exampleFallbackHandling() {
  console.log('\n=== Fallback Handling Demonstration ===');
  
  // Force mock mode to demonstrate fallback
  switchAIMode('mock');
  
  const communications = [
    {
      timestamp: '2024-01-15T10:00:00Z',
      sender: 'Test Client',
      subject: 'Test Communication',
      body: 'This is a test communication to demonstrate fallback handling.'
    }
  ];
  
  try {
    // This will use mock processing and show the fallback structure
    const insights = await analyzeClientCommunications('test@example.com', communications);
    
    console.log('Fallback Analysis Results:');
    console.log('==========================');
    console.log('AI Method:', insights.aiMethod);
    console.log('Processing Time:', insights.processingMetrics.processingTime, 'ms');
    console.log('Confidence:', insights.processingMetrics.confidence);
    console.log('Method:', insights.processingMetrics.method);
    console.log('Summary:', insights.summary.text);
    console.log('Has Processing Metrics:', 'processingMetrics' in insights);
    console.log('Has AI Method:', 'aiMethod' in insights);
    
    return insights;
  } catch (error) {
    console.error('Fallback handling failed:', error);
    throw error;
  }
}

/**
 * Example 6: Mock insights direct usage
 */
export async function exampleMockInsightsDirect() {
  console.log('\n=== Mock Insights Direct Usage ===');
  
  const communications = [
    {
      timestamp: '2024-01-15T10:00:00Z',
      sender: 'Direct Test',
      subject: 'Direct Mock Test',
      body: 'Testing direct mock insights function.'
    }
  ];
  
  try {
    // Use mock insights directly (legacy format)
    const mockInsights = await analyzeMockInsights(communications);
    
    console.log('Direct Mock Insights:');
    console.log('====================');
    console.log('Summary:', mockInsights.summary.text);
    console.log('Sentiment:', mockInsights.summary.sentiment);
    console.log('Topics:', mockInsights.summary.topics);
    console.log('Frequency:', mockInsights.summary.frequencyPerWeek, '/week');
    console.log('Actions:', mockInsights.recommendedActions.length);
    console.log('Highlights:', mockInsights.highlights.length);
    console.log('Last Interaction:', mockInsights.lastInteraction ? 'Yes' : 'No');
    
    return mockInsights;
  } catch (error) {
    console.error('Direct mock insights failed:', error);
    throw error;
  }
}

/**
 * Example 7: Batch processing with different modes
 */
export async function exampleBatchProcessing() {
  console.log('\n=== Batch Processing with Different Modes ===');
  
  const clients = [
    {
      email: 'client1@example.com',
      communications: [
        {
          timestamp: '2024-01-15T10:00:00Z',
          sender: 'Client 1',
          subject: 'Portfolio Review',
          body: 'I would like to review my portfolio performance.'
        }
      ]
    },
    {
      email: 'client2@example.com',
      communications: [
        {
          timestamp: '2024-01-14T14:00:00Z',
          sender: 'Client 2',
          subject: 'Investment Questions',
          body: 'I have questions about my investment strategy.'
        }
      ]
    },
    {
      email: 'client3@example.com',
      communications: [
        {
          timestamp: '2024-01-13T09:00:00Z',
          sender: 'Client 3',
          subject: 'Market Concerns',
          body: 'I am concerned about the recent market volatility.'
        }
      ]
    }
  ];
  
  try {
    // Process with different modes
    const modes: AIProcessingMode[] = ['mock', 'nlp', 'openai'];
    const results: Array<{ mode: AIProcessingMode; insights: EnhancedClientInsights }> = [];
    
    for (const mode of modes) {
      try {
        switchAIMode(mode);
        console.log(`Processing batch with ${mode} mode...`);
        
        const batchResults = await Promise.all(
          clients.map(client => 
            analyzeClientCommunications(client.email, client.communications)
          )
        );
        
        const avgProcessingTime = batchResults.reduce((sum, result) => 
          sum + result.processingMetrics.processingTime, 0) / batchResults.length;
        
        const avgConfidence = batchResults.reduce((sum, result) => 
          sum + (result.processingMetrics.confidence || 0), 0) / batchResults.length;
        
        console.log(`${mode} mode results:`);
        console.log(`  Average processing time: ${avgProcessingTime.toFixed(0)}ms`);
        console.log(`  Average confidence: ${avgConfidence.toFixed(2)}`);
        console.log(`  Success rate: ${batchResults.length}/${clients.length}`);
        
        results.push({ mode, insights: batchResults[0] });
      } catch (error) {
        console.log(`${mode} mode failed:`, error instanceof Error ? error.message : String(error));
      }
    }
    
    return results;
  } catch (error) {
    console.error('Batch processing failed:', error);
    throw error;
  }
}

/**
 * Utility function to run all examples
 */
export async function runAllHybridAIExamples() {
  console.log('Hybrid AI Processing System Examples');
  console.log('====================================');
  
  try {
    await exampleBasicHybridAnalysis();
    await exampleSpecificAIMode();
    await exampleDynamicModeSwitching();
    await exampleProcessingManagerAccess();
    await exampleFallbackHandling();
    await exampleMockInsightsDirect();
    await exampleBatchProcessing();
    
    console.log('\n✅ All hybrid AI examples completed successfully!');
  } catch (error) {
    console.error('❌ Example execution failed:', error);
  }
}

export default {
  exampleBasicHybridAnalysis,
  exampleSpecificAIMode,
  exampleDynamicModeSwitching,
  exampleProcessingManagerAccess,
  exampleFallbackHandling,
  exampleMockInsightsDirect,
  exampleBatchProcessing,
  runAllHybridAIExamples
};
