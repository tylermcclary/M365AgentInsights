"use client";

import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  Calendar,
  Users,
  Target,
  Clock,
  Star,
  MessageSquare,
  BarChart3,
  PieChart,
  Activity,
  CheckCircle,
  AlertCircle,
  ArrowUp,
  ArrowDown,
  Minus,
} from "lucide-react";
import { meetings, clients, type SampleMeeting, type SampleClient } from "@/data/sampleData";
import { MeetingAnalysisService, type MeetingRecommendations, type MeetingSeriesIntelligence } from "@/services/meeting-analysis";
import Button from "@/components/ui/Button";

interface MeetingInsightsDashboardProps {
  clientId?: string;
  onClose?: () => void;
}

export default function MeetingInsightsDashboard({ clientId, onClose }: MeetingInsightsDashboardProps) {
  const [selectedClient, setSelectedClient] = useState<SampleClient | null>(null);
  const [recommendations, setRecommendations] = useState<MeetingRecommendations | null>(null);
  const [meetingSeries, setMeetingSeries] = useState<MeetingSeriesIntelligence[]>([]);
  const [meetingTemplates, setMeetingTemplates] = useState<Array<{
    id: string;
    name: string;
    type: string;
    duration: number;
    suggestedAgenda: string[];
    description: string;
    confidence: number;
  }>>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (clientId) {
      const client = clients.find(c => c.id === clientId);
      if (client) {
        setSelectedClient(client);
        analyzeClientMeetings(client.id);
      }
    }
  }, [clientId]);

  const analyzeClientMeetings = async (clientId: string) => {
    setIsLoading(true);
    try {
      // Analyze meeting patterns
      const meetingRecommendations = MeetingAnalysisService.analyzeClientMeetingPatterns(clientId);
      setRecommendations(meetingRecommendations);

      // Analyze meeting series
      const series = MeetingAnalysisService.analyzeMeetingSeries(clientId);
      setMeetingSeries(series);

      // Generate meeting templates
      const templates = MeetingAnalysisService.generateMeetingTemplates(clientId);
      setMeetingTemplates(templates);
    } catch (error) {
      console.error("Failed to analyze client meetings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getClientMeetings = (clientId: string): SampleMeeting[] => {
    return meetings.filter(m => m.clientId === clientId);
  };

  const getMeetingStats = (clientId: string) => {
    const clientMeetings = getClientMeetings(clientId);
    const completedMeetings = clientMeetings.filter(m => m.status === "completed");
    const scheduledMeetings = clientMeetings.filter(m => m.status === "scheduled");
    const cancelledMeetings = clientMeetings.filter(m => m.status === "cancelled");

    const totalDuration = completedMeetings.reduce((sum, m) => sum + Math.round((new Date(m.endTime).getTime() - new Date(m.startTime).getTime()) / (1000 * 60)), 0);
    const averageDuration = completedMeetings.length > 0 ? totalDuration / completedMeetings.length : 0;

    return {
      total: clientMeetings.length,
      completed: completedMeetings.length,
      scheduled: scheduledMeetings.length,
      cancelled: cancelledMeetings.length,
      completionRate: clientMeetings.length > 0 ? (completedMeetings.length / clientMeetings.length) * 100 : 0,
      averageDuration: Math.round(averageDuration),
    };
  };

  const getTrendIcon = (trend: "improving" | "stable" | "declining") => {
    switch (trend) {
      case "improving": return <ArrowUp className="h-4 w-4 text-green-600" />;
      case "declining": return <ArrowDown className="h-4 w-4 text-red-600" />;
      default: return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTrendColor = (trend: "improving" | "stable" | "declining") => {
    switch (trend) {
      case "improving": return "text-green-600";
      case "declining": return "text-red-600";
      default: return "text-gray-600";
    }
  };

  if (!selectedClient) {
    return (
      <div className="p-6">
        <div className="text-center py-8">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Client Selected</h3>
          <p className="text-gray-600">Select a client to view meeting insights</p>
        </div>
      </div>
    );
  }

  const stats = getClientMeetings(selectedClient.id);

  return (
    <div className="h-full overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Meeting Insights</h2>
          <p className="text-sm text-gray-600">{selectedClient.name}</p>
        </div>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        )}
      </div>

      <div className="p-6 space-y-8">
        {/* Meeting Statistics */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <BarChart3 className="h-5 w-5 mr-2" />
            Meeting Statistics
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-blue-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Total Meetings</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {stats.filter(m => m.status === "completed").length}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-yellow-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Avg Duration</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {stats.filter(m => m.status === "completed").length > 0 ? 
                      Math.round(stats.filter(m => m.status === "completed").reduce((sum, m) => sum + Math.round((new Date(m.endTime).getTime() - new Date(m.startTime).getTime()) / (1000 * 60)), 0) / stats.filter(m => m.status === "completed").length) : 0} min
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center">
                <Activity className="h-8 w-8 text-purple-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {stats.length > 0 ? Math.round((stats.filter(m => m.status === "completed").length / stats.length) * 100) : 0}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AI Recommendations */}
        {recommendations && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              AI Recommendations
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Optimal Frequency */}
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  Optimal Meeting Frequency
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Suggested:</span>
                    <span className="font-medium text-gray-900 capitalize">
                      {recommendations.optimalFrequency.suggested}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{recommendations.optimalFrequency.reasoning}</p>
                  {recommendations.optimalFrequency.currentGap > 0 && (
                    <div className="flex items-center text-sm text-orange-600">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {recommendations.optimalFrequency.currentGap} days since last meeting
                    </div>
                  )}
                </div>
              </div>

              {/* Best Meeting Types */}
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                  <Target className="h-4 w-4 mr-2" />
                  Best Meeting Types
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Primary:</span>
                    <span className="font-medium text-gray-900 capitalize">
                      {recommendations.bestMeetingTypes.primary.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Secondary:</span>
                    <span className="font-medium text-gray-900 capitalize">
                      {recommendations.bestMeetingTypes.secondary.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{recommendations.bestMeetingTypes.reasoning}</p>
                </div>
              </div>

              {/* Follow-up Timing */}
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Follow-up Timing
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Immediate:</span>
                    <span className={`text-sm font-medium ${recommendations.followUpTiming.immediate ? 'text-green-600' : 'text-gray-600'}`}>
                      {recommendations.followUpTiming.immediate ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Short-term:</span>
                    <span className="text-sm font-medium text-gray-900">{recommendations.followUpTiming.shortTerm}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Long-term:</span>
                    <span className="text-sm font-medium text-gray-900">{recommendations.followUpTiming.longTerm}</span>
                  </div>
                </div>
              </div>

              {/* Communication Style */}
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  Communication Style
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Preferred:</span>
                    <span className="font-medium text-gray-900 capitalize">
                      {recommendations.communicationStyle.preferred}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {recommendations.communicationStyle.indicators.map((indicator, index) => (
                      <div key={index}>• {indicator}</div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Meeting Series Intelligence */}
        {meetingSeries.length > 0 && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <PieChart className="h-5 w-5 mr-2" />
              Meeting Series Intelligence
            </h3>
            <div className="space-y-4">
              {meetingSeries.map((series) => (
                <div key={series.seriesId} className="bg-white p-6 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-gray-900 capitalize">
                      {series.meetingType.replace('_', ' ')} Series
                    </h4>
                    <div className="flex items-center space-x-2">
                      {getTrendIcon(series.relationshipTrend)}
                      <span className={`text-sm font-medium ${getTrendColor(series.relationshipTrend)}`}>
                        {series.relationshipTrend}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Frequency</p>
                      <p className="font-medium text-gray-900 capitalize">{series.frequency}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Meetings</p>
                      <p className="font-medium text-gray-900">{series.totalMeetings}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Avg Effectiveness</p>
                      <p className="font-medium text-gray-900">{series.averageEffectiveness}/10</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Completion Rate</p>
                      <p className="font-medium text-gray-900">{Math.round(series.completionRate)}%</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm text-gray-600 mb-2">Next Suggested Date:</p>
                    <p className="font-medium text-gray-900">{series.nextSuggestedDate}</p>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm text-gray-600 mb-2">Topics Evolution:</p>
                    <div className="flex flex-wrap gap-1">
                      {series.topicsEvolution.map((topic, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Meeting Templates */}
        {meetingTemplates.length > 0 && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <Star className="h-5 w-5 mr-2" />
              AI-Generated Meeting Templates
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {meetingTemplates.map((template) => (
                <div key={template.id} className="bg-white p-6 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900">{template.name}</h4>
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2 w-16">
                        <div 
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${template.confidence * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-600">{Math.round(template.confidence * 100)}%</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>{template.duration} minutes</span>
                    <span className="capitalize">{template.type.replace('_', ' ')}</span>
                  </div>
                  <div className="mt-3">
                    <p className="text-sm font-medium text-gray-900 mb-2">Suggested Agenda:</p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {template.suggestedAgenda.map((item: string, index: number) => (
                        <li key={index}>• {item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-sm text-gray-600">Analyzing meeting patterns...</p>
          </div>
        )}
      </div>
    </div>
  );
}
