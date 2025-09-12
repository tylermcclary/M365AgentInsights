import { AIProcessingMode, AIProcessingConfig, EnhancedClientInsights } from '@/types';
import { generateAIInsights, analyzeText } from './ai-enhanced';
import { analyzeClientCommunications } from './ai-insights';
import { OpenAIProcessor, OpenAIAnalysisResult } from './openai-processor';
import { LocalNLPProcessor, LocalNLPAnalysisResult } from './local-nlp-processor';
import { createSafeAIConfig, validateAIMode, logAIConfig, ExtendedAIProcessingConfig } from '@/lib/ai-config';

export class AIProcessingManager {
  private config: ExtendedAIProcessingConfig;
  private openaiProcessor?: OpenAIProcessor;
  private nlpProcessor?: LocalNLPProcessor;
  
  constructor(config?: Partial<ExtendedAIProcessingConfig>) {
    // Use safe configuration with validation and fallbacks
    this.config = createSafeAIConfig(config);
    
    // Log configuration in debug mode
    logAIConfig();
    
    this.initializeProcessors();
  }
  
  private initializeProcessors() {
    // Validate mode before initializing processors
    if (!validateAIMode(this.config.mode)) {
      console.warn(`Invalid AI mode '${this.config.mode}', falling back to mock`);
      this.config.mode = 'mock';
    }
    
    // Initialize OpenAI processor if mode is openai and API key is available
    if (this.config.mode === 'openai' && process.env.OPENAI_API_KEY) {
      try {
        this.openaiProcessor = new OpenAIProcessor(process.env.OPENAI_API_KEY);
        console.log('✅ OpenAI processor initialized successfully');
      } catch (error) {
        console.error('❌ Failed to initialize OpenAI processor:', error);
        if (this.config.fallbackToMock) {
          console.log('🔄 Falling back to mock mode due to OpenAI initialization failure');
          this.config.mode = 'mock';
        }
      }
    }
    
    // Initialize NLP processor if mode is nlp
    if (this.config.mode === 'nlp') {
      try {
        this.nlpProcessor = new LocalNLPProcessor();
        console.log('✅ Local NLP processor initialized successfully');
      } catch (error) {
        console.error('❌ Failed to initialize Local NLP processor:', error);
        if (this.config.fallbackToMock) {
          console.log('🔄 Falling back to mock mode due to NLP initialization failure');
          this.config.mode = 'mock';
        }
      }
    }
  }
  
  async processClientCommunications(
    clientEmail: string, 
    communications: any[]
  ): Promise<EnhancedClientInsights> {
    const startTime = Date.now();
    let lastError: Error | null = null;
    
    // Validate input
    if (!clientEmail || !communications || communications.length === 0) {
      throw new Error('Invalid input: clientEmail and communications are required');
    }
    
    // Try processing with retries
    for (let attempt = 1; attempt <= (this.config.maxRetries || 1); attempt++) {
      try {
        console.log(`🔄 Processing attempt ${attempt}/${this.config.maxRetries || 1} with ${this.config.mode} mode`);
        
        let insights;
        
        switch (this.config.mode) {
          case 'openai':
            if (!this.openaiProcessor) {
              throw new Error('OpenAI processor not initialized. Check API key and configuration.');
            }
            insights = await this.processWithOpenAI(communications);
            break;
            
          case 'nlp':
            if (!this.nlpProcessor) {
              throw new Error('Local NLP processor not initialized.');
            }
            insights = await this.processWithLocalNLP(communications);
            break;
            
          case 'mock':
          default:
            insights = await this.processWithMockAI(clientEmail, communications);
            break;
        }
        
        const processingTime = Date.now() - startTime;
        
        const result = {
          ...insights,
          processingMetrics: {
            processingTime,
            method: this.config.mode,
            confidence: this.calculateConfidence(insights, this.config.mode),
            tokensUsed: (insights as any).tokensUsed || 0
          },
          aiMethod: this.config.mode
        } as EnhancedClientInsights;
        
        console.log(`✅ Processing completed in ${processingTime}ms with ${this.config.mode} mode`);
        return result;
        
      } catch (error) {
        lastError = error as Error;
        console.error(`❌ Processing attempt ${attempt} failed:`, error);
        
        // If this is not the last attempt, wait before retrying
        if (attempt < (this.config.maxRetries || 1)) {
          const waitTime = Math.min(1000 * attempt, 3000); // Exponential backoff, max 3s
          console.log(`⏳ Waiting ${waitTime}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
      }
    }
    
    // All attempts failed, try fallback if enabled
    if (this.config.fallbackToMock && this.config.mode !== 'mock') {
      console.log('🔄 All attempts failed, falling back to mock AI processing');
      try {
        const fallbackInsights = await this.processWithMockAI(clientEmail, communications);
        const processingTime = Date.now() - startTime;
        
        return {
          ...fallbackInsights,
          processingMetrics: {
            processingTime,
            method: 'mock',
            confidence: 0.5,
            tokensUsed: 0
          },
          aiMethod: 'mock'
        } as EnhancedClientInsights;
      } catch (fallbackError) {
        console.error('❌ Fallback processing also failed:', fallbackError);
        throw new Error(`AI processing failed: ${lastError?.message}. Fallback also failed: ${fallbackError}`);
      }
    }
    
    // No fallback available, throw the last error
    throw new Error(`AI processing failed after ${this.config.maxRetries || 1} attempts: ${lastError?.message}`);
  }
  
  private async processWithOpenAI(communications: any[]) {
    try {
      if (!this.openaiProcessor) {
        throw new Error('OpenAI processor not initialized');
      }
      
      // Use the enhanced OpenAI processor
      const analysis: OpenAIAnalysisResult = await this.openaiProcessor.analyzeClientCommunications(communications);
      
      // Transform OpenAI result to EnhancedClientInsights format
      return {
        summary: {
          text: analysis.clientSummary,
          topics: analysis.keyTopics,
          sentiment: analysis.sentiment.overall,
          frequencyPerWeek: this.mapFrequencyToNumber(analysis.communicationFrequency)
        },
        lastInteraction: this.extractLastInteraction(communications),
        recommendedActions: analysis.nextBestActions.map((action, index) => ({
          id: `openai-action-${index}`,
          title: action.action,
          rationale: action.reasoning,
          priority: action.priority as 'low' | 'medium' | 'high',
          dueDate: undefined // OpenAI doesn't provide due dates in current format
        })),
        highlights: [
          ...analysis.concerns.map(concern => ({ label: 'Concern', value: concern })),
          ...analysis.lifeEvents.map(event => ({ label: 'Life Event', value: event })),
          { label: 'Relationship Health', value: `${analysis.relationshipHealth.score}/10` },
          { label: 'Risk Tolerance', value: analysis.investmentProfile.riskTolerance },
          { label: 'Investment Goals', value: analysis.investmentProfile.goals.join(', ') }
        ].slice(0, 5), // Limit to 5 highlights
        tokensUsed: analysis.tokensUsed || 0
      };
    } catch (error) {
      console.error('OpenAI processing failed:', error);
      throw error;
    }
  }
  
  private async processWithLocalNLP(communications: any[]) {
    try {
      if (!this.nlpProcessor) {
        this.nlpProcessor = new LocalNLPProcessor();
      }
      
      // Use the enhanced Local NLP processor
      const analysis: LocalNLPAnalysisResult = await this.nlpProcessor.analyzeClientCommunications(communications);
      
      // Transform Local NLP result to EnhancedClientInsights format
      return {
        summary: {
          text: analysis.clientSummary,
          topics: analysis.keyTopics,
          sentiment: analysis.sentiment.overall,
          frequencyPerWeek: this.mapFrequencyToNumber(analysis.communicationFrequency)
        },
        lastInteraction: this.extractLastInteraction(communications),
        recommendedActions: analysis.nextBestActions.map((action, index) => ({
          id: `nlp-action-${index}`,
          title: action.action,
          rationale: action.reasoning,
          priority: action.priority as 'low' | 'medium' | 'high',
          dueDate: undefined // Local NLP doesn't provide due dates
        })),
        highlights: [
          ...analysis.concerns.map(concern => ({ label: 'Concern', value: concern })),
          ...analysis.lifeEvents.map(event => ({ label: 'Life Event', value: event })),
          { label: 'Relationship Health', value: `${analysis.relationshipHealth.score}/10` },
          { label: 'Risk Tolerance', value: analysis.investmentProfile.riskTolerance },
          { label: 'Investment Goals', value: analysis.investmentProfile.goals.join(', ') },
          ...analysis.entities.people.slice(0, 2).map(person => ({ label: 'Person Mentioned', value: person })),
          ...analysis.entities.money.slice(0, 1).map(money => ({ label: 'Financial Amount', value: money }))
        ].slice(0, 5), // Limit to 5 highlights
        tokensUsed: 0
      };
    } catch (error) {
      console.error('Local NLP processing failed:', error);
      throw error;
    }
  }
  
  private async processWithMockAI(clientEmail: string, communications: any[]) {
    // Use the existing mock AI logic
    const result = analyzeClientCommunications(clientEmail, communications);
    return {
      ...result,
      tokensUsed: 0
    };
  }
  
  private calculateConfidence(insights: any, method: AIProcessingMode): number {
    switch (method) {
      case 'openai':
        return 0.9; // High confidence for GPT models
      case 'nlp':
        return 0.7; // Medium confidence for local NLP
      case 'mock':
        return 0.5; // Lower confidence for rule-based
      default:
        return 0.5;
    }
  }
  
  private extractLastInteraction(communications: any[]) {
    if (!communications || communications.length === 0) {
      return null;
    }
    
    const latest = communications.sort((a, b) => {
      const timeA = new Date(a.timestamp || a.receivedDateTime || a.createdDateTime || 0).getTime();
      const timeB = new Date(b.timestamp || b.receivedDateTime || b.createdDateTime || 0).getTime();
      return timeB - timeA;
    })[0];
    
    return {
      when: latest.timestamp || latest.receivedDateTime || latest.createdDateTime || new Date().toISOString(),
      type: latest.type || 'email' as 'email' | 'event' | 'chat',
      subject: latest.subject || latest.summary || '',
      snippet: (latest.body || latest.bodyPreview || latest.preview || '').substring(0, 140)
    };
  }
  
  private generateHighlights(textAnalysis: any, aiInsights: any[]) {
    const highlights = [];
    
    // Add sentiment highlights
    if (textAnalysis.sentiment.comparative > 0.3) {
      highlights.push({
        label: 'Sentiment',
        value: 'Very positive communication tone'
      });
    } else if (textAnalysis.sentiment.comparative < -0.3) {
      highlights.push({
        label: 'Sentiment',
        value: 'Concerning communication tone - attention needed'
      });
    }
    
    // Add topic highlights
    if (textAnalysis.entities.topics.length > 0) {
      highlights.push({
        label: 'Key Topics',
        value: textAnalysis.entities.topics.slice(0, 3).join(', ')
      });
    }
    
    // Add entity highlights
    if (textAnalysis.entities.people.length > 0) {
      highlights.push({
        label: 'People Mentioned',
        value: textAnalysis.entities.people.slice(0, 2).join(', ')
      });
    }
    
    if (textAnalysis.entities.organizations.length > 0) {
      highlights.push({
        label: 'Organizations',
        value: textAnalysis.entities.organizations.slice(0, 2).join(', ')
      });
    }
    
    // Add AI insight highlights
    const highPriorityInsights = aiInsights.filter(insight => 
      insight.priority === 'high' || insight.priority === 'urgent'
    );
    
    if (highPriorityInsights.length > 0) {
      highlights.push({
        label: 'Priority Actions',
        value: `${highPriorityInsights.length} high-priority items identified`
      });
    }
    
    return highlights.slice(0, 5); // Limit to 5 highlights
  }
  
  private generateNLPRecommendations(textAnalysis: any) {
    const recommendations = [];
    
    // Sentiment-based recommendations
    if (textAnalysis.sentiment.comparative < -0.2) {
      recommendations.push({
        id: 'nlp-sentiment-1',
        title: 'Address Client Concerns',
        rationale: 'Negative sentiment detected - schedule follow-up call',
        priority: 'high' as 'low' | 'medium' | 'high',
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      });
    }
    
    // Topic-based recommendations
    if (textAnalysis.entities.topics.includes('risk')) {
      recommendations.push({
        id: 'nlp-risk-1',
        title: 'Risk Assessment Review',
        rationale: 'Risk-related discussions detected - review risk tolerance',
        priority: 'medium' as 'low' | 'medium' | 'high',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      });
    }
    
    if (textAnalysis.entities.topics.includes('meeting')) {
      recommendations.push({
        id: 'nlp-meeting-1',
        title: 'Schedule Follow-up Meeting',
        rationale: 'Meeting-related discussions detected - schedule follow-up',
        priority: 'medium' as 'low' | 'medium' | 'high',
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      });
    }
    
    // Default recommendation
    if (recommendations.length === 0) {
      recommendations.push({
        id: 'nlp-default-1',
        title: 'Regular Check-in',
        rationale: 'Maintain regular communication cadence',
        priority: 'low' as 'low' | 'medium' | 'high',
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      });
    }
    
    return recommendations;
  }
  
  private calculateFrequency(communications: any[]): number {
    if (communications.length < 2) {
      return communications.length;
    }
    
    const timestamps = communications
      .map(c => new Date(c.timestamp || c.receivedDateTime || c.createdDateTime || 0))
      .sort((a, b) => a.getTime() - b.getTime());
    
    const daysDiff = (timestamps[timestamps.length - 1].getTime() - timestamps[0].getTime()) / (1000 * 60 * 60 * 24);
    const weeks = Math.max(1, daysDiff / 7);
    
    return Math.round((communications.length / weeks) * 10) / 10;
  }
  
  private mapFrequencyToNumber(frequency: 'weekly' | 'monthly' | 'quarterly' | 'irregular' | 'insufficient_data'): number {
    switch (frequency) {
      case 'weekly': return 1.0;
      case 'monthly': return 0.25;
      case 'quarterly': return 0.08;
      case 'irregular': return 0.1;
      case 'insufficient_data': return 0;
      default: return 0.1;
    }
  }
  
  /**
   * Updates the AI processing configuration
   */
  updateConfig(newConfig: Partial<ExtendedAIProcessingConfig>) {
    const oldMode = this.config.mode;
    this.config = createSafeAIConfig({ ...this.config, ...newConfig });
    
    // Re-initialize processors if mode changed
    if (oldMode !== this.config.mode) {
      console.log(`🔄 AI mode changed from '${oldMode}' to '${this.config.mode}'`);
      this.initializeProcessors();
    }
  }
  
  /**
   * Gets the current configuration
   */
  getCurrentConfig(): ExtendedAIProcessingConfig {
    return { ...this.config };
  }
  
  /**
   * Gets the current AI processing mode
   */
  getCurrentMode(): AIProcessingMode {
    return this.config.mode;
  }
}