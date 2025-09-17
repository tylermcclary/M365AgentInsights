"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Search,
  Eye,
  EyeOff,
  Sparkles,
  AlertCircle,
  Target,
  Settings,
} from "lucide-react";
import { clients, meetings, type SampleClient, type MeetingType } from "@/data/sampleData";
import Button from "@/components/ui/Button";
import { getCommunicationsByClient } from "@/data/sampleData";
import { useMeetingErrorHandler } from "./MeetingErrorBoundary";
import AssistantPanel from "@/components/ai-agent/AssistantPanel";
import { Communication } from "@/services/ai-types";

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
  
  const [selectedClient, setSelectedClient] = useState<SampleClient | null>(null);
  const [filteredClients, setFilteredClients] = useState<SampleClient[]>([]);
  const [showClientDropdown, setShowClientDropdown] = useState(false);
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

  const [clientSearch, setClientSearch] = useState(initialClientEmail || "");

  // Helper function to convert sample data to Communication format
  const convertToCommunications = (clientId: string) => {
    const comms = getCommunicationsByClient(clientId);
    const communications: Communication[] = [];
    
    // Convert emails
    comms.emails.forEach(email => {
      communications.push({
        id: email.id,
        type: "email" as const,
        from: email.from.address,
        subject: email.subject,
        body: email.body,
        timestamp: email.receivedDateTime
      });
    });
    
    // Convert events
    comms.events.forEach(event => {
      communications.push({
        id: event.id,
        type: "event" as const,
        from: event.organizer.address,
        subject: event.subject,
        body: event.notes || "",
        timestamp: event.start
      });
    });
    
    // Convert chats
    comms.chats.forEach(chat => {
      communications.push({
        id: chat.id,
        type: "chat" as const,
        from: chat.from,
        subject: "Teams Message",
        body: chat.content,
        timestamp: chat.createdDateTime
      });
    });
    
    // Convert meetings
    comms.meetings.forEach(meeting => {
      communications.push({
        id: meeting.id,
        type: "meeting" as const,
        from: "advisor@example.com", // Default advisor email
        subject: meeting.subject,
        body: meeting.description || "",
        timestamp: meeting.startTime,
        meetingType: meeting.meetingType,
        meetingStatus: meeting.status,
        meetingDuration: Math.round((new Date(meeting.endTime).getTime() - new Date(meeting.startTime).getTime()) / (1000 * 60)), // Calculate duration
        meetingLocation: meeting.location,
        meetingUrl: meeting.meetingUrl,
        meetingAgenda: meeting.agenda,
        meetingNotes: meeting.notes,
        attendees: meeting.attendees,
        endTime: meeting.endTime
      });
    });
    
    return communications;
  };

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
      }
    }
  }, [initialClientEmail]);


  const handleClientSelect = (client: SampleClient) => {
    setSelectedClient(client);
    setClientSearch(client.email);
    setShowClientDropdown(false);
  };


  const getMeetingTemplates = (): MeetingTemplate[] => {
    return [
      {
        id: "portfolio_review",
        name: "Portfolio Review",
        type: "portfolio_review",
        duration: 60,
        suggestedAgenda: [
          "Review current portfolio performance",
          "Discuss allocation adjustments",
          "Risk assessment",
          "Goal progress update"
        ],
        description: "Comprehensive review of client's investment portfolio"
      },
      {
        id: "planning_session",
        name: "Planning Session",
        type: "planning_session",
        duration: 90,
        suggestedAgenda: [
          "Financial goal review",
          "Life event planning",
          "Strategy adjustments",
          "Action plan development"
        ],
        description: "Strategic planning for long-term financial goals"
      },
      {
        id: "urgent_consultation",
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
  };

  const applyTemplate = (template: MeetingTemplate) => {
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

    // Note: AI analysis will be handled automatically by the AssistantPanel

    onSchedule(meetingData);
  };



  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        zIndex: 2000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px"
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        style={{
          width: "75vw",
          height: "75vh",
          maxWidth: "1200px",
          maxHeight: "800px",
          backgroundColor: "white",
          borderRadius: "8px",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden"
        }}
      >
        {/* Modal Header */}
        <div style={{
          padding: "20px 24px",
          borderBottom: "1px solid #edebe9",
          backgroundColor: "#faf9f8",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0
        }}>
          <div>
            <h2 style={{
              margin: 0,
              fontSize: "20px",
              fontWeight: 600,
              color: "#323130"
            }}>
              Schedule Meeting with AI Insights
            </h2>
            <p style={{
              margin: "4px 0 0 0",
              fontSize: "14px",
              color: "#605e5c"
            }}>
              Create a new meeting with AI-powered insights
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: "18px",
              cursor: "pointer",
              color: "#605e5c",
              padding: "4px",
              borderRadius: "4px"
            }}
            onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = "#f3f2f1"}
            onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = "transparent"}
          >
            ×
          </button>
        </div>

        {/* Modal Content */}
        <div style={{
          flex: 1,
          display: "flex",
          overflow: "hidden"
        }}>
          {/* Main Form - Left Side */}
          <div style={{
            flex: 1,
            padding: "24px",
            overflowY: "auto",
            borderRight: "1px solid #edebe9"
          }}>
            <form onSubmit={handleSubmit}>
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                {/* Client Selection */}
                <div style={{ position: "relative" }}>
                  <label style={{
                    display: "block",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "#605e5c",
                    marginBottom: "4px",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px"
                  }}>
                    Client Email <span style={{ color: "#d13438" }}>*</span>
                  </label>
                  <div style={{ position: "relative" }}>
                    <Search style={{
                      position: "absolute",
                      left: "12px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      height: "16px",
                      width: "16px",
                      color: "#605e5c",
                      zIndex: 1
                    }} />
                    <input
                      type="text"
                      value={clientSearch}
                      onChange={(e) => setClientSearch(e.target.value)}
                      placeholder="Search client by name or email"
                      style={{
                        width: "100%",
                        minWidth: 0,
                        paddingLeft: "40px",
                        paddingRight: "16px",
                        paddingTop: "8px",
                        paddingBottom: "8px",
                        border: "1px solid #edebe9",
                        borderRadius: "4px",
                        fontSize: "14px",
                        color: "#323130",
                        backgroundColor: "#ffffff",
                        boxSizing: "border-box"
                      }}
                      required
                    />
                  </div>
                  
                  {showClientDropdown && filteredClients.length > 0 && !selectedClient && (
                    <div style={{
                      position: "absolute",
                      top: "100%",
                      left: 0,
                      right: 0,
                      zIndex: 1000,
                      marginTop: "4px",
                      backgroundColor: "white",
                      border: "1px solid #edebe9",
                      borderRadius: "4px",
                      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                      maxHeight: "240px",
                      overflow: "auto"
                    }}>
                      {filteredClients.map(client => (
                        <div
                          key={client.id}
                          style={{
                            padding: "12px",
                            cursor: "pointer",
                            borderBottom: "1px solid #f3f2f1"
                          }}
                          onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = "#f3f2f1"}
                          onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = "transparent"}
                          onClick={() => handleClientSelect(client)}
                        >
                          <div style={{ fontWeight: 600, color: "#323130", fontSize: "14px" }}>{client.name}</div>
                          <div style={{ fontSize: "12px", color: "#605e5c" }}>{client.email}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  {clientSearch && !selectedClient && filteredClients.length === 0 && (
                    <div style={{
                      marginTop: "8px",
                      padding: "12px",
                      backgroundColor: "#fff4ce",
                      border: "1px solid #ffb900",
                      borderRadius: "4px"
                    }}>
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <AlertCircle style={{ height: "16px", width: "16px", color: "#ff8c00", marginRight: "8px" }} />
                        <span style={{ fontSize: "12px", color: "#8a8886" }}>No client found with this email. Please check the email or add the client first.</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Selected Client Info */}
                {selectedClient && (
                  <div style={{
                    padding: "16px",
                    backgroundColor: "#deecf9",
                    border: "1px solid #0078d4",
                    borderRadius: "4px"
                  }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div>
                        <h3 style={{ fontWeight: 600, color: "#0078d4", margin: 0, fontSize: "14px" }}>{selectedClient.name}</h3>
                        <p style={{ fontSize: "12px", color: "#0078d4", margin: "4px 0 0 0" }}>{selectedClient.email}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedClient(null);
                          setClientSearch("");
                        }}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#0078d4",
                          fontSize: "12px",
                          cursor: "pointer",
                          textDecoration: "underline"
                        }}
                      >
                        Change Client
                      </button>
                    </div>
                  </div>
                )}

                {/* Meeting Templates */}
                {selectedClient && (
                  <div>
                    <label style={{
                      display: "block",
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "#605e5c",
                      marginBottom: "8px",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px"
                    }}>
                      Quick Templates
                    </label>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      {getMeetingTemplates().map(template => (
                        <button
                          key={template.id}
                          type="button"
                          onClick={() => applyTemplate(template)}
                          style={{
                            padding: "12px",
                            textAlign: "left",
                            border: "1px solid #edebe9",
                            borderRadius: "4px",
                            backgroundColor: "#ffffff",
                            cursor: "pointer",
                            transition: "all 0.2s ease"
                          }}
                          onMouseEnter={(e) => {
                            (e.target as HTMLElement).style.backgroundColor = "#f3f2f1";
                            (e.target as HTMLElement).style.borderColor = "#0078d4";
                          }}
                          onMouseLeave={(e) => {
                            (e.target as HTMLElement).style.backgroundColor = "#ffffff";
                            (e.target as HTMLElement).style.borderColor = "#edebe9";
                          }}
                        >
                          <div style={{ fontWeight: 600, color: "#323130", fontSize: "14px" }}>{template.name}</div>
                          <div style={{ fontSize: "12px", color: "#605e5c", marginTop: "2px" }}>{template.description}</div>
                          <div style={{ fontSize: "11px", color: "#8a8886", marginTop: "4px" }}>{template.duration} minutes</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Form Fields in Key-Value Layout */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div style={{ minWidth: 0 }}>
                    <label style={{
                      display: "block",
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "#605e5c",
                      marginBottom: "4px",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px"
                    }}>
                      Subject <span style={{ color: "#d13438" }}>*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.subject}
                      onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                      style={{
                        width: "100%",
                        minWidth: 0,
                        padding: "8px 12px",
                        border: "1px solid #edebe9",
                        borderRadius: "4px",
                        fontSize: "14px",
                        color: "#323130",
                        backgroundColor: "#ffffff",
                        boxSizing: "border-box"
                      }}
                      required
                    />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <label style={{
                      display: "block",
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "#605e5c",
                      marginBottom: "4px",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px"
                    }}>
                      Meeting Type
                    </label>
                    <select
                      value={formData.meetingType}
                      onChange={(e) => setFormData(prev => ({ ...prev, meetingType: e.target.value as MeetingType }))}
                      style={{
                        width: "100%",
                        minWidth: 0,
                        padding: "8px 12px",
                        border: "1px solid #edebe9",
                        borderRadius: "4px",
                        fontSize: "14px",
                        color: "#323130",
                        backgroundColor: "#ffffff",
                        boxSizing: "border-box"
                      }}
                    >
                      <option value="scheduled_call">Scheduled Call</option>
                      <option value="portfolio_review">Portfolio Review</option>
                      <option value="planning_session">Planning Session</option>
                      <option value="urgent_consultation">Urgent Consultation</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div style={{ minWidth: 0 }}>
                    <label style={{
                      display: "block",
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "#605e5c",
                      marginBottom: "4px",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px"
                    }}>
                      Start Time <span style={{ color: "#d13438" }}>*</span>
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.startTime}
                      onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                      style={{
                        width: "100%",
                        minWidth: 0,
                        padding: "8px 12px",
                        border: "1px solid #edebe9",
                        borderRadius: "4px",
                        fontSize: "14px",
                        color: "#323130",
                        backgroundColor: "#ffffff",
                        boxSizing: "border-box"
                      }}
                      required
                    />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <label style={{
                      display: "block",
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "#605e5c",
                      marginBottom: "4px",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px"
                    }}>
                      End Time <span style={{ color: "#d13438" }}>*</span>
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.endTime}
                      onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                      style={{
                        width: "100%",
                        minWidth: 0,
                        padding: "8px 12px",
                        border: "1px solid #edebe9",
                        borderRadius: "4px",
                        fontSize: "14px",
                        color: "#323130",
                        backgroundColor: "#ffffff",
                        boxSizing: "border-box"
                      }}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div style={{ minWidth: 0 }}>
                    <label style={{
                      display: "block",
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "#605e5c",
                      marginBottom: "4px",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px"
                    }}>
                      Location
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="e.g., Office Conference Room A"
                      style={{
                        width: "100%",
                        minWidth: 0,
                        padding: "8px 12px",
                        border: "1px solid #edebe9",
                        borderRadius: "4px",
                        fontSize: "14px",
                        color: "#323130",
                        backgroundColor: "#ffffff",
                        boxSizing: "border-box"
                      }}
                    />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <label style={{
                      display: "block",
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "#605e5c",
                      marginBottom: "4px",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px"
                    }}>
                      Meeting URL
                    </label>
                    <input
                      type="url"
                      value={formData.meetingUrl}
                      onChange={(e) => setFormData(prev => ({ ...prev, meetingUrl: e.target.value }))}
                      placeholder="https://teams.microsoft.com/l/meetup-join/..."
                      style={{
                        width: "100%",
                        minWidth: 0,
                        padding: "8px 12px",
                        border: "1px solid #edebe9",
                        borderRadius: "4px",
                        fontSize: "14px",
                        color: "#323130",
                        backgroundColor: "#ffffff",
                        boxSizing: "border-box"
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{
                    display: "block",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "#605e5c",
                    marginBottom: "4px",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px"
                  }}>
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    placeholder="Meeting description..."
                    style={{
                      width: "100%",
                      minWidth: 0,
                      padding: "8px 12px",
                      border: "1px solid #edebe9",
                      borderRadius: "4px",
                      fontSize: "14px",
                      color: "#323130",
                      backgroundColor: "#ffffff",
                      resize: "vertical",
                      boxSizing: "border-box"
                    }}
                  />
                </div>

                <div>
                  <label style={{
                    display: "block",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "#605e5c",
                    marginBottom: "4px",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px"
                  }}>
                    Agenda
                  </label>
                  <textarea
                    value={formData.agenda}
                    onChange={(e) => setFormData(prev => ({ ...prev, agenda: e.target.value }))}
                    rows={4}
                    placeholder="Meeting agenda items..."
                    style={{
                      width: "100%",
                      minWidth: 0,
                      padding: "8px 12px",
                      border: "1px solid #edebe9",
                      borderRadius: "4px",
                      fontSize: "14px",
                      color: "#323130",
                      backgroundColor: "#ffffff",
                      resize: "vertical",
                      fontFamily: "inherit",
                      lineHeight: "1.5",
                      boxSizing: "border-box"
                    }}
                  />
                </div>

                {/* Action Buttons */}
                <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "24px" }}>
                  <button
                    type="button"
                    onClick={onClose}
                    style={{
                      padding: "8px 16px",
                      border: "1px solid #edebe9",
                      borderRadius: "4px",
                      backgroundColor: "#ffffff",
                      color: "#323130",
                      fontSize: "14px",
                      cursor: "pointer",
                      fontWeight: 600
                    }}
                    onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = "#f3f2f1"}
                    onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = "#ffffff"}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!selectedClient}
                    style={{
                      padding: "8px 16px",
                      border: "none",
                      borderRadius: "4px",
                      backgroundColor: !selectedClient ? "#f3f2f1" : "#0078d4",
                      color: !selectedClient ? "#8a8886" : "#ffffff",
                      fontSize: "14px",
                      cursor: !selectedClient ? "not-allowed" : "pointer",
                      fontWeight: 600
                    }}
                    onMouseEnter={(e) => {
                      if (selectedClient) {
                        (e.target as HTMLElement).style.backgroundColor = "#106ebe";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedClient) {
                        (e.target as HTMLElement).style.backgroundColor = "#0078d4";
                      }
                    }}
                  >
                    Schedule Meeting
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* AI Insights Panel - Right Side */}
          {selectedClient && (
            <div style={{
              width: "400px",
              minWidth: "350px",
              backgroundColor: "#ffffff",
              borderLeft: "1px solid #edebe9",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden"
            }}>
              {/* AI Panel Content */}
              <div style={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
                <AssistantPanel
                  email={null}
                  defaultOpen={true}
                  onCollapse={() => {
                    // Optional: Could close the entire scheduler or just hide the panel
                    console.log("AI Panel collapsed in scheduler");
                  }}
                  communications={(() => {
                    const comms = convertToCommunications(selectedClient.id);
                    console.log("📊 SmartMeetingScheduler - Providing communications to AssistantPanel:", {
                      clientId: selectedClient.id,
                      clientEmail: selectedClient.email,
                      communicationsCount: comms.length,
                      sampleComm: comms[0]
                    });
                    return comms;
                  })()}
                  clientEmail={selectedClient.email}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}