/**
 * AI Processing Manager Usage Examples
 * 
 * This file demonstrates how to use the centralized AI processing system
 * with different processing modes and configurations.
 */

import { AIProcessingManager } from './ai-processing-manager';
import { 
  createOpenAIProcessor, 
  createLocalNLPProcessor, 
  createMockProcessor, 
  createAutoProcessor,
  getAvailableModes,
  isModeAvailable 
} from './ai-factory';
import { AIProcessingConfig } from '@/types';

/**
 * Example 1: Using OpenAI processing
 */
export async function exampleOpenAIProcessing() {
  console.log('=== OpenAI Processing Example ===');
  
  // Check if OpenAI is available
  if (!isModeAvailable('openai')) {
    console.log('OpenAI not available, falling back to auto mode');
    return exampleAutoProcessing();
  }
  
  // Create OpenAI processor
  const processor = createOpenAIProcessor({
    openaiModel: 'gpt-4o-mini',
    timeout: 30000,
    fallbackToMock: true
  });
  
  // Sample communications data
  const communications = [
    {
      id: 'email-1',
      timestamp: '2024-01-15T10:00:00Z',
      from: { emailAddress: { name: 'John Doe', address: 'john@example.com' } },
      subject: 'Portfolio Performance Review',
      body: 'Hi, I wanted to discuss my portfolio performance. I\'m concerned about the recent market volatility and would like to review our risk allocation.',
      type: 'email'
    },
    {
      id: 'email-2', 
      timestamp: '2024-01-10T14:30:00Z',
      from: { emailAddress: { name: 'John Doe', address: 'john@example.com' } },
      subject: 'Meeting Request',
      body: 'Can we schedule a call next week to discuss my retirement planning goals? I have some questions about my 401k allocation.',
      type: 'email'
    }
  ];
  
  try {
    const insights = await processor.processClientCommunications('john@example.com', communications);
    
    console.log('Processing Method:', insights.aiMethod);
    console.log('Processing Time:', insights.processingMetrics.processingTime, 'ms');
    console.log('Confidence:', insights.processingMetrics.confidence);
    console.log('Summary:', insights.summary.text);
    console.log('Topics:', insights.summary.topics);
    console.log('Sentiment:', insights.summary.sentiment);
    console.log('Recommended Actions:', insights.recommendedActions.length);
    
    return insights;
  } catch (error) {
    console.error('OpenAI processing failed:', error);
    throw error;
  }
}

/**
 * Example 2: Using Local NLP processing
 */
export async function exampleLocalNLPProcessing() {
  console.log('=== Local NLP Processing Example ===');
  
  const processor = createLocalNLPProcessor({
    timeout: 10000,
    fallbackToMock: true
  });
  
  const communications = [
    {
      id: 'email-1',
      timestamp: '2024-01-15T10:00:00Z',
      subject: 'Investment Questions',
      body: 'I have some questions about my investment strategy. The market seems uncertain and I want to make sure my portfolio is properly diversified.',
      type: 'email'
    }
  ];
  
  try {
    const insights = await processor.processClientCommunications('client@example.com', communications);
    
    console.log('Processing Method:', insights.aiMethod);
    console.log('Processing Time:', insights.processingMetrics.processingTime, 'ms');
    console.log('Summary:', insights.summary.text);
    console.log('Recommended Actions:', insights.recommendedActions.map(a => a.title));
    
    return insights;
  } catch (error) {
    console.error('Local NLP processing failed:', error);
    throw error;
  }
}

/**
 * Example 3: Using Mock processing
 */
export async function exampleMockProcessing() {
  console.log('=== Mock Processing Example ===');
  
  const processor = createMockProcessor();
  
  const communications = [
    {
      id: 'email-1',
      timestamp: '2024-01-15T10:00:00Z',
      subject: 'General Inquiry',
      body: 'Just checking in on my account status.',
      type: 'email'
    }
  ];
  
  try {
    const insights = await processor.processClientCommunications('client@example.com', communications);
    
    console.log('Processing Method:', insights.aiMethod);
    console.log('Processing Time:', insights.processingMetrics.processingTime, 'ms');
    console.log('Summary:', insights.summary.text);
    
    return insights;
  } catch (error) {
    console.error('Mock processing failed:', error);
    throw error;
  }
}

/**
 * Example 4: Using Auto processing (recommended)
 */
export async function exampleAutoProcessing() {
  console.log('=== Auto Processing Example ===');
  
  const processor = createAutoProcessor();
  
  const communications = [
    {
      id: 'email-1',
      timestamp: '2024-01-15T10:00:00Z',
      from: { emailAddress: { name: 'Jane Smith', address: 'jane@example.com' } },
      subject: 'Urgent: Market Concerns',
      body: 'I\'m very worried about the recent market downturn. Should I move my investments to cash? I can\'t afford to lose more money.',
      type: 'email'
    },
    {
      id: 'event-1',
      timestamp: '2024-01-20T15:00:00Z',
      subject: 'Portfolio Review Meeting',
      body: 'Scheduled portfolio review meeting',
      type: 'event'
    }
  ];
  
  try {
    const insights = await processor.processClientCommunications('jane@example.com', communications);
    
    console.log('Auto-selected Method:', insights.aiMethod);
    console.log('Processing Time:', insights.processingMetrics.processingTime, 'ms');
    console.log('Confidence:', insights.processingMetrics.confidence);
    console.log('Summary:', insights.summary.text);
    console.log('Priority Actions:', insights.recommendedActions.filter(a => a.priority === 'high').length);
    
    return insights;
  } catch (error) {
    console.error('Auto processing failed:', error);
    throw error;
  }
}

/**
 * Example 5: Processing with custom configuration
 */
export async function exampleCustomProcessing() {
  console.log('=== Custom Configuration Example ===');
  
  const customConfig: AIProcessingConfig = {
    mode: 'openai',
    openaiModel: 'gpt-4o-mini',
    timeout: 45000,
    fallbackToMock: true
  };
  
  const processor = new AIProcessingManager(customConfig);
  
  const communications = [
    {
      id: 'email-1',
      timestamp: '2024-01-15T10:00:00Z',
      subject: 'Complex Investment Strategy',
      body: 'I need help with a complex investment strategy involving multiple asset classes, tax optimization, and estate planning considerations.',
      type: 'email'
    }
  ];
  
  try {
    const insights = await processor.processClientCommunications('sophisticated-client@example.com', communications);
    
    console.log('Custom Processing Method:', insights.aiMethod);
    console.log('Processing Time:', insights.processingMetrics.processingTime, 'ms');
    console.log('Summary:', insights.summary.text);
    
    return insights;
  } catch (error) {
    console.error('Custom processing failed:', error);
    throw error;
  }
}

/**
 * Example 6: Batch processing multiple clients
 */
export async function exampleBatchProcessing() {
  console.log('=== Batch Processing Example ===');
  
  const processor = createAutoProcessor();
  
  const clients = [
    {
      email: 'client1@example.com',
      communications: [
        {
          id: 'email-1',
          timestamp: '2024-01-15T10:00:00Z',
          subject: 'Account Update',
          body: 'Please update my account information.',
          type: 'email'
        }
      ]
    },
    {
      email: 'client2@example.com', 
      communications: [
        {
          id: 'email-2',
          timestamp: '2024-01-14T14:00:00Z',
          subject: 'Investment Questions',
          body: 'I have questions about my portfolio allocation.',
          type: 'email'
        }
      ]
    }
  ];
  
  try {
    const results = await Promise.all(
      clients.map(client => 
        processor.processClientCommunications(client.email, client.communications)
      )
    );
    
    console.log(`Processed ${results.length} clients`);
    results.forEach((insights, index) => {
      console.log(`Client ${index + 1}: ${insights.aiMethod} processing, ${insights.processingMetrics.processingTime}ms`);
    });
    
    return results;
  } catch (error) {
    console.error('Batch processing failed:', error);
    throw error;
  }
}

/**
 * Example 7: Dynamic configuration switching
 */
export async function exampleDynamicSwitching() {
  console.log('=== Dynamic Configuration Example ===');
  
  const processor = createAutoProcessor();
  
  // Start with auto mode
  console.log('Initial mode:', processor.getCurrentConfig().mode);
  
  // Switch to mock mode for testing
  processor.updateConfig({ mode: 'mock' });
  console.log('Switched to:', processor.getCurrentConfig().mode);
  
  // Switch back to auto mode
  processor.updateConfig({ mode: 'openai', fallbackToMock: true });
  console.log('Final mode:', processor.getCurrentConfig().mode);
  
  const communications = [
    {
      id: 'email-1',
      timestamp: '2024-01-15T10:00:00Z',
      subject: 'Test Communication',
      body: 'This is a test communication for dynamic switching.',
      type: 'email'
    }
  ];
  
  try {
    const insights = await processor.processClientCommunications('test@example.com', communications);
    console.log('Processed with mode:', insights.aiMethod);
    return insights;
  } catch (error) {
    console.error('Dynamic switching failed:', error);
    throw error;
  }
}

/**
 * Utility function to run all examples
 */
export async function runAllExamples() {
  console.log('Available AI processing modes:', getAvailableModes());
  console.log('');
  
  try {
    await exampleAutoProcessing();
    console.log('');
    
    if (isModeAvailable('openai')) {
      await exampleOpenAIProcessing();
      console.log('');
    }
    
    await exampleLocalNLPProcessing();
    console.log('');
    
    await exampleMockProcessing();
    console.log('');
    
    await exampleCustomProcessing();
    console.log('');
    
    await exampleBatchProcessing();
    console.log('');
    
    await exampleDynamicSwitching();
    console.log('');
    
    console.log('All examples completed successfully!');
  } catch (error) {
    console.error('Example execution failed:', error);
  }
}

export default {
  exampleOpenAIProcessing,
  exampleLocalNLPProcessing,
  exampleMockProcessing,
  exampleAutoProcessing,
  exampleCustomProcessing,
  exampleBatchProcessing,
  exampleDynamicSwitching,
  runAllExamples
};
