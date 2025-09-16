"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Search,
  Eye,
  EyeOff,
  Sparkles,
  AlertCircle,
  Target,
} from "lucide-react";
import { clients, meetings, type SampleClient, type MeetingType } from "@/data/sampleData";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { AIProcessingManager } from "@/services/ai-processing-manager";
import { analyzeClientCommunications } from "@/services/ai-insights";
import { triggerAnalysisForClient } from "@/services/contextAnalyzer";
import { getCommunicationsByClient } from "@/data/sampleData";
import AIModeSwitcher from "@/components/ai-agent/AIModeSwitcher";
import { AIProcessingMode } from "@/services/ai-types";
import { MeetingLoadingState, MeetingErrorDisplay, useMeetingErrorHandler } from "./MeetingErrorBoundary";

interface MeetingData {
  clientId: string;
  subject: string;
  description: string;
  agenda: string;
  startTime: string;
  endTime: string;
  location: string;
  meetingUrl: string;
  meetingType: MeetingType;
  attendees: Array<{ name: string; address: string }>;
  status: "scheduled";
  createdDateTime: string;
  lastModifiedDateTime: string;
}

interface SmartMeetingSchedulerProps {
  onClose: () => void;
  onSchedule: (meetingData: MeetingData) => void;
  initialClientEmail?: string;
}

interface ClientInsights {
  summary: string;
  sentiment: "positive" | "neutral" | "negative";
  recentTopics: string[];
  suggestedMeetingType: MeetingType;
  relationshipHealth: number;
  lastMeetingDate?: string;
  upcomingActions: string[];
  highlights: Array<{ label: string; value: string }>;
}

interface MeetingTemplate {
  id: string;
  name: string;
  type: MeetingType;
  duration: number;
  suggestedAgenda: string[];
  description: string;
}

export default function SmartMeetingScheduler({ onClose, onSchedule, initialClientEmail }: SmartMeetingSchedulerProps) {
  const [clientSearch, setClientSearch] = useState(initialClientEmail || "");
  const [selectedClient, setSelectedClient] = useState<SampleClient | null>(null);
  const [filteredClients, setFilteredClients] = useState<SampleClient[]>([]);
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  const [clientInsights, setClientInsights] = useState<ClientInsights | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showInsights, setShowInsights] = useState(false);
  const { error, handleError, clearError } = useMeetingErrorHandler();
  
  // Meeting form data
  const [formData, setFormData] = useState({
    subject: "",
    description: "",
    agenda: "",
    startTime: new Date().toISOString().slice(0, 16),
    endTime: new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 16),
    location: "",
    meetingUrl: "",
    meetingType: "scheduled_call" as MeetingType,
  });

  const [, setAiProcessingManager] = useState(() => new AIProcessingManager());
  const [aiMode, setAiMode] = useState<AIProcessingMode>("mock");

  // Handle AI mode changes
  const handleAIModeChange = useCallback((newMode: AIProcessingMode) => {
    setAiMode(newMode);
    setAiProcessingManager(new AIProcessingManager({ mode: newMode }));
    
    // Re-analyze current client if one is selected
    if (selectedClient) {
      analyzeClient(selectedClient);
    }
  }, [selectedClient]);

  // Real-time client search and filtering
  useEffect(() => {
    if (clientSearch.length > 1) {
      const filtered = clients.filter(client =>
        client.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
        client.email.toLowerCase().includes(clientSearch.toLowerCase())
      );
      setFilteredClients(filtered);
      setShowClientDropdown(true);
    } else {
      setFilteredClients([]);
      setShowClientDropdown(false);
    }
  }, [clientSearch]);

  // Auto-select client if initial email provided
  useEffect(() => {
    if (initialClientEmail) {
      const client = clients.find(c => c.email.toLowerCase() === initialClientEmail.toLowerCase());
      if (client) {
        setSelectedClient(client);
        setClientSearch(client.email);
        analyzeClient(client);
      }
    }
  }, [initialClientEmail]);

  // Analyze client when selected
  const analyzeClient = useCallback(async (client: SampleClient) => {
    setIsAnalyzing(true);
    clearError();
    try {
      const comms = getCommunicationsByClient(client.id);
      const communications = [
        ...comms.emails.map(e => ({
          id: e.id,
          type: "email" as const,
          from: client.email,
          subject: e.subject,
          body: e.body,
          timestamp: e.receivedDateTime,
        })),
        ...comms.meetings.map(m => ({
          id: m.id,
          type: "meeting" as const,
          from: client.email,
          subject: m.subject,
          body: `${m.description}\n\nAgenda:\n${m.agenda || 'No agenda'}\n\nNotes:\n${m.notes || 'No notes'}`,
          timestamp: m.startTime,
          meetingType: m.meetingType,
          meetingStatus: m.status,
          meetingDuration: m.startTime && m.endTime ? 
            Math.round((new Date(m.endTime).getTime() - new Date(m.startTime).getTime()) / (1000 * 60)) : undefined,
          meetingLocation: m.location,
          meetingUrl: m.meetingUrl,
          meetingAgenda: m.agenda,
          meetingNotes: m.notes,
          attendees: m.attendees,
          endTime: m.endTime,
        }))
      ];

      const insights = await analyzeClientCommunications(client.email, communications);
      
      // Get client's recent meetings
      const clientMeetings = meetings.filter(m => m.clientId === client.id);
      const lastMeeting = clientMeetings
        .filter(m => m.status === "completed")
        .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())[0];

      // Generate suggested meeting type based on analysis
      const suggestedType = generateSuggestedMeetingType(insights);

      setClientInsights({
        summary: insights.summary.text,
        sentiment: insights.summary.sentiment,
        recentTopics: insights.summary.topics,
        suggestedMeetingType: suggestedType,
        relationshipHealth: insights.summary.frequencyPerWeek > 2 ? 8 : insights.summary.frequencyPerWeek > 1 ? 6 : 4,
        lastMeetingDate: lastMeeting?.startTime,
        upcomingActions: insights.recommendedActions.map(a => a.title),
        highlights: insights.highlights,
      });

      // Pre-populate form with AI suggestions
      setFormData(prev => ({
        ...prev,
        meetingType: suggestedType,
        subject: generateMeetingSubject(suggestedType, client.name),
        agenda: generateAgendaSuggestions(insights),
      }));

    } catch (error) {
      console.error("Failed to analyze client:", error);
      handleError(error instanceof Error ? error : new Error(String(error)));
    } finally {
      setIsAnalyzing(false);
    }
  }, [clearError, handleError]);

  const handleClientSelect = (client: SampleClient) => {
    setSelectedClient(client);
    setClientSearch(client.email);
    setShowClientDropdown(false);
    analyzeClient(client);
  };

  const generateSuggestedMeetingType = (insights: { summary: { topics: string[] } }): MeetingType => {
    // Check for urgent indicators
    if (insights.summary.topics.some((topic: string) => 
      ['market_anxiety', 'risk'].includes(topic))) {
      return "urgent_consultation";
    }

    // Check for portfolio review needs
    if (insights.summary.topics.some((topic: string) => 
      ['portfolio', 'performance'].includes(topic))) {
      return "portfolio_review";
    }

    // Default to scheduled call
    return "scheduled_call";
  };

  const generateMeetingSubject = (type: MeetingType, clientName: string): string => {
    const typeLabels = {
      scheduled_call: "Client Check-in",
      portfolio_review: "Portfolio Review",
      planning_session: "Financial Planning Session",
      urgent_consultation: "Urgent Consultation"
    };
    return `${typeLabels[type]} - ${clientName}`;
  };

  const generateAgendaSuggestions = (insights: { summary: { topics: string[] } }): string => {
    const agendaItems = [];
    
    if (insights.summary.topics.includes('portfolio')) {
      agendaItems.push("• Review current portfolio performance");
      agendaItems.push("• Discuss allocation adjustments");
    }
    
    if (insights.summary.topics.includes('goals')) {
      agendaItems.push("• Review financial goals and timeline");
      agendaItems.push("• Update goal priorities if needed");
    }
    
    if (insights.summary.topics.includes('risk')) {
      agendaItems.push("• Risk tolerance assessment");
      agendaItems.push("• Market outlook discussion");
    }
    
    if (insights.summary.topics.includes('life_events')) {
      agendaItems.push("• Life event planning");
      agendaItems.push("• Impact on financial strategy");
    }
    
    // Add general items
    agendaItems.push("• Review account updates");
    agendaItems.push("• Q&A and next steps");
    
    return agendaItems.join('\n');
  };

  const getMeetingTemplates = (): MeetingTemplate[] => {
    if (!clientInsights) return [];

    const templates: MeetingTemplate[] = [
      {
        id: "routine-checkin",
        name: "Routine Check-in",
        type: "scheduled_call",
        duration: 30,
        suggestedAgenda: [
          "Account performance review",
          "Market updates",
          "Client questions",
          "Next steps"
        ],
        description: "Regular client touchpoint for relationship maintenance"
      },
      {
        id: "portfolio-review",
        name: "Portfolio Review",
        type: "portfolio_review",
        duration: 60,
        suggestedAgenda: [
          "Performance analysis",
          "Asset allocation review",
          "Rebalancing discussion",
          "Strategy adjustments"
        ],
        description: "Comprehensive portfolio analysis and optimization"
      },
      {
        id: "planning-session",
        name: "Planning Session",
        type: "planning_session",
        duration: 90,
        suggestedAgenda: [
          "Goal review and updates",
          "Life event planning",
          "Risk assessment",
          "Long-term strategy"
        ],
        description: "Strategic financial planning and goal alignment"
      },
      {
        id: "urgent-consultation",
        name: "Urgent Consultation",
        type: "urgent_consultation",
        duration: 30,
        suggestedAgenda: [
          "Immediate concerns",
          "Risk mitigation",
          "Quick actions needed",
          "Follow-up planning"
        ],
        description: "Address urgent client concerns or market events"
      }
    ];

    return templates;
  };

  const handleTemplateSelect = (template: MeetingTemplate) => {
    setFormData(prev => ({
      ...prev,
      meetingType: template.type,
      subject: `${template.name} - ${selectedClient?.name}`,
      agenda: template.suggestedAgenda.join('\n'),
      description: template.description,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedClient) {
      alert("Please select a client");
      return;
    }

    if (!formData.subject || !formData.startTime) {
      alert("Please fill in all required fields");
      return;
    }

    const meetingData = {
      ...formData,
      clientId: selectedClient.id,
      attendees: [
        { name: selectedClient.name, address: selectedClient.email },
        { name: "Financial Advisor", address: "advisor@firm.com" }
      ],
      status: "scheduled" as const,
      createdDateTime: new Date().toISOString(),
      lastModifiedDateTime: new Date().toISOString(),
    };

    // Trigger AI analysis for the client after scheduling
    try {
      await triggerAnalysisForClient(selectedClient.email);
    } catch (error) {
      console.error("Failed to trigger client analysis:", error);
    }

    onSchedule(meetingData);
  };


  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600 bg-green-50';
      case 'negative': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getRelationshipHealthColor = (score: number) => {
    if (score >= 7) return 'text-green-600';
    if (score >= 5) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Modal open={true} title="Schedule Meeting with AI Insights" onClose={onClose}>
      <div className="flex h-[80vh] min-h-[600px]">
        {/* Main Form */}
        <div className="flex-1 p-6 overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Client Selection */}
            <div className="relative">
              <label htmlFor="client" className="block text-sm font-medium text-gray-700 mb-2">
                Client Email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  id="client"
                  value={clientSearch}
                  onChange={(e) => setClientSearch(e.target.value)}
                  placeholder="Search client by name or email"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
                {isAnalyzing && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  </div>
                )}
              </div>
              
              {showClientDropdown && filteredClients.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                  {filteredClients.map(client => (
                    <div
                      key={client.id}
                      className="p-3 cursor-pointer hover:bg-gray-100 border-b border-gray-100 last:border-b-0"
                      onClick={() => handleClientSelect(client)}
                    >
                      <div className="font-medium text-gray-900">{client.name}</div>
                      <div className="text-sm text-gray-500">{client.email}</div>
                    </div>
                  ))}
                </div>
              )}

              {clientSearch && !selectedClient && filteredClients.length === 0 && (
                <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <div className="flex items-center">
                    <AlertCircle className="h-4 w-4 text-yellow-600 mr-2" />
                    <span className="text-sm text-yellow-800">No client found with this email. Please check the email or add the client first.</span>
                  </div>
                </div>
              )}
            </div>

            {/* Meeting Templates */}
            {selectedClient && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meeting Templates
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {getMeetingTemplates().map(template => (
                    <button
                      key={template.id}
                      type="button"
                      onClick={() => handleTemplateSelect(template)}
                      className="p-3 text-left border border-gray-200 rounded-md hover:border-blue-500 hover:bg-blue-50 transition-colors"
                    >
                      <div className="font-medium text-gray-900">{template.name}</div>
                      <div className="text-sm text-gray-500 mt-1">{template.description}</div>
                      <div className="text-xs text-gray-400 mt-1">{template.duration} min</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Meeting Details */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                  Subject <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="meetingType" className="block text-sm font-medium text-gray-700 mb-2">
                  Meeting Type
                </label>
                <select
                  id="meetingType"
                  value={formData.meetingType}
                  onChange={(e) => setFormData(prev => ({ ...prev, meetingType: e.target.value as MeetingType }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="scheduled_call">Scheduled Call</option>
                  <option value="portfolio_review">Portfolio Review</option>
                  <option value="planning_session">Planning Session</option>
                  <option value="urgent_consultation">Urgent Consultation</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-2">
                  Start Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  id="startTime"
                  value={formData.startTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-2">
                  End Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  id="endTime"
                  value={formData.endTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="e.g., Office Conference Room A"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label htmlFor="meetingUrl" className="block text-sm font-medium text-gray-700 mb-2">
                  Meeting URL
                </label>
                <input
                  type="url"
                  id="meetingUrl"
                  value={formData.meetingUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, meetingUrl: e.target.value }))}
                  placeholder="e.g., https://teams.microsoft.com/..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="agenda" className="block text-sm font-medium text-gray-700 mb-2">
                Agenda
              </label>
              <textarea
                id="agenda"
                value={formData.agenda}
                onChange={(e) => setFormData(prev => ({ ...prev, agenda: e.target.value }))}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Meeting agenda items..."
              />
            </div>

            <div className="flex justify-end space-x-3">
              <Button type="button" variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={!selectedClient || isAnalyzing}>
                {isAnalyzing ? "Analyzing..." : "Schedule Meeting"}
              </Button>
            </div>
          </form>
        </div>

        {/* AI Insights Sidebar */}
        {selectedClient && (
          <div className="w-96 border-l bg-gray-50 p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Sparkles className="h-5 w-5 text-blue-600 mr-2" />
                AI Insights
              </h3>
              <div className="flex items-center space-x-2">
                <AIModeSwitcher
                  currentMode={aiMode}
                  onModeChange={handleAIModeChange}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowInsights(!showInsights)}
                  leftIcon={showInsights ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                >
                  {showInsights ? "Hide" : "Show"}
                </Button>
              </div>
            </div>

            {clientInsights && showInsights && (
              <div className="space-y-6">
                {/* AI Mode Indicator */}
                <div className="p-2 bg-blue-50 border border-blue-200 rounded-md">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-blue-900">Analysis Mode</span>
                    <span className="text-xs text-blue-700 bg-blue-100 px-2 py-1 rounded-full">
                      {aiMode.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Client Summary */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Client Summary</h4>
                  <p className="text-sm text-gray-600">{clientInsights.summary}</p>
                </div>

                {/* Sentiment & Relationship Health */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Sentiment</h4>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${getSentimentColor(clientInsights.sentiment)}`}>
                      {clientInsights.sentiment}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Relationship Health</h4>
                    <div className={`text-lg font-semibold ${getRelationshipHealthColor(clientInsights.relationshipHealth)}`}>
                      {clientInsights.relationshipHealth}/10
                    </div>
                  </div>
                </div>

                {/* Recent Topics */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Recent Topics</h4>
                  <div className="flex flex-wrap gap-1">
                    {clientInsights.recentTopics.map((topic, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Suggested Meeting Type */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Suggested Meeting Type</h4>
                  <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                    <div className="font-medium text-green-900">
                      {clientInsights.suggestedMeetingType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </div>
                    <div className="text-sm text-green-700 mt-1">
                      Based on recent communication patterns
                    </div>
                  </div>
                </div>

                {/* Last Meeting */}
                {clientInsights.lastMeetingDate && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Last Meeting</h4>
                    <div className="text-sm text-gray-600">
                      {new Date(clientInsights.lastMeetingDate).toLocaleDateString()}
                    </div>
                  </div>
                )}

                {/* Recommended Actions */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Recommended Actions</h4>
                  <ul className="space-y-1">
                    {clientInsights.upcomingActions.slice(0, 3).map((action, index) => (
                      <li key={index} className="text-sm text-gray-600 flex items-start">
                        <Target className="h-3 w-3 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                        {action}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Client Highlights */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Client Highlights</h4>
                  <div className="space-y-2">
                    {clientInsights.highlights.slice(0, 3).map((highlight, index) => (
                      <div key={index} className="text-sm">
                        <span className="font-medium text-gray-900">{highlight.label}:</span>
                        <span className="text-gray-600 ml-1">{highlight.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {!clientInsights && selectedClient && !error && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-sm text-gray-600">Analyzing client data...</p>
              </div>
            )}

            {error && (
              <div className="mb-4">
                <MeetingErrorDisplay 
                  error={error}
                  onRetry={() => selectedClient && analyzeClient(selectedClient)}
                  onDismiss={clearError}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
