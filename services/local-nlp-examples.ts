/**
 * Local NLP Processor Usage Examples
 * 
 * This file demonstrates how to use the enhanced Local NLP processor
 * for sophisticated analysis without external API dependencies.
 */

import { LocalNLPProcessor, LocalNLPAnalysisResult } from './local-nlp-processor';

/**
 * Example 1: Basic client communication analysis
 */
export async function exampleBasicLocalNLPAnalysis() {
  console.log('=== Local NLP Basic Analysis Example ===');
  
  const processor = new LocalNLPProcessor();
  
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
    },
    {
      timestamp: '2024-01-05T09:15:00Z',
      sender: 'John Smith',
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
    
    console.log('Local NLP Analysis Results:');
    console.log('==========================');
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
    console.log('Entities:');
    console.log('  People:', analysis.entities.people);
    console.log('  Organizations:', analysis.entities.organizations);
    console.log('  Dates:', analysis.entities.dates);
    console.log('  Money:', analysis.entities.money);
    
    return analysis;
  } catch (error) {
    console.error('Local NLP analysis failed:', error);
    throw error;
  }
}

/**
 * Example 2: High-concern client analysis
 */
export async function exampleHighConcernClient() {
  console.log('\n=== High Concern Client Analysis ===');
  
  const processor = new LocalNLPProcessor();
  
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
    }
  ];
  
  try {
    const analysis = await processor.analyzeClientCommunications(communications);
    
    console.log('High Concern Client Analysis:');
    console.log('=============================');
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
    
    return analysis;
  } catch (error) {
    console.error('High concern analysis failed:', error);
    throw error;
  }
}

/**
 * Example 3: Life events analysis
 */
export async function exampleLifeEventsAnalysis() {
  console.log('\n=== Life Events Analysis ===');
  
  const processor = new LocalNLPProcessor();
  
  const communications = [
    {
      timestamp: '2024-01-15T10:00:00Z',
      sender: 'Robert Johnson',
      subject: 'Wedding Planning and Financial Goals',
      body: `Hi Lisa,
      
      I wanted to update you on some exciting news! I'm getting married in June and we're planning our honeymoon to Europe.
      
      With the wedding expenses and our honeymoon, I want to make sure we're still on track for our retirement goals. We're also thinking about starting a family soon, so we'll need to consider college savings.
      
      Can we schedule a meeting to review our financial plan and make any necessary adjustments?
      
      Best,
      Robert`
    },
    {
      timestamp: '2024-01-10T14:00:00Z',
      sender: 'Robert Johnson',
      subject: 'Job Promotion Update',
      body: `Lisa,
      
      Great news! I got promoted to Senior Manager and will be getting a significant salary increase. This should help with our wedding and future savings goals.
      
      I'd like to discuss how this impacts our investment strategy and whether we should increase our 401k contributions.
      
      Thanks,
      Robert`
    }
  ];
  
  try {
    const analysis = await processor.analyzeClientCommunications(communications);
    
    console.log('Life Events Analysis:');
    console.log('====================');
    console.log('Client Summary:', analysis.clientSummary);
    console.log('Life Events:', analysis.lifeEvents);
    console.log('Investment Goals:', analysis.investmentProfile.goals);
    console.log('Time Horizon:', analysis.investmentProfile.timeHorizon);
    console.log('Sentiment:', analysis.sentiment.overall);
    console.log('Key Topics:', analysis.keyTopics);
    console.log('Recommended Actions:');
    analysis.nextBestActions.forEach((action, index) => {
      console.log(`  ${index + 1}. [${action.priority.toUpperCase()}] ${action.action}`);
      console.log(`     Reasoning: ${action.reasoning}`);
    });
    
    return analysis;
  } catch (error) {
    console.error('Life events analysis failed:', error);
    throw error;
  }
}

/**
 * Example 4: Risk tolerance analysis
 */
export async function exampleRiskToleranceAnalysis() {
  console.log('\n=== Risk Tolerance Analysis ===');
  
  const processor = new LocalNLPProcessor();
  
  const communications = [
    {
      timestamp: '2024-01-15T10:00:00Z',
      sender: 'Susan Chen',
      subject: 'Conservative Investment Strategy',
      body: `Hi Michael,
      
      I've been thinking about our recent conversation about my portfolio allocation. I'm feeling anxious about the market volatility and would prefer a more conservative approach.
      
      I understand that this might mean lower returns, but I value stability and safety over aggressive growth. I can't afford to lose money, especially with my retirement only 5 years away.
      
      Can we discuss moving more of my investments to bonds and stable, dividend-paying stocks?
      
      Thanks,
      Susan`
    },
    {
      timestamp: '2024-01-12T15:30:00Z',
      sender: 'Susan Chen',
      subject: 'Market Volatility Concerns',
      body: `Michael,
      
      The recent market downturn has me very worried. I'm losing sleep over my portfolio losses.
      
      I think we need to take a much more conservative approach. I'd rather have slower, steady growth than these dramatic ups and downs.
      
      Please call me when you have a chance.
      
      Susan`
    }
  ];
  
  try {
    const analysis = await processor.analyzeClientCommunications(communications);
    
    console.log('Risk Tolerance Analysis:');
    console.log('========================');
    console.log('Client Summary:', analysis.clientSummary);
    console.log('Risk Tolerance:', analysis.investmentProfile.riskTolerance);
    console.log('Time Horizon:', analysis.investmentProfile.timeHorizon);
    console.log('Sentiment:', analysis.sentiment.overall, `(${analysis.sentiment.confidenceScore})`);
    console.log('Reasoning:', analysis.sentiment.reasoning);
    console.log('Concerns:', analysis.concerns);
    console.log('Key Topics:', analysis.keyTopics);
    console.log('Relationship Health:', analysis.relationshipHealth.score, '/10');
    console.log('Indicators:', analysis.relationshipHealth.indicators);
    
    return analysis;
  } catch (error) {
    console.error('Risk tolerance analysis failed:', error);
    throw error;
  }
}

/**
 * Example 5: Entity extraction demonstration
 */
export async function exampleEntityExtraction() {
  console.log('\n=== Entity Extraction Example ===');
  
  const processor = new LocalNLPProcessor();
  
  const communications = [
    {
      timestamp: '2024-01-15T10:00:00Z',
      sender: 'David Thompson',
      subject: 'Investment Portfolio Review',
      body: `Hi Jennifer,
      
      I wanted to discuss my portfolio with you. I've been working with Microsoft for 15 years and have accumulated $500,000 in my 401k.
      
      My wife Sarah and I are planning to retire in 10 years and want to make sure we're on track. We're also considering buying a vacation home in Florida for $300,000.
      
      Can we schedule a meeting for next Tuesday, January 23rd at 2:00 PM?
      
      Best regards,
      David`
    }
  ];
  
  try {
    const analysis = await processor.analyzeClientCommunications(communications);
    
    console.log('Entity Extraction Results:');
    console.log('==========================');
    console.log('People Mentioned:', analysis.entities.people);
    console.log('Organizations:', analysis.entities.organizations);
    console.log('Dates:', analysis.entities.dates);
    console.log('Money Amounts:', analysis.entities.money);
    console.log('Key Topics:', analysis.keyTopics);
    console.log('Investment Goals:', analysis.investmentProfile.goals);
    
    return analysis;
  } catch (error) {
    console.error('Entity extraction failed:', error);
    throw error;
  }
}

/**
 * Example 6: Communication frequency analysis
 */
export async function exampleFrequencyAnalysis() {
  console.log('\n=== Communication Frequency Analysis ===');
  
  const processor = new LocalNLPProcessor();
  
  // Weekly communicator
  const weeklyCommunications = [
    {
      timestamp: '2024-01-15T10:00:00Z',
      sender: 'Client A',
      subject: 'Weekly Update',
      body: 'Hi, checking in on my portfolio performance.'
    },
    {
      timestamp: '2024-01-08T10:00:00Z',
      sender: 'Client A',
      subject: 'Weekly Update',
      body: 'Hi, checking in on my portfolio performance.'
    },
    {
      timestamp: '2024-01-01T10:00:00Z',
      sender: 'Client A',
      subject: 'Weekly Update',
      body: 'Hi, checking in on my portfolio performance.'
    }
  ];
  
  // Irregular communicator
  const irregularCommunications = [
    {
      timestamp: '2024-01-15T10:00:00Z',
      sender: 'Client B',
      subject: 'Question',
      body: 'I have a question about my investments.'
    },
    {
      timestamp: '2023-11-01T10:00:00Z',
      sender: 'Client B',
      subject: 'Another Question',
      body: 'Another question about my portfolio.'
    }
  ];
  
  try {
    console.log('Weekly Communicator:');
    const weeklyAnalysis = await processor.analyzeClientCommunications(weeklyCommunications);
    console.log('Frequency:', weeklyAnalysis.communicationFrequency);
    console.log('Relationship Health:', weeklyAnalysis.relationshipHealth.score, '/10');
    console.log('Indicators:', weeklyAnalysis.relationshipHealth.indicators);
    
    console.log('\nIrregular Communicator:');
    const irregularAnalysis = await processor.analyzeClientCommunications(irregularCommunications);
    console.log('Frequency:', irregularAnalysis.communicationFrequency);
    console.log('Relationship Health:', irregularAnalysis.relationshipHealth.score, '/10');
    console.log('Indicators:', irregularAnalysis.relationshipHealth.indicators);
    console.log('Recommended Actions:');
    irregularAnalysis.nextBestActions.forEach((action, index) => {
      console.log(`  ${index + 1}. [${action.priority.toUpperCase()}] ${action.action}`);
    });
    
    return { weeklyAnalysis, irregularAnalysis };
  } catch (error) {
    console.error('Frequency analysis failed:', error);
    throw error;
  }
}

/**
 * Utility function to run all examples
 */
export async function runAllLocalNLPExamples() {
  console.log('Local NLP Processor Examples');
  console.log('============================');
  
  try {
    await exampleBasicLocalNLPAnalysis();
    await exampleHighConcernClient();
    await exampleLifeEventsAnalysis();
    await exampleRiskToleranceAnalysis();
    await exampleEntityExtraction();
    await exampleFrequencyAnalysis();
    
    console.log('\n✅ All Local NLP examples completed successfully!');
  } catch (error) {
    console.error('❌ Example execution failed:', error);
  }
}

export default {
  exampleBasicLocalNLPAnalysis,
  exampleHighConcernClient,
  exampleLifeEventsAnalysis,
  exampleRiskToleranceAnalysis,
  exampleEntityExtraction,
  exampleFrequencyAnalysis,
  runAllLocalNLPExamples
};
