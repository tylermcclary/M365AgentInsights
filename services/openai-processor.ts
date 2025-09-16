import OpenAI from 'openai';
import { AI_CONFIG } from '@/lib/ai-config';

export interface OpenAIAnalysisResult {
  clientSummary: string;
  communicationFrequency: 'weekly' | 'monthly' | 'quarterly' | 'irregular';
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
  tokensUsed?: number;
  model?: string;
}

export class OpenAIProcessor {
  private openai: OpenAI;
  private config = AI_CONFIG;
  
  constructor(apiKey: string) {
    this.openai = new OpenAI({ apiKey });
  }
  
  async analyzeClientCommunications(communications: any[]): Promise<OpenAIAnalysisResult> {
    if (!communications || communications.length === 0) {
      return this.getEmptyResult();
    }

    const communicationText = this.prepareCommunicationsText(communications);
    
    const systemPrompt = `You are an AI assistant for financial advisors. Analyze client communications including emails, meetings, and other interactions to provide actionable insights for relationship management and business development.
    
    Focus on:
    - Investment goals and risk tolerance
    - Life events that impact financial planning  
    - Communication patterns and client sentiment
    - Meeting frequency, types, and engagement levels
    - Opportunities for deeper engagement
    - Potential concerns or red flags
    - Meeting outcomes and follow-up needs
    
    Pay special attention to:
    - Meeting patterns (frequency, completion rates, preferred types)
    - Topics discussed in meetings vs emails
    - Meeting duration trends and engagement indicators
    - Follow-up actions based on meeting outcomes
    
    Be concise, professional, and action-oriented.`;
    
    const userPrompt = `Analyze these client communications and provide structured insights:
    
    COMMUNICATIONS:
    ${communicationText}
    
    Please provide a JSON response with exactly these fields:
    {
      "clientSummary": "2-3 sentence overview of client relationship and current situation",
      "communicationFrequency": "weekly|monthly|quarterly|irregular",
      "sentiment": {
        "overall": "positive|neutral|negative",
        "reasoning": "brief explanation",
        "confidenceScore": 0.85
      },
      "investmentProfile": {
        "goals": ["retirement", "college fund"],
        "riskTolerance": "conservative|moderate|aggressive|unknown",
        "timeHorizon": "short|medium|long|unknown"
      },
      "lifeEvents": ["mentioned life events or milestones"],
      "keyTopics": ["main discussion topics"],
      "concerns": ["any concerns or issues raised"],
      "nextBestActions": [
        {
          "action": "specific action to take",
          "priority": "high|medium|low",
          "reasoning": "why this action is recommended"
        }
      ],
      "relationshipHealth": {
        "score": 8,
        "indicators": ["positive/negative relationship indicators"]
      },
      "meetingInsights": {
        "frequency": "high|medium|low",
        "engagement": "high|medium|low",
        "preferredTypes": ["scheduled_call", "portfolio_review"],
        "completionRate": 85,
        "followUpNeeded": ["specific follow-up actions based on meetings"],
        "topicsDiscussed": ["topics specific to meetings vs emails"]
      }
    }`;
    
    try {
      const response = await this.openai.chat.completions.create({
        model: this.config.OPENAI_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 1500,
        temperature: 0.3,
        response_format: { type: 'json_object' }
      });
      
      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error('Empty response from OpenAI');
      }
      
      const result = JSON.parse(content);
      
      return {
        ...result,
        tokensUsed: response.usage?.total_tokens || 0,
        model: this.config.OPENAI_MODEL
      };
      
    } catch (error) {
      console.error('OpenAI processing failed:', error);
      if (error instanceof Error) {
        throw new Error(`OpenAI analysis failed: ${error.message}`);
      }
      throw new Error('OpenAI analysis failed: Unknown error');
    }
  }

  private prepareCommunicationsText(communications: any[]): string {
    return communications
      .sort((a, b) => new Date(a.timestamp || a.receivedDateTime || a.startTime || 0).getTime() - new Date(b.timestamp || b.receivedDateTime || b.startTime || 0).getTime())
      .map((comm, index) => {
        const timestamp = comm.timestamp || comm.receivedDateTime || comm.createdDateTime || comm.startTime || 'Unknown date';
        const sender = comm.from?.emailAddress?.name || comm.from?.emailAddress?.address || comm.sender || 'Unknown sender';
        const subject = comm.subject || comm.summary || 'No subject';
        const body = comm.body?.content || comm.bodyPreview || comm.preview || comm.body || comm.description || comm.agenda || 'No content';
        
        // Check if this is a meeting
        if (comm.meetingType || comm.startTime) {
          const meetingType = comm.meetingType || 'meeting';
          const status = comm.status || 'unknown';
          const attendees = comm.attendees ? comm.attendees.map((a: any) => a.name || a.address).join(', ') : 'Unknown attendees';
          const location = comm.location || comm.meetingUrl || 'Location TBD';
          const notes = comm.notes || 'No notes';
          
          return `
          MEETING ${index + 1} (${new Date(timestamp).toLocaleDateString()}):
          Type: ${meetingType}
          Subject: ${subject}
          Status: ${status}
          Attendees: ${attendees}
          Location: ${location}
          Description: ${body}
          Notes: ${notes}
          ---
          `;
        } else {
          return `
          EMAIL ${index + 1} (${new Date(timestamp).toLocaleDateString()}):
          From: ${sender}
          Subject: ${subject}
          Content: ${body}
          ---
          `;
        }
      }).join('\n').substring(0, 8000); // Limit to ~8k chars to stay within token limits
  }


  private getEmptyResult(): OpenAIAnalysisResult {
    return {
      clientSummary: 'Unable to analyze communications at this time.',
      communicationFrequency: 'irregular',
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
      tokensUsed: 0,
      model: 'unknown'
    };
  }

  async generateInsightSummary(analysisResult: OpenAIAnalysisResult): Promise<string> {
    if (!analysisResult) {
      return 'No insights available for summary.';
    }

    try {
      const summaryText = `
Client Summary: ${analysisResult.clientSummary}
Sentiment: ${analysisResult.sentiment.overall} (${analysisResult.sentiment.reasoning})
Investment Goals: ${analysisResult.investmentProfile.goals.join(', ')}
Key Topics: ${analysisResult.keyTopics.join(', ')}
Concerns: ${analysisResult.concerns.join(', ')}
Relationship Health: ${analysisResult.relationshipHealth.score}/10
Next Actions: ${analysisResult.nextBestActions.map(a => a.action).join(', ')}
      `;

      const response = await this.openai.chat.completions.create({
        model: this.config.OPENAI_MODEL,
        messages: [
          {
            role: 'system',
            content: 'You are a financial advisor assistant. Create a concise, professional executive summary of client analysis that highlights key points and actionable items.'
          },
          {
            role: 'user',
            content: `Please create an executive summary of this client analysis:\n\n${summaryText}`
          }
        ],
        max_tokens: 500,
        temperature: 0.7
      });

      return response.choices[0]?.message?.content || 'Summary unavailable.';
    } catch (error) {
      console.error('Failed to generate insight summary:', error);
      return 'Summary generation failed.';
    }
  }

  async suggestPersonalizedMessage(
    analysisResult: OpenAIAnalysisResult,
    messageType: 'follow-up' | 'check-in' | 'proactive' | 'urgent'
  ): Promise<string> {
    try {
      const contextText = `
Client Summary: ${analysisResult.clientSummary}
Sentiment: ${analysisResult.sentiment.overall}
Investment Goals: ${analysisResult.investmentProfile.goals.join(', ')}
Key Topics: ${analysisResult.keyTopics.join(', ')}
Concerns: ${analysisResult.concerns.join(', ')}
Relationship Health: ${analysisResult.relationshipHealth.score}/10
      `;
      
      const messagePrompts = {
        'follow-up': 'draft a professional follow-up message addressing recent communications',
        'check-in': 'draft a friendly check-in message to maintain relationship',
        'proactive': 'draft a proactive outreach message with valuable insights or market updates',
        'urgent': 'draft an urgent but professional message addressing concerns'
      };

      const response = await this.openai.chat.completions.create({
        model: this.config.OPENAI_MODEL,
        messages: [
          {
            role: 'system',
            content: `You are a professional financial advisor writing ${messagePrompts[messageType]}. 
            Be warm, professional, and personalized based on the client's situation and analysis. 
            Keep it concise (2-3 paragraphs) and actionable. Reference specific topics or concerns when appropriate.`
          },
          {
            role: 'user',
            content: `Based on this client analysis, ${messagePrompts[messageType]}:\n\n${contextText}`
          }
        ],
        max_tokens: 300,
        temperature: 0.8
      });

      return response.choices[0]?.message?.content || 'Message generation failed.';
    } catch (error) {
      console.error('Failed to generate personalized message:', error);
      return 'Unable to generate personalized message at this time.';
    }
  }
}
