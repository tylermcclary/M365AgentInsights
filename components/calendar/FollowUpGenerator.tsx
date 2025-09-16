"use client";

import React, { useState, useEffect } from "react";
import {
  Send,
  Mail,
  Phone,
  Calendar,
  Clock,
  CheckCircle,
  Star,
  MessageSquare,
  Copy,
} from "lucide-react";
import { clients, type SampleMeeting } from "@/data/sampleData";
import { MeetingAnalysisService, type MeetingAnalysis } from "@/services/meeting-analysis";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";

interface FollowUpSuggestion {
  type: "email" | "call" | "meeting";
  subject: string;
  content: string;
  timing: "immediate" | "short_term" | "long_term";
  priority: "high" | "medium" | "low";
}

interface FollowUpGeneratorProps {
  meeting: SampleMeeting;
  meetingAnalysis: MeetingAnalysis;
  onClose: () => void;
}

export default function FollowUpGenerator({ meeting, meetingAnalysis, onClose }: FollowUpGeneratorProps) {
  const [suggestions, setSuggestions] = useState<FollowUpSuggestion[]>([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState<FollowUpSuggestion | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [customizedContent, setCustomizedContent] = useState("");

  useEffect(() => {
    generateFollowUpSuggestions();
  }, [meeting, meetingAnalysis]);

  const generateFollowUpSuggestions = async () => {
    setIsGenerating(true);
    try {
      const followUpSuggestions = MeetingAnalysisService.generateFollowUpSuggestions(
        meeting.id,
        meetingAnalysis
      );
      setSuggestions(followUpSuggestions);
      
      // Set the first suggestion as selected by default
      if (followUpSuggestions.length > 0) {
        setSelectedSuggestion(followUpSuggestions[0]);
        setCustomizedContent(followUpSuggestions[0].content);
      }
    } catch (error) {
      console.error("Failed to generate follow-up suggestions:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSuggestionSelect = (suggestion: FollowUpSuggestion) => {
    setSelectedSuggestion(suggestion);
    setCustomizedContent(suggestion.content);
  };

  const handleSendFollowUp = () => {
    if (selectedSuggestion) {
      console.log("Sending follow-up:", {
        ...selectedSuggestion,
        content: customizedContent,
        meetingId: meeting.id,
        timestamp: new Date().toISOString(),
      });
      // In a real app, this would send the communication
      onClose();
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(customizedContent);
  };

  const getTimingColor = (timing: string) => {
    switch (timing) {
      case "immediate": return "text-red-600 bg-red-50";
      case "short_term": return "text-yellow-600 bg-yellow-50";
      case "long_term": return "text-green-600 bg-green-50";
      default: return "text-gray-600 bg-gray-50";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "text-red-600 bg-red-50";
      case "medium": return "text-yellow-600 bg-yellow-50";
      case "low": return "text-green-600 bg-green-50";
      default: return "text-gray-600 bg-gray-50";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "email": return <Mail className="h-4 w-4" />;
      case "call": return <Phone className="h-4 w-4" />;
      case "meeting": return <Calendar className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  const client = clients.find(c => c.id === meeting.clientId);

  return (
    <Modal open={true} title="Generate Follow-up Communication" onClose={onClose}>
      <div className="flex h-[80vh] min-h-[600px]">
        {/* Suggestions Sidebar */}
        <div className="w-80 border-r bg-gray-50 p-6 overflow-y-auto">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Star className="h-5 w-5 text-blue-600 mr-2" />
            AI Suggestions
          </h3>

          {isGenerating ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-sm text-gray-600">Generating suggestions...</p>
            </div>
          ) : (
            <div className="space-y-3">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionSelect(suggestion)}
                  className={`w-full p-4 text-left rounded-lg border transition-colors ${
                    selectedSuggestion === suggestion
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {getTypeIcon(suggestion.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 text-sm mb-1">
                        {suggestion.subject}
                      </h4>
                      <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                        {suggestion.content}
                      </p>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTimingColor(suggestion.timing)}`}>
                          {suggestion.timing.replace('_', ' ')}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(suggestion.priority)}`}>
                          {suggestion.priority}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {suggestions.length === 0 && !isGenerating && (
            <div className="text-center py-8">
              <MessageSquare className="h-8 w-8 text-gray-400 mx-auto mb-4" />
              <p className="text-sm text-gray-600">No follow-up suggestions available</p>
            </div>
          )}
        </div>

        {/* Content Editor */}
        <div className="flex-1 p-6 overflow-y-auto">
          {selectedSuggestion ? (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Follow-up Communication</h3>
                  <p className="text-sm text-gray-600">
                    {client?.name} • {meeting.subject}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTimingColor(selectedSuggestion.timing)}`}>
                    {selectedSuggestion.timing.replace('_', ' ')}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(selectedSuggestion.priority)}`}>
                    {selectedSuggestion.priority}
                  </span>
                </div>
              </div>

              {/* Communication Type */}
              <div className="flex items-center space-x-2">
                {getTypeIcon(selectedSuggestion.type)}
                <span className="font-medium text-gray-900 capitalize">
                  {selectedSuggestion.type} Communication
                </span>
              </div>

              {/* Subject */}
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  value={selectedSuggestion.subject}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  readOnly
                />
              </div>

              {/* Content */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                    Content
                  </label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={copyToClipboard}
                    leftIcon={<Copy className="h-4 w-4" />}
                  >
                    Copy
                  </Button>
                </div>
                <textarea
                  id="content"
                  value={customizedContent}
                  onChange={(e) => setCustomizedContent(e.target.value)}
                  rows={12}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Customize the follow-up content..."
                />
              </div>

              {/* Meeting Context */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Meeting Context</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(meeting.startTime).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4" />
                    <span>{Math.round((new Date(meeting.endTime).getTime() - new Date(meeting.startTime).getTime()) / (1000 * 60))} minutes</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Star className="h-4 w-4" />
                    <span>Effectiveness: {meetingAnalysis.effectivenessScore}/10</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4" />
                    <span>Satisfaction: {meetingAnalysis.clientSatisfaction}</span>
                  </div>
                </div>
              </div>

              {/* Action Items Reference */}
              {meetingAnalysis.actionItems.length > 0 && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Action Items from Meeting</h4>
                  <ul className="space-y-1 text-sm text-blue-800">
                    {meetingAnalysis.actionItems.map((item, index) => (
                      <li key={index} className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>{item.description}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end space-x-3">
                <Button variant="secondary" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSendFollowUp}
                  leftIcon={<Send className="h-4 w-4" />}
                >
                  Send {selectedSuggestion.type === "email" ? "Email" : 
                        selectedSuggestion.type === "call" ? "Schedule Call" : 
                        "Schedule Meeting"}
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Follow-up Suggestion</h3>
              <p className="text-gray-600">Choose from the AI-generated suggestions on the left to customize and send.</p>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
