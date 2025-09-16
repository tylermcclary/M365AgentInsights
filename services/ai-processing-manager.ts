import { AIProcessingMode, AIProcessingConfig, EnhancedClientInsights } from '@/types';
import { generateAIInsights, analyzeText } from './ai-enhanced';
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
    
    console.log('🤖 AIProcessingManager: Starting analysis for client:', clientEmail);
    console.log('🤖 AIProcessingManager: Communications count:', communications?.length || 0);
    console.log('🤖 AIProcessingManager: Current mode:', this.config.mode);
    
    // Enhanced input validation
    if (!clientEmail) {
      const error = new Error('Invalid input: clientEmail is required');
      console.error('🤖 AIProcessingManager: Validation failed:', error.message);
      throw error;
    }
    
    if (!communications || !Array.isArray(communications)) {
      const error = new Error('Invalid input: communications must be a non-empty array');
      console.error('🤖 AIProcessingManager: Validation failed:', error.message);
      throw error;
    }
    
    if (communications.length === 0) {
      console.warn('🤖 AIProcessingManager: No communications provided, will create fallback analysis');
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
              this.nlpProcessor = new LocalNLPProcessor();
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
    console.log('🤖 AIProcessingManager: Starting Enhanced Local NLP processing with', communications?.length, 'communications');
    try {
      if (!this.nlpProcessor) {
        console.log('🤖 AIProcessingManager: Initializing new LocalNLPProcessor');
        this.nlpProcessor = new LocalNLPProcessor();
      }
      
      console.log('🤖 AIProcessingManager: Calling LocalNLPProcessor.analyzeClientCommunications');
      // Use the enhanced Local NLP processor
      const analysis: LocalNLPAnalysisResult = await this.nlpProcessor.analyzeClientCommunications(communications);
      console.log('🤖 AIProcessingManager: Local NLP analysis completed:', analysis);
      
      // Enhanced NLP processing using the same robust logic as Mock AI
      const clientName = this.extractClientName(communications) || 'Client';
      const hasUrgentKeywords = communications.some(c => 
        /urgent|asap|immediately|emergency/i.test(c.subject || '') || 
        /urgent|asap|immediately|emergency/i.test(c.body || '')
      );
      
      const hasQuestions = communications.some(c => 
        (c.body || '').includes('?') || (c.subject || '').includes('?')
      );
      
      // Generate enhanced insights using the same intelligent logic as Mock AI
      const enhancedInsights = this.generateIntelligentInsights(communications, clientName, 'nlp', hasUrgentKeywords, hasQuestions);
      
      // Combine NLP analysis with enhanced insights
      const communicationPatterns = this.analyzeCommunicationPatterns(communications);
      
      // Create enhanced summary that combines NLP analysis with intelligent insights
      const enhancedSummary = this.createEnhancedNLPSummary(analysis, enhancedInsights, communicationPatterns, hasUrgentKeywords, hasQuestions);
      
      // Transform Local NLP result to EnhancedClientInsights format with improvements
      return {
        summary: {
          text: enhancedSummary,
          topics: enhancedInsights.topics,
          sentiment: enhancedInsights.sentiment,
          frequencyPerWeek: enhancedInsights.frequencyPerWeek
        },
        lastInteraction: this.extractLastInteraction(communications),
        recommendedActions: this.generateIntelligentActions(communications, enhancedInsights, hasUrgentKeywords, hasQuestions),
        highlights: this.generateIntelligentHighlights(communications, enhancedInsights, communicationPatterns),
        tokensUsed: 0
      };
    } catch (error) {
      console.error('🤖 AIProcessingManager: Local NLP processing failed:', error);
      console.error('🤖 AIProcessingManager: Error details:', error instanceof Error ? error.message : error);
      console.error('🤖 AIProcessingManager: Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      throw error;
    }
  }
  
  private async processWithMockAI(clientEmail: string, communications: any[]) {
    // Generate mock insights based on the communications and current mode
    const clientName = clientEmail.split('@')[0] || 'Client';
    const commCount = communications.length;
    const currentMode = this.config.mode;
    
    console.log(`🤖 MockAI: Processing with mode ${currentMode} for client ${clientName}`);
    
    // Generate different insights based on communication patterns
    const hasUrgentKeywords = communications.some(c => 
      /urgent|asap|immediately|emergency/i.test(c.subject || '') || 
      /urgent|asap|immediately|emergency/i.test(c.body || '')
    );
    
    const hasQuestions = communications.some(c => 
      (c.body || '').includes('?') || (c.subject || '').includes('?')
    );
    
    // Generate mode-specific insights
    let modeSpecificText = '';
    let modeSpecificTopics: string[] = [];
    let modeSpecificSentiment: 'positive' | 'neutral' | 'negative' = 'positive';
    
    switch (currentMode) {
      case 'openai':
        modeSpecificText = `[OpenAI Analysis] Advanced AI processing detected ${hasUrgentKeywords ? 'high-priority concerns' : 'standard engagement patterns'}. `;
        modeSpecificTopics = hasUrgentKeywords ? ['urgent', 'priority', 'response', 'ai-analysis'] : ['portfolio', 'meeting', 'performance', 'ai-insights'];
        modeSpecificSentiment = hasUrgentKeywords ? 'negative' : 'positive';
        break;
      case 'nlp':
        modeSpecificText = `[NLP Analysis] Natural language processing identified ${hasUrgentKeywords ? 'urgent communication patterns' : 'normal communication flow'}. `;
        modeSpecificTopics = hasUrgentKeywords ? ['urgent', 'priority', 'nlp-analysis'] : ['portfolio', 'meeting', 'nlp-insights'];
        modeSpecificSentiment = hasUrgentKeywords ? 'negative' : 'neutral';
        break;
      case 'mock':
      default:
        modeSpecificText = `[Mock Analysis] Rule-based processing shows ${hasUrgentKeywords ? 'urgent matters requiring attention' : 'standard communication patterns'}. `;
        modeSpecificTopics = hasUrgentKeywords ? ['urgent', 'priority', 'mock-analysis'] : ['portfolio', 'meeting', 'mock-insights'];
        modeSpecificSentiment = hasUrgentKeywords ? 'negative' : 'positive';
        break;
    }
    
    // Generate more intelligent and specific insights
    const insights = this.generateIntelligentInsights(communications, clientName, currentMode, hasUrgentKeywords, hasQuestions);
    
    const mockInsights = {
      summary: {
        text: insights.summary,
        topics: insights.topics,
        sentiment: insights.sentiment,
        frequencyPerWeek: insights.frequencyPerWeek
      },
      lastInteraction: communications.length > 0 ? {
        when: communications[0].timestamp || new Date().toISOString(),
        type: communications[0].type || 'email',
        subject: communications[0].subject || 'Recent communication',
        snippet: communications[0].body?.substring(0, 100) || 'No content available'
      } : null,
      recommendedActions: this.generateIntelligentActions(communications, insights, hasUrgentKeywords, hasQuestions),
      highlights: this.generateIntelligentHighlights(communications, insights, this.analyzeCommunicationPatterns(communications)),
      tokensUsed: 0
    };
    
    return mockInsights;
  }
  
  private extractClientName(communications: any[]): string | null {
    if (!communications || communications.length === 0) return null;
    
    // Try to extract client name from the first communication
    const firstComm = communications[0];
    if (firstComm.from) {
      // Extract name from email address
      const emailMatch = firstComm.from.match(/^([^@]+)@/);
      if (emailMatch) {
        const emailPart = emailMatch[1];
        // Convert email part to a more readable name
        return emailPart.split('.').map((part: string) => 
          part.charAt(0).toUpperCase() + part.slice(1)
        ).join(' ');
      }
    }
    
    return null;
  }

  private createEnhancedNLPSummary(
    nlpAnalysis: any,
    enhancedInsights: any,
    communicationPatterns: any,
    hasUrgentKeywords: boolean,
    hasQuestions: boolean
  ): string {
    console.log('🧠 Creating enhanced NLP summary combining analysis with intelligent insights');
    
    // Start with NLP-specific prefix
    let summary = '[Enhanced NLP Analysis] ';
    
    // Use the enhanced insights for the main content
    summary += enhancedInsights.summary;
    
    // Add NLP-specific insights if available
    if (nlpAnalysis.concerns && nlpAnalysis.concerns.length > 0) {
      summary += ` NLP detected specific concerns: ${nlpAnalysis.concerns.slice(0, 2).join(', ')}.`;
    }
    
    if (nlpAnalysis.lifeEvents && nlpAnalysis.lifeEvents.length > 0) {
      summary += ` Life events identified: ${nlpAnalysis.lifeEvents.slice(0, 2).join(', ')}.`;
    }
    
    if (nlpAnalysis.entities && nlpAnalysis.entities.people && nlpAnalysis.entities.people.length > 0) {
      summary += ` Key people mentioned: ${nlpAnalysis.entities.people.slice(0, 2).join(', ')}.`;
    }
    
    // Add relationship health from NLP analysis
    if (nlpAnalysis.relationshipHealth && nlpAnalysis.relationshipHealth.score) {
      summary += ` Relationship health score: ${nlpAnalysis.relationshipHealth.score}/10.`;
    }
    
    return summary.trim();
  }

  private calculateConfidence(insights: any, method: AIProcessingMode): number {
    switch (method) {
      case 'openai':
        return 0.9; // High confidence for GPT models
      case 'nlp':
        return 0.8; // Higher confidence for enhanced NLP
      case 'mock':
        return 0.5; // Lower confidence for rule-based
      default:
        return 0.5;
    }
  }

  private generateIntelligentInsights(
    communications: any[],
    clientName: string,
    mode: AIProcessingMode,
    hasUrgentKeywords: boolean,
    hasQuestions: boolean
  ) {
    console.log('🧠 Generating intelligent insights for client:', clientName);
    
    // Analyze communication patterns and content
    const analysis = this.analyzeCommunicationPatterns(communications);
    
    // Build contextual summary based on actual content
    let summary = this.buildContextualSummary(clientName, analysis, mode, hasUrgentKeywords, hasQuestions);
    
    // Extract meaningful topics from actual content
    const topics = this.extractMeaningfulTopics(communications, analysis);
    
    // Determine sentiment based on content analysis
    const sentiment = this.determineSentimentFromContent(communications, analysis);
    
    // Calculate realistic frequency
    const frequencyPerWeek = this.calculateRealisticFrequency(communications);
    
    return {
      summary,
      topics,
      sentiment,
      frequencyPerWeek
    };
  }

  private analyzeCommunicationPatterns(communications: any[]) {
    const patterns = {
      totalCommunications: communications.length,
      emailCount: communications.filter(c => c.type === 'email').length,
      eventCount: communications.filter(c => c.type === 'event').length,
      chatCount: communications.filter(c => c.type === 'chat').length,
      
      // Content analysis
      hasInvestmentTopics: false,
      hasLifeEvents: false,
      hasQuestions: false,
      hasUrgentMatters: false,
      hasPositiveSentiment: false,
      
      // Timing analysis
      recentActivity: false,
      communicationGaps: false,
      
      // Specific topics found
      investmentTopics: [] as string[],
      lifeEvents: [] as string[],
      concerns: [] as string[],
      
      // Client engagement level
      engagementLevel: 'low' as 'low' | 'medium' | 'high'
    };

    // Analyze each communication
    communications.forEach(comm => {
      const content = `${comm.subject || ''} ${comm.body || ''}`.toLowerCase();
      
      // Investment-related topics
      if (/portfolio|investment|stock|bond|mutual fund|retirement|401k|ira|roth/i.test(content)) {
        patterns.hasInvestmentTopics = true;
        if (/portfolio/i.test(content)) patterns.investmentTopics.push('Portfolio Management');
        if (/retirement|401k|ira|roth/i.test(content)) patterns.investmentTopics.push('Retirement Planning');
        if (/stock|bond|equity/i.test(content)) patterns.investmentTopics.push('Investment Strategy');
      }
      
      // Life events
      if (/wedding|marriage|baby|birth|divorce|job|promotion|house|home|moving/i.test(content)) {
        patterns.hasLifeEvents = true;
        if (/wedding|marriage/i.test(content)) patterns.lifeEvents.push('Marriage');
        if (/baby|birth/i.test(content)) patterns.lifeEvents.push('Family Expansion');
        if (/job|promotion/i.test(content)) patterns.lifeEvents.push('Career Change');
        if (/house|home|moving/i.test(content)) patterns.lifeEvents.push('Housing Change');
      }
      
      // Questions and concerns
      if (content.includes('?') || /question|concern|worry|help/i.test(content)) {
        patterns.hasQuestions = true;
      }
      
      if (/urgent|asap|immediately|emergency|problem|issue/i.test(content)) {
        patterns.hasUrgentMatters = true;
        patterns.concerns.push('Urgent Matters');
      }
      
      // Positive sentiment indicators
      if (/thank|appreciate|great|excellent|happy|satisfied|pleased/i.test(content)) {
        patterns.hasPositiveSentiment = true;
      }
    });

    // Determine engagement level
    if (patterns.totalCommunications >= 8) {
      patterns.engagementLevel = 'high';
    } else if (patterns.totalCommunications >= 4) {
      patterns.engagementLevel = 'medium';
    }

    // Check for recent activity (within last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentComms = communications.filter(c => {
      const commDate = new Date(c.timestamp);
      return commDate > thirtyDaysAgo;
    });
    
    patterns.recentActivity = recentComms.length > 0;
    
    console.log('📊 Communication patterns analyzed:', patterns);
    return patterns;
  }

  private buildContextualSummary(
    clientName: string,
    analysis: any,
    mode: AIProcessingMode,
    hasUrgentKeywords: boolean,
    hasQuestions: boolean
  ): string {
    const modePrefix = mode === 'openai' ? '[AI Analysis]' : 
                      mode === 'nlp' ? '[NLP Analysis]' : 
                      '[Smart Analysis]';
    
    let summary = `${modePrefix} `;
    
    // Start with engagement level and specific context
    if (analysis.engagementLevel === 'high') {
      summary += `${clientName} is highly engaged with ${analysis.totalCommunications} recent interactions. `;
    } else if (analysis.engagementLevel === 'medium') {
      summary += `${clientName} maintains moderate engagement with ${analysis.totalCommunications} communications. `;
    } else {
      summary += `${clientName} shows lower engagement with ${analysis.totalCommunications} recent communications. `;
    }
    
    // Add specific investment focus instead of generic terms
    if (analysis.hasInvestmentTopics) {
      const primaryTopics = analysis.investmentTopics.slice(0, 2);
      summary += `Key focus areas: ${primaryTopics.join(' and ')}. `;
    } else {
      summary += `General financial planning discussions. `;
    }
    
    // Add life events context
    if (analysis.hasLifeEvents) {
      summary += `Life events identified: ${analysis.lifeEvents.slice(0, 2).join(', ')}. `;
    }
    
    // Add urgency or concerns with specific context
    if (hasUrgentKeywords || analysis.hasUrgentMatters) {
      summary += `⚠️ Urgent matters detected requiring immediate response. `;
    } else if (analysis.hasQuestions) {
      summary += `Client has pending questions needing attention. `;
    }
    
    // Add sentiment with more specific language
    if (analysis.hasPositiveSentiment) {
      summary += `Positive relationship indicators present. `;
    } else if (hasUrgentKeywords) {
      summary += `Relationship needs attention due to urgent concerns. `;
    } else {
      summary += `Neutral communication tone maintained. `;
    }
    
    // Add recent activity with actionable context
    if (analysis.recentActivity) {
      summary += `Active within last 30 days.`;
    } else {
      summary += `No recent activity - proactive outreach recommended.`;
    }
    
    return summary;
  }

  private extractMeaningfulTopics(communications: any[], analysis: any): string[] {
    const topics = new Set<string>();
    
    // Add investment topics
    analysis.investmentTopics.forEach((topic: string) => topics.add(topic));
    
    // Add life events as topics
    analysis.lifeEvents.forEach((event: string) => topics.add(event));
    
    // Add communication patterns
    if (analysis.engagementLevel === 'high') topics.add('High Engagement');
    if (analysis.hasQuestions) topics.add('Pending Questions');
    if (analysis.hasUrgentMatters) topics.add('Urgent Matters');
    if (analysis.hasPositiveSentiment) topics.add('Positive Relationship');
    
    // Add mode-specific topics
    if (this.config.mode === 'openai') topics.add('AI Analysis');
    if (this.config.mode === 'nlp') topics.add('NLP Processing');
    
    // Ensure we have at least some topics
    if (topics.size === 0) {
      topics.add('General Communication');
    }
    
    return Array.from(topics).slice(0, 5); // Limit to 5 topics
  }

  private determineSentimentFromContent(communications: any[], analysis: any): 'positive' | 'neutral' | 'negative' {
    if (analysis.hasUrgentMatters && !analysis.hasPositiveSentiment) {
      return 'negative';
    }
    
    if (analysis.hasPositiveSentiment && !analysis.hasUrgentMatters) {
      return 'positive';
    }
    
    return 'neutral';
  }

  private calculateRealisticFrequency(communications: any[]): number {
    if (communications.length === 0) return 0;
    
    // Calculate frequency based on actual time span
    const timestamps = communications
      .map(c => new Date(c.timestamp))
      .sort((a, b) => a.getTime() - b.getTime());
    
    if (timestamps.length < 2) return communications.length;
    
    const timeSpanDays = (timestamps[timestamps.length - 1].getTime() - timestamps[0].getTime()) / (1000 * 60 * 60 * 24);
    const timeSpanWeeks = Math.max(1, timeSpanDays / 7);
    
    const frequencyPerWeek = communications.length / timeSpanWeeks;
    return Math.round(frequencyPerWeek * 10) / 10; // Round to 1 decimal place
  }

  private generateIntelligentActions(
    communications: any[],
    insights: any,
    hasUrgentKeywords: boolean,
    hasQuestions: boolean
  ) {
    const actions = [];
    const analysis = this.analyzeCommunicationPatterns(communications);
    
    // High priority urgent actions
    if (hasUrgentKeywords || analysis.hasUrgentMatters) {
      actions.push({
        id: 'action-urgent-response',
        title: 'Respond to urgent client concerns immediately',
        rationale: 'Client has expressed urgent matters requiring prompt response',
        priority: 'high' as const
      });
      
      actions.push({
        id: 'action-urgent-call',
        title: 'Schedule urgent follow-up call',
        rationale: 'Urgent matters may require detailed discussion and immediate resolution',
        priority: 'high' as const
      });
    }
    
    // Question-based actions
    if (hasQuestions || analysis.hasQuestions) {
      actions.push({
        id: 'action-answer-questions',
        title: 'Address client questions and concerns',
        rationale: 'Client has pending questions that need comprehensive responses',
        priority: 'medium' as const
      });
    }
    
    // Investment-focused actions
    if (analysis.hasInvestmentTopics) {
      if (analysis.investmentTopics.includes('Portfolio Management')) {
        actions.push({
          id: 'action-portfolio-review',
          title: 'Schedule portfolio performance review',
          rationale: 'Client has shown interest in portfolio management discussions',
          priority: 'medium' as const
        });
      }
      
      if (analysis.investmentTopics.includes('Retirement Planning')) {
        actions.push({
          id: 'action-retirement-planning',
          title: 'Review retirement planning strategy',
          rationale: 'Client has engaged on retirement planning topics',
          priority: 'medium' as const
        });
      }
    }
    
    // Life event actions
    if (analysis.hasLifeEvents) {
      actions.push({
        id: 'action-life-event-review',
        title: 'Review financial plan for life changes',
        rationale: `Client has experienced life events (${analysis.lifeEvents.slice(0, 2).join(', ')}) that may require financial plan adjustments`,
        priority: 'high' as const
      });
    }
    
    // Engagement-based actions
    if (analysis.engagementLevel === 'low') {
      actions.push({
        id: 'action-reengage-client',
        title: 'Proactive outreach to re-engage client',
        rationale: 'Client shows low engagement levels and may benefit from proactive communication',
        priority: 'medium' as const
      });
    } else if (analysis.engagementLevel === 'high') {
      actions.push({
        id: 'action-maintain-relationship',
        title: 'Maintain high-touch relationship',
        rationale: 'Client is highly engaged and values regular communication',
        priority: 'low' as const
      });
    }
    
    // Recent activity actions
    if (!analysis.recentActivity) {
      actions.push({
        id: 'action-recent-outreach',
        title: 'Reach out due to lack of recent communication',
        rationale: 'No recent communication activity detected - proactive outreach recommended',
        priority: 'medium' as const
      });
    }
    
    // Default actions if no specific actions identified
    if (actions.length === 0) {
      actions.push({
        id: 'action-general-followup',
        title: 'Schedule regular check-in meeting',
        rationale: 'Standard relationship maintenance and opportunity to discuss any concerns',
        priority: 'low' as const
      });
    }
    
    // Limit to 4 actions maximum
    return actions.slice(0, 4);
  }

  private generateIntelligentHighlights(
    communications: any[],
    insights: any,
    analysis: any
  ) {
    const highlights = [];
    
    // Engagement level highlight
    const engagementValue = analysis.engagementLevel === 'high' ? 'High Engagement' :
                           analysis.engagementLevel === 'medium' ? 'Moderate Engagement' :
                           'Low Engagement';
    highlights.push({
      label: 'Engagement Level',
      value: engagementValue
    });
    
    // Communication frequency highlight
    const frequencyText = insights.frequencyPerWeek > 2 ? 'High Frequency' :
                         insights.frequencyPerWeek > 1 ? 'Moderate Frequency' :
                         'Low Frequency';
    highlights.push({
      label: 'Communication Frequency',
      value: `${frequencyText} (${insights.frequencyPerWeek}/week)`
    });
    
    // Investment focus highlight
    if (analysis.hasInvestmentTopics) {
      const primaryTopic = analysis.investmentTopics[0] || 'Investment Focus';
      highlights.push({
        label: 'Primary Focus',
        value: primaryTopic
      });
    }
    
    // Life events highlight
    if (analysis.hasLifeEvents) {
      highlights.push({
        label: 'Recent Life Events',
        value: analysis.lifeEvents.slice(0, 2).join(', ')
      });
    }
    
    // Client status highlight
    let statusValue = 'Stable';
    if (analysis.hasUrgentMatters) {
      statusValue = 'Requires Immediate Attention';
    } else if (analysis.hasQuestions) {
      statusValue = 'Has Pending Questions';
    } else if (analysis.hasPositiveSentiment) {
      statusValue = 'Positive Relationship';
    } else if (!analysis.recentActivity) {
      statusValue = 'Needs Outreach';
    }
    
    highlights.push({
      label: 'Client Status',
      value: statusValue
    });
    
    // Recent activity highlight
    if (analysis.recentActivity) {
      highlights.push({
        label: 'Recent Activity',
        value: 'Active (Last 30 days)'
      });
    } else {
      highlights.push({
        label: 'Recent Activity',
        value: 'Inactive (No recent communication)'
      });
    }
    
    // Ensure we have at least 3 highlights, maximum 6
    return highlights.slice(0, 6);
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