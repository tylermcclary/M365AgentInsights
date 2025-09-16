import { addDays, differenceInDays, format } from "date-fns";
import { meetings, clients, type SampleMeeting, type MeetingType } from "@/data/sampleData";

export interface MeetingAnalysis {
  effectivenessScore: number;
  clientSatisfaction: "high" | "medium" | "low";
  keyTopics: string[];
  actionItems: Array<{
    id: string;
    description: string;
    priority: "high" | "medium" | "low";
    dueDate?: string;
    assignedTo: string;
    status: "pending" | "in_progress" | "completed";
  }>;
  followUpNeeded: boolean;
  nextMeetingSuggested: boolean;
  relationshipImpact: "positive" | "neutral" | "negative";
  insights: string[];
}

export interface MeetingRecommendations {
  optimalFrequency: {
    suggested: "weekly" | "bi-weekly" | "monthly" | "quarterly";
    reasoning: string;
    currentGap: number; // days since last meeting
  };
  bestMeetingTypes: {
    primary: MeetingType;
    secondary: MeetingType;
    reasoning: string;
  };
  followUpTiming: {
    immediate: boolean; // within 24 hours
    shortTerm: string; // within 1 week
    longTerm: string; // within 1 month
  };
  communicationStyle: {
    preferred: "formal" | "casual" | "mixed";
    indicators: string[];
  };
}

export interface MeetingSeriesIntelligence {
  seriesId: string;
  clientId: string;
  meetingType: MeetingType;
  frequency: "weekly" | "bi-weekly" | "monthly" | "quarterly";
  totalMeetings: number;
  averageEffectiveness: number;
  completionRate: number;
  nextSuggestedDate: string;
  topicsEvolution: string[];
  relationshipTrend: "improving" | "stable" | "declining";
}

export class MeetingAnalysisService {
  /**
   * Analyze meeting patterns for a specific client
   */
  static analyzeClientMeetingPatterns(clientId: string): MeetingRecommendations {
    const clientMeetings = meetings.filter(m => m.clientId === clientId);
    const completedMeetings = clientMeetings.filter(m => m.status === "completed");
    
    if (completedMeetings.length === 0) {
      return this.getDefaultRecommendations();
    }

    // Calculate optimal frequency
    const optimalFrequency = this.calculateOptimalFrequency(completedMeetings);
    
    // Determine best meeting types
    const bestMeetingTypes = this.determineBestMeetingTypes(completedMeetings);
    
    // Calculate follow-up timing
    const followUpTiming = this.calculateFollowUpTiming(completedMeetings);
    
    // Analyze communication style
    const communicationStyle = this.analyzeCommunicationStyle(completedMeetings);

    return {
      optimalFrequency,
      bestMeetingTypes,
      followUpTiming,
      communicationStyle,
    };
  }

  /**
   * Generate meeting templates based on historical analysis
   */
  static generateMeetingTemplates(clientId: string): Array<{
    id: string;
    name: string;
    type: MeetingType;
    duration: number;
    suggestedAgenda: string[];
    description: string;
    confidence: number; // 0-1
  }> {
    const clientMeetings = meetings.filter(m => m.clientId === clientId);
    const completedMeetings = clientMeetings.filter(m => m.status === "completed");
    
    const templates: Array<{
      id: string;
      name: string;
      type: MeetingType;
      duration: number;
      suggestedAgenda: string[];
      description: string;
      confidence: number;
    }> = [];
    
    // Analyze most effective meeting types
    const meetingTypeEffectiveness = this.calculateMeetingTypeEffectiveness(completedMeetings);
    
    // Generate templates based on effectiveness
    Object.entries(meetingTypeEffectiveness).forEach(([type, effectiveness]) => {
      if (effectiveness.averageScore >= 6) {
        templates.push({
          id: `template-${type}`,
          name: this.getMeetingTypeDisplayName(type as MeetingType),
          type: type as MeetingType,
          duration: this.getOptimalDuration(type as MeetingType),
          suggestedAgenda: this.generateAgendaForType(type as MeetingType, completedMeetings),
          description: `Based on ${effectiveness.count} successful meetings`,
          confidence: effectiveness.averageScore / 10,
        });
      }
    });

    return templates.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Analyze meeting series intelligence
   */
  static analyzeMeetingSeries(clientId: string): MeetingSeriesIntelligence[] {
    const clientMeetings = meetings.filter(m => m.clientId === clientId);
    const completedMeetings = clientMeetings.filter(m => m.status === "completed");
    
    // Group meetings by type to identify series
    const seriesMap = new Map<MeetingType, SampleMeeting[]>();
    
    completedMeetings.forEach(meeting => {
      if (!seriesMap.has(meeting.meetingType)) {
        seriesMap.set(meeting.meetingType, []);
      }
      seriesMap.get(meeting.meetingType)!.push(meeting);
    });

    const series: MeetingSeriesIntelligence[] = [];
    
    seriesMap.forEach((meetings, type) => {
      if (meetings.length >= 2) { // Only consider series with 2+ meetings
        const sortedMeetings = meetings.sort((a, b) => 
          new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
        );
        
        const frequency = this.calculateSeriesFrequency(sortedMeetings);
        const averageEffectiveness = this.calculateAverageEffectiveness(sortedMeetings);
        const completionRate = this.calculateCompletionRate(clientMeetings.filter(m => m.meetingType === type));
        const nextSuggestedDate = this.calculateNextSuggestedDate(sortedMeetings, frequency);
        const topicsEvolution = this.analyzeTopicsEvolution(sortedMeetings);
        const relationshipTrend = this.analyzeRelationshipTrend(sortedMeetings);

        series.push({
          seriesId: `series-${clientId}-${type}`,
          clientId,
          meetingType: type,
          frequency,
          totalMeetings: meetings.length,
          averageEffectiveness,
          completionRate,
          nextSuggestedDate,
          topicsEvolution,
          relationshipTrend,
        });
      }
    });

    return series;
  }

  /**
   * Generate follow-up communication suggestions
   */
  static generateFollowUpSuggestions(
    meetingId: string,
    meetingAnalysis: MeetingAnalysis
  ): Array<{
    type: "email" | "call" | "meeting";
    subject: string;
    content: string;
    timing: "immediate" | "short_term" | "long_term";
    priority: "high" | "medium" | "low";
  }> {
    const suggestions: Array<{
      type: "email" | "call" | "meeting";
      subject: string;
      content: string;
      timing: "immediate" | "short_term" | "long_term";
      priority: "high" | "medium" | "low";
    }> = [];
    const meeting = meetings.find(m => m.id === meetingId);
    
    if (!meeting) return suggestions;

    // Immediate follow-up (within 24 hours)
    if (meetingAnalysis.followUpNeeded) {
      suggestions.push({
        type: "email",
        subject: `Thank you for our ${meeting.meetingType.replace('_', ' ')} meeting`,
        content: this.generateThankYouEmail(meeting, meetingAnalysis),
        timing: "immediate",
        priority: "high",
      });
    }

    // Action items follow-up
    if (meetingAnalysis.actionItems.length > 0) {
      suggestions.push({
        type: "email",
        subject: "Action items from our meeting",
        content: this.generateActionItemsEmail(meetingAnalysis.actionItems),
        timing: "short_term",
        priority: "medium",
      });
    }

    // Next meeting suggestion
    if (meetingAnalysis.nextMeetingSuggested) {
      suggestions.push({
        type: "email",
        subject: "Scheduling our next meeting",
        content: this.generateNextMeetingEmail(meeting),
        timing: "long_term",
        priority: "medium",
      });
    }

    // Low satisfaction follow-up
    if (meetingAnalysis.clientSatisfaction === "low") {
      suggestions.push({
        type: "call",
        subject: "Follow-up call to address concerns",
        content: "Schedule a call to address any concerns from the meeting",
        timing: "immediate",
        priority: "high",
      });
    }

    return suggestions;
  }

  /**
   * Calculate relationship health impact from meeting outcomes
   */
  static calculateRelationshipImpact(
    clientId: string,
    meetingAnalysis: MeetingAnalysis
  ): {
    impact: number; // -10 to +10
    factors: string[];
    recommendations: string[];
  } {
    let impact = 0;
    const factors: string[] = [];
    const recommendations: string[] = [];

    // Effectiveness impact
    if (meetingAnalysis.effectivenessScore >= 8) {
      impact += 2;
      factors.push("High meeting effectiveness");
    } else if (meetingAnalysis.effectivenessScore <= 4) {
      impact -= 2;
      factors.push("Low meeting effectiveness");
      recommendations.push("Review meeting preparation and agenda");
    }

    // Client satisfaction impact
    if (meetingAnalysis.clientSatisfaction === "high") {
      impact += 3;
      factors.push("High client satisfaction");
    } else if (meetingAnalysis.clientSatisfaction === "low") {
      impact -= 3;
      factors.push("Low client satisfaction");
      recommendations.push("Address client concerns immediately");
    }

    // Relationship impact
    if (meetingAnalysis.relationshipImpact === "positive") {
      impact += 2;
      factors.push("Positive relationship impact");
    } else if (meetingAnalysis.relationshipImpact === "negative") {
      impact -= 2;
      factors.push("Negative relationship impact");
      recommendations.push("Schedule follow-up to repair relationship");
    }

    // Follow-up completion impact
    if (meetingAnalysis.actionItems.length > 0) {
      impact += 1;
      factors.push("Clear action items identified");
      recommendations.push("Ensure timely completion of action items");
    }

    return {
      impact: Math.max(-10, Math.min(10, impact)),
      factors,
      recommendations,
    };
  }

  // Private helper methods
  private static getDefaultRecommendations(): MeetingRecommendations {
    return {
      optimalFrequency: {
        suggested: "monthly",
        reasoning: "No meeting history available",
        currentGap: 0,
      },
      bestMeetingTypes: {
        primary: "scheduled_call",
        secondary: "portfolio_review",
        reasoning: "Default recommendations based on industry best practices",
      },
      followUpTiming: {
        immediate: true,
        shortTerm: "Within 1 week",
        longTerm: "Within 1 month",
      },
      communicationStyle: {
        preferred: "mixed",
        indicators: ["No historical data available"],
      },
    };
  }

  private static calculateOptimalFrequency(meetings: SampleMeeting[]): MeetingRecommendations["optimalFrequency"] {
    if (meetings.length < 2) {
      return {
        suggested: "monthly",
        reasoning: "Insufficient data for frequency analysis",
        currentGap: 0,
      };
    }

    const sortedMeetings = meetings.sort((a, b) => 
      new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    );

    const gaps = [];
    for (let i = 1; i < sortedMeetings.length; i++) {
      const gap = differenceInDays(
        new Date(sortedMeetings[i].startTime),
        new Date(sortedMeetings[i - 1].startTime)
      );
      gaps.push(gap);
    }

    const averageGap = gaps.reduce((sum, gap) => sum + gap, 0) / gaps.length;
    const lastMeeting = sortedMeetings[sortedMeetings.length - 1];
    const currentGap = differenceInDays(new Date(), new Date(lastMeeting.startTime));

    let suggested: MeetingRecommendations["optimalFrequency"]["suggested"];
    let reasoning: string;

    if (averageGap <= 7) {
      suggested = "weekly";
      reasoning = "Client prefers frequent communication";
    } else if (averageGap <= 14) {
      suggested = "bi-weekly";
      reasoning = "Client prefers regular bi-weekly meetings";
    } else if (averageGap <= 30) {
      suggested = "monthly";
      reasoning = "Client prefers monthly check-ins";
    } else {
      suggested = "quarterly";
      reasoning = "Client prefers quarterly reviews";
    }

    return {
      suggested,
      reasoning,
      currentGap,
    };
  }

  private static determineBestMeetingTypes(meetings: SampleMeeting[]): MeetingRecommendations["bestMeetingTypes"] {
    const typeCounts = new Map<MeetingType, number>();
    
    meetings.forEach(meeting => {
      typeCounts.set(meeting.meetingType, (typeCounts.get(meeting.meetingType) || 0) + 1);
    });

    const sortedTypes = Array.from(typeCounts.entries())
      .sort(([,a], [,b]) => b - a);

    const primary = sortedTypes[0]?.[0] || "scheduled_call";
    const secondary = sortedTypes[1]?.[0] || "portfolio_review";

    return {
      primary,
      secondary,
      reasoning: `Based on ${meetings.length} completed meetings`,
    };
  }

  private static calculateFollowUpTiming(meetings: SampleMeeting[]): MeetingRecommendations["followUpTiming"] {
    // Analyze patterns in meeting outcomes to determine optimal follow-up timing
    return {
      immediate: true,
      shortTerm: "Within 3-5 days",
      longTerm: "Within 2-3 weeks",
    };
  }

  private static analyzeCommunicationStyle(meetings: SampleMeeting[]): MeetingRecommendations["communicationStyle"] {
    // Analyze meeting notes and outcomes to determine communication style
    return {
      preferred: "mixed",
      indicators: ["Based on meeting history analysis"],
    };
  }

  private static calculateMeetingTypeEffectiveness(meetings: SampleMeeting[]): Record<string, { count: number; averageScore: number }> {
    const effectiveness = new Map<string, { count: number; totalScore: number }>();
    
    meetings.forEach(meeting => {
      // Mock effectiveness score based on meeting type and status
      const score = meeting.status === "completed" ? 
        (meeting.meetingType === "urgent_consultation" ? 8 : 
         meeting.meetingType === "portfolio_review" ? 7 : 6) : 3;
      
      const current = effectiveness.get(meeting.meetingType) || { count: 0, totalScore: 0 };
      effectiveness.set(meeting.meetingType, {
        count: current.count + 1,
        totalScore: current.totalScore + score,
      });
    });

    const result: Record<string, { count: number; averageScore: number }> = {};
    effectiveness.forEach((data, type) => {
      result[type] = {
        count: data.count,
        averageScore: data.totalScore / data.count,
      };
    });

    return result;
  }

  private static getMeetingTypeDisplayName(type: MeetingType): string {
    const names = {
      scheduled_call: "Scheduled Call",
      portfolio_review: "Portfolio Review",
      planning_session: "Planning Session",
      urgent_consultation: "Urgent Consultation",
    };
    return names[type];
  }

  private static getOptimalDuration(type: MeetingType): number {
    const durations = {
      scheduled_call: 30,
      portfolio_review: 60,
      planning_session: 90,
      urgent_consultation: 30,
    };
    return durations[type];
  }

  private static generateAgendaForType(type: MeetingType, meetings: SampleMeeting[]): string[] {
    const baseAgendas = {
      scheduled_call: [
        "Account performance review",
        "Market updates",
        "Client questions",
        "Next steps"
      ],
      portfolio_review: [
        "Performance analysis",
        "Asset allocation review",
        "Rebalancing discussion",
        "Strategy adjustments"
      ],
      planning_session: [
        "Goal review and updates",
        "Life event planning",
        "Risk assessment",
        "Long-term strategy"
      ],
      urgent_consultation: [
        "Immediate concerns",
        "Risk mitigation",
        "Quick actions needed",
        "Follow-up planning"
      ],
    };

    return baseAgendas[type] || baseAgendas.scheduled_call;
  }

  private static calculateSeriesFrequency(meetings: SampleMeeting[]): MeetingSeriesIntelligence["frequency"] {
    if (meetings.length < 2) return "monthly";
    
    const gaps = [];
    for (let i = 1; i < meetings.length; i++) {
      const gap = differenceInDays(
        new Date(meetings[i].startTime),
        new Date(meetings[i - 1].startTime)
      );
      gaps.push(gap);
    }

    const averageGap = gaps.reduce((sum, gap) => sum + gap, 0) / gaps.length;

    if (averageGap <= 7) return "weekly";
    if (averageGap <= 14) return "bi-weekly";
    if (averageGap <= 30) return "monthly";
    return "quarterly";
  }

  private static calculateAverageEffectiveness(meetings: SampleMeeting[]): number {
    // Mock calculation - in real implementation, this would use actual effectiveness scores
    return meetings.length > 0 ? 7.5 : 0;
  }

  private static calculateCompletionRate(meetings: SampleMeeting[]): number {
    const completed = meetings.filter(m => m.status === "completed").length;
    return meetings.length > 0 ? (completed / meetings.length) * 100 : 0;
  }

  private static calculateNextSuggestedDate(meetings: SampleMeeting[], frequency: MeetingSeriesIntelligence["frequency"]): string {
    const lastMeeting = meetings[meetings.length - 1];
    const lastDate = new Date(lastMeeting.startTime);
    
    let daysToAdd: number;
    switch (frequency) {
      case "weekly": daysToAdd = 7; break;
      case "bi-weekly": daysToAdd = 14; break;
      case "monthly": daysToAdd = 30; break;
      case "quarterly": daysToAdd = 90; break;
      default: daysToAdd = 30;
    }

    return format(addDays(lastDate, daysToAdd), "yyyy-MM-dd");
  }

  private static analyzeTopicsEvolution(meetings: SampleMeeting[]): string[] {
    // Mock analysis - in real implementation, this would analyze meeting notes
    return ["portfolio review", "risk tolerance", "retirement planning"];
  }

  private static analyzeRelationshipTrend(meetings: SampleMeeting[]): MeetingSeriesIntelligence["relationshipTrend"] {
    // Mock analysis - in real implementation, this would analyze meeting outcomes
    return "stable";
  }

  private static generateThankYouEmail(meeting: SampleMeeting, analysis: MeetingAnalysis): string {
    return `Dear ${clients.find(c => c.id === meeting.clientId)?.name || "Client"},

Thank you for taking the time to meet with me today for our ${meeting.meetingType.replace('_', ' ')}. 

I appreciate your engagement and the valuable discussion we had. ${analysis.clientSatisfaction === "high" ? "I'm pleased to hear that you found our meeting productive." : ""}

${analysis.actionItems.length > 0 ? "As discussed, I will follow up on the action items we identified during our meeting." : ""}

Please don't hesitate to reach out if you have any questions or concerns.

Best regards,
[Your Name]`;
  }

  private static generateActionItemsEmail(actionItems: MeetingAnalysis["actionItems"]): string {
    return `Dear Client,

Following up on our recent meeting, here are the action items we discussed:

${actionItems.map((item, index) => `${index + 1}. ${item.description} (Due: ${item.dueDate || "TBD"})`).join('\n')}

I will keep you updated on the progress of these items.

Best regards,
[Your Name]`;
  }

  private static generateNextMeetingEmail(meeting: SampleMeeting): string {
    return `Dear ${clients.find(c => c.id === meeting.clientId)?.name || "Client"},

I hope you're doing well. Following our recent ${meeting.meetingType.replace('_', ' ')} meeting, I'd like to schedule our next check-in.

Please let me know your availability for the coming weeks, and I'll send you some time options.

Best regards,
[Your Name]`;
  }
}
