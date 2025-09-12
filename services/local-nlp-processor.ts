import * as nlp from 'compromise';
import * as Sentiment from 'sentiment';
import { WordTokenizer } from 'natural';
import { differenceInCalendarWeeks, addDays, format } from 'date-fns';

export interface LocalNLPAnalysisResult {
  clientSummary: string;
  communicationFrequency: 'weekly' | 'monthly' | 'quarterly' | 'irregular' | 'insufficient_data';
  sentiment: {
    overall: 'positive' | 'neutral' | 'negative';
    reasoning: string;
    confidenceScore: number;
  };
  investmentProfile: {
    goals: string[];
    riskTolerance: 'conservative' | 'moderate' | 'aggressive' | 'unknown';
    timeHorizon: 'short' | 'medium' | 'long' | 'unknown';
  };
  lifeEvents: string[];
  keyTopics: string[];
  concerns: string[];
  nextBestActions: Array<{
    action: string;
    priority: 'high' | 'medium' | 'low';
    reasoning: string;
  }>;
  relationshipHealth: {
    score: number;
    indicators: string[];
  };
  entities: {
    people: string[];
    organizations: string[];
    dates: string[];
    money: string[];
  };
}

export class LocalNLPProcessor {
  private sentiment = new Sentiment();
  private tokenizer = new WordTokenizer();
  
  // Financial advisor specific keywords
  private readonly FINANCIAL_KEYWORDS = {
    goals: ['retirement', 'college', 'house', 'vacation', 'wedding', 'emergency fund', 'education', 'travel'],
    riskTerms: ['conservative', 'aggressive', 'moderate', 'volatile', 'stable', 'safe', 'risky'],
    products: ['401k', 'ira', 'roth', 'stocks', 'bonds', 'etf', 'mutual fund', 'portfolio', 'investment'],
    lifeEvents: ['marriage', 'divorce', 'birth', 'death', 'job change', 'promotion', 'retirement', 'graduation'],
    concerns: ['worried', 'concerned', 'anxious', 'uncertain', 'confused', 'disappointed', 'frustrated']
  };

  constructor() {
    // Initialize sentiment analyzer and tokenizer
  }

  async analyzeClientCommunications(communications: any[]): Promise<LocalNLPAnalysisResult> {
    if (!communications || communications.length === 0) {
      return this.getEmptyResult();
    }

    try {
      const allText = communications.map(c => `${c.subject || ''} ${c.body || c.bodyPreview || ''}`).join(' ');
      
      // Process with compromise.js for entity extraction
      const doc = nlp(allText);
      
      // Extract entities
      const people = doc.people().out('array');
      const organizations = doc.organizations().out('array');
      const dates = doc.dates().out('array');
      const money = doc.money().out('array');
      
      // Sentiment analysis
      const sentimentResult = this.sentiment.analyze(allText);
      const sentimentScore = this.normalizeSentiment(sentimentResult.comparative);
      
      // Financial-specific analysis
      const investmentProfile = this.analyzeInvestmentProfile(allText);
      const lifeEvents = this.extractLifeEvents(allText);
      const concerns = this.identifyConcerns(communications);
      const topics = this.extractKeyTopics(allText);
      
      // Communication pattern analysis
      const frequency = this.analyzeFrequency(communications);
      
      return {
        clientSummary: this.generateSummary(communications, investmentProfile, sentimentScore),
        communicationFrequency: frequency,
        sentiment: {
          overall: sentimentScore > 0.1 ? 'positive' : sentimentScore < -0.1 ? 'negative' : 'neutral',
          reasoning: this.explainSentiment(sentimentResult),
          confidenceScore: Math.min(Math.abs(sentimentScore) * 2, 1.0)
        },
        investmentProfile,
        lifeEvents,
        keyTopics: topics,
        concerns,
        nextBestActions: this.generateNextActions(investmentProfile, concerns, frequency),
        relationshipHealth: {
          score: this.calculateRelationshipScore(frequency, sentimentScore, concerns.length),
          indicators: this.getRelationshipIndicators(frequency, sentimentScore, communications)
        },
        entities: { people, organizations, dates, money }
      };

    } catch (error) {
      console.error('Local NLP analysis failed:', error);
      return this.getEmptyResult();
    }
  }

  private analyzeInvestmentProfile(text: string): any {
    const lowerText = text.toLowerCase();
    
    const goals = this.FINANCIAL_KEYWORDS.goals.filter(goal => 
      lowerText.includes(goal)
    );
    
    const riskIndicators = this.FINANCIAL_KEYWORDS.riskTerms.filter(term =>
      lowerText.includes(term)
    );
    
    let riskTolerance = 'unknown';
    if (riskIndicators.some(term => ['conservative', 'safe', 'stable'].includes(term))) {
      riskTolerance = 'conservative';
    } else if (riskIndicators.some(term => ['aggressive', 'risky', 'volatile'].includes(term))) {
      riskTolerance = 'aggressive';
    } else if (riskIndicators.includes('moderate')) {
      riskTolerance = 'moderate';
    }
    
    return { 
      goals, 
      riskTolerance, 
      timeHorizon: this.inferTimeHorizon(text) 
    };
  }

  private extractLifeEvents(text: string): string[] {
    return this.FINANCIAL_KEYWORDS.lifeEvents.filter(event =>
      text.toLowerCase().includes(event)
    );
  }

  private identifyConcerns(communications: any[]): string[] {
    const concerns: string[] = [];
    
    communications.forEach(comm => {
      const text = `${comm.subject || ''} ${comm.body || comm.bodyPreview || ''}`.toLowerCase();
      
      // Check for concern keywords
      this.FINANCIAL_KEYWORDS.concerns.forEach(concern => {
        if (text.includes(concern)) {
          concerns.push(`Client expressed ${concern} about ${comm.subject || 'communication'}`);
        }
      });
      
      // Check for question patterns that indicate confusion
      const questionCount = (text.match(/\?/g) || []).length;
      if (questionCount > 2) {
        concerns.push(`Client has multiple questions about: ${comm.subject || 'communication'}`);
      }
    });
    
    return [...new Set(concerns)];
  }

  private extractKeyTopics(text: string): string[] {
    const topics: string[] = [];
    const lowerText = text.toLowerCase();
    
    // Check for financial topics
    Object.entries(this.FINANCIAL_KEYWORDS).forEach(([category, keywords]) => {
      keywords.forEach(keyword => {
        if (lowerText.includes(keyword) && !topics.includes(keyword)) {
          topics.push(keyword);
        }
      });
    });
    
    return topics.slice(0, 8); // Return top 8 topics
  }

  private generateSummary(communications: any[], investmentProfile: any, sentimentScore: number): string {
    const clientName = communications[0]?.sender?.split('@')[0] || 'Client';
    const topGoal = investmentProfile.goals[0] || 'financial planning';
    const sentimentText = sentimentScore > 0 ? 'positive' : sentimentScore < 0 ? 'negative' : 'neutral';
    
    return `${clientName} is actively engaged in ${topGoal} discussions with ${sentimentText} sentiment. Recent communications show ${communications.length} interactions with focus on ${investmentProfile.riskTolerance || 'general'} investment approach.`;
  }

  private generateNextActions(investmentProfile: any, concerns: string[], frequency: string): Array<{
    action: string;
    priority: 'high' | 'medium' | 'low';
    reasoning: string;
  }> {
    const actions: Array<{
      action: string;
      priority: 'high' | 'medium' | 'low';
      reasoning: string;
    }> = [];
    
    if (concerns.length > 0) {
      actions.push({
        action: 'Address client concerns and questions',
        priority: 'high',
        reasoning: 'Client has expressed concerns that need immediate attention'
      });
    }
    
    if (investmentProfile.goals.length > 0) {
      actions.push({
        action: `Review ${investmentProfile.goals[0]} strategy`,
        priority: 'medium',
        reasoning: `Client has specific goal: ${investmentProfile.goals[0]}`
      });
    }
    
    if (frequency === 'irregular') {
      actions.push({
        action: 'Schedule regular check-in meeting',
        priority: 'medium',
        reasoning: 'Communication frequency is irregular - needs more engagement'
      });
    }
    
    actions.push({
      action: 'Send market update and portfolio performance review',
      priority: 'low',
      reasoning: 'Regular proactive communication to maintain engagement'
    });
    
    return actions.slice(0, 4);
  }

  private normalizeSentiment(comparative: number): number {
    return Math.max(-1, Math.min(1, comparative * 5));
  }

  private analyzeFrequency(communications: any[]): 'weekly' | 'monthly' | 'quarterly' | 'irregular' | 'insufficient_data' {
    if (communications.length < 2) return 'insufficient_data';
    
    const dates = communications
      .map(c => new Date(c.timestamp || c.receivedDateTime || 0))
      .sort((a, b) => a.getTime() - b.getTime());
    
    const intervals: number[] = [];
    
    for (let i = 1; i < dates.length; i++) {
      const daysBetween = (dates[i].getTime() - dates[i-1].getTime()) / (1000 * 60 * 60 * 24);
      intervals.push(daysBetween);
    }
    
    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    
    if (avgInterval <= 10) return 'weekly';
    if (avgInterval <= 35) return 'monthly';  
    if (avgInterval <= 100) return 'quarterly';
    return 'irregular';
  }

  private calculateRelationshipScore(frequency: string, sentiment: number, concernCount: number): number {
    let score = 5; // Base score
    
    // Adjust for frequency
    if (frequency === 'weekly') score += 2;
    else if (frequency === 'monthly') score += 1;
    else if (frequency === 'irregular') score -= 1;
    
    // Adjust for sentiment
    score += sentiment * 2;
    
    // Adjust for concerns
    score -= Math.min(concernCount * 0.5, 2);
    
    return Math.max(1, Math.min(10, Math.round(score)));
  }

  private getRelationshipIndicators(frequency: string, sentiment: number, communications: any[]): string[] {
    const indicators: string[] = [];
    
    if (frequency === 'weekly') indicators.push('High engagement frequency');
    if (sentiment > 0.2) indicators.push('Positive communication tone');
    if (sentiment < -0.2) indicators.push('Potential dissatisfaction detected');
    if (communications.length > 10) indicators.push('Long-term client relationship');
    
    return indicators;
  }

  private explainSentiment(result: any): string {
    if (result.score > 2) return 'Positive language and expressions of satisfaction';
    if (result.score < -2) return 'Concerns and negative sentiment detected';
    return 'Neutral, professional tone';
  }

  private inferTimeHorizon(text: string): 'short' | 'medium' | 'long' | 'unknown' {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('retirement') || lowerText.includes('long term')) {
      return 'long';
    } else if (lowerText.includes('house') || lowerText.includes('college')) {
      return 'medium';
    } else if (lowerText.includes('emergency') || lowerText.includes('short term')) {
      return 'short';
    }
    
    return 'unknown';
  }

  private getEmptyResult(): LocalNLPAnalysisResult {
    return {
      clientSummary: 'Unable to analyze communications at this time.',
      communicationFrequency: 'insufficient_data',
      sentiment: {
        overall: 'neutral',
        reasoning: 'Analysis unavailable',
        confidenceScore: 0
      },
      investmentProfile: {
        goals: [],
        riskTolerance: 'unknown',
        timeHorizon: 'unknown'
      },
      lifeEvents: [],
      keyTopics: [],
      concerns: [],
      nextBestActions: [
        {
          action: 'Schedule follow-up call',
          priority: 'medium',
          reasoning: 'Unable to generate specific recommendations at this time'
        }
      ],
      relationshipHealth: {
        score: 5,
        indicators: ['Analysis unavailable']
      },
      entities: {
        people: [],
        organizations: [],
        dates: [],
        money: []
      }
    };
  }
}
