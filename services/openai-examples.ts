/**
 * OpenAI Processor Usage Examples
 * 
 * This file demonstrates how to use the enhanced OpenAI processor
 * for financial advisor client analysis.
 */

import { OpenAIProcessor, OpenAIAnalysisResult } from './openai-processor';

/**
 * Example 1: Basic client communication analysis
 */
export async function exampleBasicAnalysis() {
  console.log('=== Basic Client Analysis Example ===');
  
  const processor = new OpenAIProcessor(process.env.OPENAI_API_KEY || '');
  
  const communications = [
    {
      timestamp: '2024-01-15T10:00:00Z',
      sender: 'John Doe',
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
      sender: 'John Doe',
      subject: 'Meeting Request',
      body: `Hi Sarah,
      
      I hope you're doing well. I'd like to schedule our quarterly review meeting. I have some questions about my 401k allocation and want to discuss my daughter's college fund.
      
      She's starting high school next year, so we need to think about increasing our education savings contributions.
      
      Let me know what works for your schedule.
      
      Thanks,
      John`
    },
    {
      timestamp: '2024-01-05T09:15:00Z',
      sender: 'John Doe',
      subject: 'Market Update Question',
      body: `Sarah,
      
      I saw the news about the Fed's interest rate decision. How do you think this will impact my bond allocation? Should we be making any adjustments?
      
      Also, my wife and I are considering buying a second home as an investment property. What are your thoughts on real estate in our portfolio?
      
      Thanks for your insights.
      
      John`
    }
  ];
  
  try {
    const analysis = await processor.analyzeClientCommunications(communications);
    
    console.log('Analysis Results:');
    console.log('================');
    console.log('Client Summary:', analysis.clientSummary);
    console.log('Communication Frequency:', analysis.communicationFrequency);
    console.log('Sentiment:', analysis.sentiment.overall, `(${analysis.sentiment.confidenceScore})`);
    console.log('Reasoning:', analysis.sentiment.reasoning);
    console.log('Investment Goals:', analysis.investmentProfile.goals);
    console.log('Risk Tolerance:', analysis.investmentProfile.riskTolerance);
    console.log('Time Horizon:', analysis.investmentProfile.timeHorizon);
    console.log('Life Events:', analysis.lifeEvents);
    console.log('Key Topics:', analysis.keyTopics);
    console.log('Concerns:', analysis.concerns);
    console.log('Relationship Health:', analysis.relationshipHealth.score, '/10');
    console.log('Indicators:', analysis.relationshipHealth.indicators);
    console.log('Next Best Actions:');
    analysis.nextBestActions.forEach((action, index) => {
      console.log(`  ${index + 1}. [${action.priority.toUpperCase()}] ${action.action}`);
      console.log(`     Reasoning: ${action.reasoning}`);
    });
    console.log('Tokens Used:', analysis.tokensUsed);
    console.log('Model:', analysis.model);
    
    return analysis;
  } catch (error) {
    console.error('Analysis failed:', error);
    throw error;
  }
}

/**
 * Example 2: Generate executive summary
 */
export async function exampleExecutiveSummary() {
  console.log('\n=== Executive Summary Example ===');
  
  const processor = new OpenAIProcessor(process.env.OPENAI_API_KEY || '');
  
  // First get the analysis
  const communications = [
    {
      timestamp: '2024-01-15T10:00:00Z',
      sender: 'Jane Smith',
      subject: 'Urgent: Market Concerns',
      body: `Hi Michael,
      
      I'm very worried about the recent market downturn. My portfolio has lost 15% in the last month, and I'm losing sleep over this.
      
      Should I move everything to cash? I can't afford to lose more money, especially with my retirement only 5 years away.
      
      I need to speak with you urgently.
      
      Jane`
    }
  ];
  
  try {
    const analysis = await processor.analyzeClientCommunications(communications);
    const summary = await processor.generateInsightSummary(analysis);
    
    console.log('Executive Summary:');
    console.log('==================');
    console.log(summary);
    
    return { analysis, summary };
  } catch (error) {
    console.error('Summary generation failed:', error);
    throw error;
  }
}

/**
 * Example 3: Generate personalized messages
 */
export async function examplePersonalizedMessages() {
  console.log('\n=== Personalized Messages Example ===');
  
  const processor = new OpenAIProcessor(process.env.OPENAI_API_KEY || '');
  
  const communications = [
    {
      timestamp: '2024-01-15T10:00:00Z',
      sender: 'Robert Johnson',
      subject: 'Investment Strategy Discussion',
      body: `Hi Lisa,
      
      I wanted to thank you for the excellent market insights you shared last week. Your analysis of the tech sector was spot-on.
      
      I'm interested in exploring some ESG investment options. My daughter has been educating me about sustainable investing, and I think it aligns with my values.
      
      Could we discuss adding some ESG funds to my portfolio?
      
      Best,
      Robert`
    }
  ];
  
  try {
    const analysis = await processor.analyzeClientCommunications(communications);
    
    // Generate different types of personalized messages
    const followUpMessage = await processor.suggestPersonalizedMessage(analysis, 'follow-up');
    const proactiveMessage = await processor.suggestPersonalizedMessage(analysis, 'proactive');
    const checkInMessage = await processor.suggestPersonalizedMessage(analysis, 'check-in');
    
    console.log('Personalized Messages:');
    console.log('=====================');
    
    console.log('\nFollow-up Message:');
    console.log('------------------');
    console.log(followUpMessage);
    
    console.log('\nProactive Message:');
    console.log('------------------');
    console.log(proactiveMessage);
    
    console.log('\nCheck-in Message:');
    console.log('-----------------');
    console.log(checkInMessage);
    
    return {
      analysis,
      followUpMessage,
      proactiveMessage,
      checkInMessage
    };
  } catch (error) {
    console.error('Message generation failed:', error);
    throw error;
  }
}

/**
 * Example 4: High-priority client analysis
 */
export async function exampleHighPriorityClient() {
  console.log('\n=== High-Priority Client Example ===');
  
  const processor = new OpenAIProcessor(process.env.OPENAI_API_KEY || '');
  
  const communications = [
    {
      timestamp: '2024-01-15T16:30:00Z',
      sender: 'Margaret Williams',
      subject: 'URGENT: Account Review Needed',
      body: `David,
      
      I'm extremely disappointed with my account performance this quarter. My portfolio is down 20% while the market is only down 10%.
      
      I'm questioning your investment strategy and considering moving my accounts elsewhere. This is unacceptable.
      
      I demand a full explanation and a plan to recover these losses immediately.
      
      Margaret Williams`
    },
    {
      timestamp: '2024-01-14T11:00:00Z',
      sender: 'Margaret Williams',
      subject: 'Meeting Cancellation',
      body: `David,
      
      I'm canceling our meeting tomorrow. I need time to review my options and speak with other advisors.
      
      Margaret`
    },
    {
      timestamp: '2024-01-12T09:00:00Z',
      sender: 'Margaret Williams',
      subject: 'Performance Concerns',
      body: `David,
      
      I've been reviewing my quarterly statements and I'm not happy with the results. Can we discuss this?
      
      Margaret`
    }
  ];
  
  try {
    const analysis = await processor.analyzeClientCommunications(communications);
    
    console.log('High-Priority Client Analysis:');
    console.log('==============================');
    console.log('Client Summary:', analysis.clientSummary);
    console.log('Sentiment:', analysis.sentiment.overall, `(${analysis.sentiment.confidenceScore})`);
    console.log('Reasoning:', analysis.sentiment.reasoning);
    console.log('Relationship Health:', analysis.relationshipHealth.score, '/10');
    console.log('Indicators:', analysis.relationshipHealth.indicators);
    console.log('Concerns:', analysis.concerns);
    console.log('High Priority Actions:');
    analysis.nextBestActions
      .filter(action => action.priority === 'high')
      .forEach((action, index) => {
        console.log(`  ${index + 1}. ${action.action}`);
        console.log(`     Reasoning: ${action.reasoning}`);
      });
    
    // Generate urgent message
    const urgentMessage = await processor.suggestPersonalizedMessage(analysis, 'urgent');
    console.log('\nSuggested Urgent Response:');
    console.log('---------------------------');
    console.log(urgentMessage);
    
    return { analysis, urgentMessage };
  } catch (error) {
    console.error('High-priority analysis failed:', error);
    throw error;
  }
}

/**
 * Example 5: Batch processing multiple clients
 */
export async function exampleBatchProcessing() {
  console.log('\n=== Batch Processing Example ===');
  
  const processor = new OpenAIProcessor(process.env.OPENAI_API_KEY || '');
  
  const clients = [
    {
      name: 'Client A',
      communications: [
        {
          timestamp: '2024-01-15T10:00:00Z',
          sender: 'Client A',
          subject: 'Portfolio Review',
          body: 'Hi, I would like to schedule our quarterly review.'
        }
      ]
    },
    {
      name: 'Client B', 
      communications: [
        {
          timestamp: '2024-01-14T14:00:00Z',
          sender: 'Client B',
          subject: 'Investment Questions',
          body: 'I have some questions about my investment allocation.'
        }
      ]
    },
    {
      name: 'Client C',
      communications: [
        {
          timestamp: '2024-01-13T09:00:00Z',
          sender: 'Client C',
          subject: 'Market Concerns',
          body: 'I am worried about the recent market volatility.'
        }
      ]
    }
  ];
  
  try {
    const results = await Promise.all(
      clients.map(async (client) => {
        const analysis = await processor.analyzeClientCommunications(client.communications);
        return {
          clientName: client.name,
          analysis,
          priority: analysis.nextBestActions.some(a => a.priority === 'high') ? 'HIGH' : 'NORMAL'
        };
      })
    );
    
    console.log('Batch Processing Results:');
    console.log('=========================');
    
    results.forEach(result => {
      console.log(`\n${result.clientName} [${result.priority}]:`);
      console.log(`  Sentiment: ${result.analysis.sentiment.overall}`);
      console.log(`  Relationship Health: ${result.analysis.relationshipHealth.score}/10`);
      console.log(`  Key Topics: ${result.analysis.keyTopics.join(', ')}`);
      console.log(`  High Priority Actions: ${result.analysis.nextBestActions.filter(a => a.priority === 'high').length}`);
    });
    
    const highPriorityClients = results.filter(r => r.priority === 'HIGH');
    console.log(`\nSummary: ${highPriorityClients.length} high-priority clients need immediate attention`);
    
    return results;
  } catch (error) {
    console.error('Batch processing failed:', error);
    throw error;
  }
}

/**
 * Example 6: Error handling and fallback
 */
export async function exampleErrorHandling() {
  console.log('\n=== Error Handling Example ===');
  
  // Test with invalid API key
  const processor = new OpenAIProcessor('invalid-api-key');
  
  const communications = [
    {
      timestamp: '2024-01-15T10:00:00Z',
      sender: 'Test Client',
      subject: 'Test Subject',
      body: 'Test content'
    }
  ];
  
  try {
    const analysis = await processor.analyzeClientCommunications(communications);
    console.log('Unexpected success with invalid API key');
    return analysis;
  } catch (error) {
    console.log('Expected error caught:', error instanceof Error ? error.message : String(error));
    
    // Demonstrate fallback handling
    console.log('\nFallback handling:');
    console.log('- Log error for monitoring');
    console.log('- Use cached analysis if available');
    console.log('- Fall back to local NLP processing');
    console.log('- Show user-friendly error message');
    
    return null;
  }
}

/**
 * Utility function to run all examples
 */
export async function runAllOpenAIExamples() {
  console.log('OpenAI Processor Examples');
  console.log('=========================');
  
  try {
    await exampleBasicAnalysis();
    await exampleExecutiveSummary();
    await examplePersonalizedMessages();
    await exampleHighPriorityClient();
    await exampleBatchProcessing();
    await exampleErrorHandling();
    
    console.log('\n✅ All examples completed successfully!');
  } catch (error) {
    console.error('❌ Example execution failed:', error);
  }
}

export default {
  exampleBasicAnalysis,
  exampleExecutiveSummary,
  examplePersonalizedMessages,
  exampleHighPriorityClient,
  exampleBatchProcessing,
  exampleErrorHandling,
  runAllOpenAIExamples
};
