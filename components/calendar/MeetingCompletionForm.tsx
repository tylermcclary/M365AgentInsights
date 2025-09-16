"use client";

import React, { useState, useEffect } from "react";
import {
  Clock,
  Users,
  Target,
  TrendingUp,
  MessageSquare,
  Calendar,
  Star,
  FileText,
} from "lucide-react";
import { type SampleMeeting, type SampleClient } from "@/data/sampleData";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { AIProcessingManager } from "@/services/ai-processing-manager";
import { triggerAnalysisForClient } from "@/services/contextAnalyzer";

interface MeetingOutcome {
  id: string;
  description: string;
  priority: "high" | "medium" | "low";
  dueDate?: string;
  assignedTo: string;
  status: "pending" | "in_progress" | "completed";
}

interface MeetingAnalysis {
  effectivenessScore: number; // 1-10
  clientSatisfaction: "high" | "medium" | "low";
  keyTopics: string[];
  actionItems: MeetingOutcome[];
  followUpNeeded: boolean;
  nextMeetingSuggested: boolean;
  relationshipImpact: "positive" | "neutral" | "negative";
  insights: string[];
}

interface MeetingCompletionData {
  meetingId: string;
  clientId: string;
  completionData: {
    notes: string;
    outcomes: string;
    clientFeedback: string;
    nextSteps: string;
    effectivenessRating: number;
    clientSatisfactionRating: number;
    completedAt: string;
    aiAnalysis: MeetingAnalysis | null;
  };
}

interface MeetingCompletionFormProps {
  meeting: SampleMeeting;
  client: SampleClient;
  onComplete: (completionData: MeetingCompletionData) => void;
  onClose: () => void;
}

export default function MeetingCompletionForm({ meeting, client, onComplete, onClose }: MeetingCompletionFormProps) {
  const [formData, setFormData] = useState({
    notes: "",
    outcomes: "",
    clientFeedback: "",
    nextSteps: "",
    effectivenessRating: 5,
    clientSatisfactionRating: 5,
  });

  const [aiAnalysis, setAiAnalysis] = useState<MeetingAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiProcessingManager] = useState(() => new AIProcessingManager());

  // Analyze meeting notes when form data changes
  useEffect(() => {
    if (formData.notes.length > 50) {
      const timeoutId = setTimeout(() => {
        analyzeMeetingNotes();
      }, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [formData.notes]);

  const analyzeMeetingNotes = async () => {
    setIsAnalyzing(true);
    try {

      // For now, generate mock analysis based on form data
      const mockAnalysis: MeetingAnalysis = {
        effectivenessScore: formData.effectivenessRating,
        clientSatisfaction: formData.clientSatisfactionRating >= 7 ? "high" : 
                           formData.clientSatisfactionRating >= 5 ? "medium" : "low",
        keyTopics: extractTopicsFromNotes(formData.notes),
        actionItems: generateActionItems(formData.nextSteps),
        followUpNeeded: formData.nextSteps.length > 0,
        nextMeetingSuggested: formData.effectivenessRating >= 6,
        relationshipImpact: formData.clientSatisfactionRating >= 7 ? "positive" : 
                           formData.clientSatisfactionRating >= 5 ? "neutral" : "negative",
        insights: generateInsights(formData),
      };

      setAiAnalysis(mockAnalysis);
    } catch (error) {
      console.error("Failed to analyze meeting notes:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const extractTopicsFromNotes = (notes: string): string[] => {
    const topics = [];
    if (notes.toLowerCase().includes('portfolio')) topics.push('portfolio review');
    if (notes.toLowerCase().includes('risk')) topics.push('risk tolerance');
    if (notes.toLowerCase().includes('retirement')) topics.push('retirement planning');
    if (notes.toLowerCase().includes('goal')) topics.push('financial goals');
    if (notes.toLowerCase().includes('market')) topics.push('market outlook');
    if (notes.toLowerCase().includes('tax')) topics.push('tax planning');
    return topics;
  };

  const generateActionItems = (nextSteps: string): MeetingOutcome[] => {
    if (!nextSteps.trim()) return [];
    
    const items: MeetingOutcome[] = [];
    const lines = nextSteps.split('\n').filter(line => line.trim());
    
    lines.forEach((line, index) => {
      if (line.trim()) {
        items.push({
          id: `action-${index}`,
          description: line.trim(),
          priority: line.toLowerCase().includes('urgent') || line.toLowerCase().includes('asap') ? 'high' : 'medium',
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 week from now
          assignedTo: 'advisor',
          status: 'pending',
        });
      }
    });
    
    return items;
  };

  const generateInsights = (data: typeof formData): string[] => {
    const insights = [];
    
    if (data.effectivenessRating >= 8) {
      insights.push("Highly effective meeting with strong client engagement");
    } else if (data.effectivenessRating <= 4) {
      insights.push("Meeting effectiveness could be improved");
    }
    
    if (data.clientSatisfactionRating >= 8) {
      insights.push("Client expressed high satisfaction");
    } else if (data.clientSatisfactionRating <= 4) {
      insights.push("Client satisfaction concerns noted");
    }
    
    if (data.nextSteps.length > 0) {
      insights.push("Clear action items identified for follow-up");
    }
    
    if (data.clientFeedback.toLowerCase().includes('concern')) {
      insights.push("Client concerns require immediate attention");
    }
    
    return insights;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const completionData = {
      meetingId: meeting.id,
      clientId: client.id,
      completionData: {
        ...formData,
        completedAt: new Date().toISOString(),
        aiAnalysis,
      },
    };

    // Trigger AI analysis for the client after meeting completion
    try {
      await triggerAnalysisForClient(client.email);
    } catch (error) {
      console.error("Failed to trigger client analysis:", error);
    }

    onComplete(completionData);
  };

  const getSatisfactionColor = (rating: number) => {
    if (rating >= 7) return "text-green-600";
    if (rating >= 5) return "text-yellow-600";
    return "text-red-600";
  };

  const getEffectivenessColor = (rating: number) => {
    if (rating >= 8) return "text-green-600";
    if (rating >= 6) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <Modal open={true} title="Complete Meeting" onClose={onClose}>
      <div className="flex h-[80vh] min-h-[600px]">
        {/* Main Form */}
        <div className="flex-1 p-6 overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Meeting Info */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">{meeting.subject}</h3>
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  {new Date(meeting.startTime).toLocaleDateString()}
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  {Math.round((new Date(meeting.endTime).getTime() - new Date(meeting.startTime).getTime()) / (1000 * 60))} minutes
                </div>
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  {client.name}
                </div>
                <div className="flex items-center">
                  <Target className="h-4 w-4 mr-2" />
                  {meeting.meetingType.replace('_', ' ')}
                </div>
              </div>
            </div>

            {/* Meeting Notes */}
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                Meeting Notes <span className="text-red-500">*</span>
              </label>
              <textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Record key discussion points, decisions made, and important information..."
                required
              />
            </div>

            {/* Outcomes */}
            <div>
              <label htmlFor="outcomes" className="block text-sm font-medium text-gray-700 mb-2">
                Meeting Outcomes
              </label>
              <textarea
                id="outcomes"
                value={formData.outcomes}
                onChange={(e) => setFormData(prev => ({ ...prev, outcomes: e.target.value }))}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="What was accomplished? What decisions were made?"
              />
            </div>

            {/* Client Feedback */}
            <div>
              <label htmlFor="clientFeedback" className="block text-sm font-medium text-gray-700 mb-2">
                Client Feedback
              </label>
              <textarea
                id="clientFeedback"
                value={formData.clientFeedback}
                onChange={(e) => setFormData(prev => ({ ...prev, clientFeedback: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="What did the client say about the meeting? Any concerns or positive feedback?"
              />
            </div>

            {/* Next Steps */}
            <div>
              <label htmlFor="nextSteps" className="block text-sm font-medium text-gray-700 mb-2">
                Next Steps
              </label>
              <textarea
                id="nextSteps"
                value={formData.nextSteps}
                onChange={(e) => setFormData(prev => ({ ...prev, nextSteps: e.target.value }))}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="What needs to happen next? List action items..."
              />
            </div>

            {/* Ratings */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label htmlFor="effectivenessRating" className="block text-sm font-medium text-gray-700 mb-2">
                  Meeting Effectiveness (1-10)
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="range"
                    id="effectivenessRating"
                    min="1"
                    max="10"
                    value={formData.effectivenessRating}
                    onChange={(e) => setFormData(prev => ({ ...prev, effectivenessRating: parseInt(e.target.value) }))}
                    className="flex-1"
                  />
                  <span className={`font-semibold ${getEffectivenessColor(formData.effectivenessRating)}`}>
                    {formData.effectivenessRating}/10
                  </span>
                </div>
              </div>
              <div>
                <label htmlFor="clientSatisfactionRating" className="block text-sm font-medium text-gray-700 mb-2">
                  Client Satisfaction (1-10)
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="range"
                    id="clientSatisfactionRating"
                    min="1"
                    max="10"
                    value={formData.clientSatisfactionRating}
                    onChange={(e) => setFormData(prev => ({ ...prev, clientSatisfactionRating: parseInt(e.target.value) }))}
                    className="flex-1"
                  />
                  <span className={`font-semibold ${getSatisfactionColor(formData.clientSatisfactionRating)}`}>
                    {formData.clientSatisfactionRating}/10
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <Button type="button" variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={!formData.notes.trim()}>
                Complete Meeting
              </Button>
            </div>
          </form>
        </div>

        {/* AI Analysis Sidebar */}
        <div className="w-96 border-l bg-gray-50 p-6 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <TrendingUp className="h-5 w-5 text-blue-600 mr-2" />
              AI Analysis
            </h3>
            {isAnalyzing && (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            )}
          </div>

          {aiAnalysis && (
            <div className="space-y-6">
              {/* Effectiveness Score */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Effectiveness Score</h4>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${aiAnalysis.effectivenessScore >= 8 ? 'bg-green-500' : aiAnalysis.effectivenessScore >= 6 ? 'bg-yellow-500' : 'bg-red-500'}`}
                      style={{ width: `${(aiAnalysis.effectivenessScore / 10) * 100}%` }}
                    ></div>
                  </div>
                  <span className="font-semibold text-gray-700">{aiAnalysis.effectivenessScore}/10</span>
                </div>
              </div>

              {/* Client Satisfaction */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Client Satisfaction</h4>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  aiAnalysis.clientSatisfaction === 'high' ? 'bg-green-100 text-green-800' :
                  aiAnalysis.clientSatisfaction === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {aiAnalysis.clientSatisfaction}
                </div>
              </div>

              {/* Key Topics */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Key Topics Discussed</h4>
                <div className="flex flex-wrap gap-1">
                  {aiAnalysis.keyTopics.map((topic, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Items */}
              {aiAnalysis.actionItems.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Action Items</h4>
                  <div className="space-y-2">
                    {aiAnalysis.actionItems.map((item) => (
                      <div key={item.id} className="p-2 bg-white border border-gray-200 rounded-md">
                        <div className="text-sm font-medium text-gray-900">{item.description}</div>
                        <div className="flex items-center justify-between mt-1">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            item.priority === 'high' ? 'bg-red-100 text-red-800' :
                            item.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {item.priority}
                          </span>
                          {item.dueDate && (
                            <span className="text-xs text-gray-500">{item.dueDate}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Follow-up Recommendations */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Recommendations</h4>
                <div className="space-y-2">
                  {aiAnalysis.followUpNeeded && (
                    <div className="flex items-center text-sm text-blue-600">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Follow-up communication needed
                    </div>
                  )}
                  {aiAnalysis.nextMeetingSuggested && (
                    <div className="flex items-center text-sm text-green-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      Schedule next meeting
                    </div>
                  )}
                </div>
              </div>

              {/* Relationship Impact */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Relationship Impact</h4>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  aiAnalysis.relationshipImpact === 'positive' ? 'bg-green-100 text-green-800' :
                  aiAnalysis.relationshipImpact === 'neutral' ? 'bg-gray-100 text-gray-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {aiAnalysis.relationshipImpact}
                </div>
              </div>

              {/* Insights */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Key Insights</h4>
                <ul className="space-y-1">
                  {aiAnalysis.insights.map((insight, index) => (
                    <li key={index} className="text-sm text-gray-600 flex items-start">
                      <Star className="h-3 w-3 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                      {insight}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {!aiAnalysis && formData.notes.length < 50 && (
            <div className="text-center py-8">
              <FileText className="h-8 w-8 text-gray-400 mx-auto mb-4" />
              <p className="text-sm text-gray-600">Add meeting notes to see AI analysis</p>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
