"use client";

import React, { useState, useMemo } from "react";
import {
  CommandBar,
  ICommandBarItemProps,
  DetailsList,
  IColumn,
  SelectionMode,
  Panel,
  PanelType,
  Stack,
  Text,
  IconButton,
  PrimaryButton,
  SearchBox,
  Dropdown,
  IDropdownOption,
} from "@fluentui/react";
import { meetings, clients, type SampleMeeting, type MeetingType } from "@/data/sampleData";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import MeetingForm from "./MeetingForm";
import SmartMeetingScheduler from "./SmartMeetingScheduler";
import MeetingCompletionForm from "./MeetingCompletionForm";
import MeetingInsightsDashboard from "./MeetingInsightsDashboard";
import AssistantPanel from "@/components/ai-agent/AssistantPanel";
import { getCommunicationsByClient } from "@/data/sampleData";
import { triggerAnalysisForMeeting } from "@/services/contextAnalyzer";

type ViewMode = "list" | "week" | "month";

interface CalendarInterfaceProps {
  onNavigateToEmail?: () => void;
  showAIPanel?: boolean;
  onAIPanelToggle?: (isOpen: boolean) => void;
}

export default function CalendarInterface({ 
  onNavigateToEmail, 
  showAIPanel = false, 
  onAIPanelToggle 
}: CalendarInterfaceProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<MeetingType | "all">("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSmartScheduler, setShowSmartScheduler] = useState(false);
  const [showCompletionForm, setShowCompletionForm] = useState(false);
  const [showInsightsDashboard, setShowInsightsDashboard] = useState(false);
  const [selectedMeetingForCompletion, setSelectedMeetingForCompletion] = useState<SampleMeeting | null>(null);
  const [selectedMeeting, setSelectedMeeting] = useState<SampleMeeting | null>(null);
  const [showMeetingDetails, setShowMeetingDetails] = useState(false);
  const [isAIPanelOpen, setIsAIPanelOpen] = useState(showAIPanel);

  // Filter meetings based on search and type
  const filteredMeetings = useMemo(() => {
    let filtered = meetings;

    if (searchQuery) {
      filtered = filtered.filter(meeting =>
        meeting.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        meeting.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        meeting.attendees.some(attendee => 
          attendee.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }

    if (filterType !== "all") {
      filtered = filtered.filter(meeting => meeting.meetingType === filterType);
    }

    return filtered.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  }, [searchQuery, filterType]);

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString([], {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Removed getMeetingTypeIcon function as it's not used in Fluent UI implementation

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "scheduled":
        return "bg-blue-100 text-blue-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getClientInfo = (meeting: SampleMeeting) => {
    const client = clients.find(c => c.id === meeting.clientId);
    return client ? { name: client.name, email: client.email } : null;
  };

  const handleMeetingSelect = async (meeting: SampleMeeting) => {
    setSelectedMeeting(meeting);
    setShowMeetingDetails(true);
    setIsAIPanelOpen(true); // Open AI panel when meeting is selected
    
    // Trigger AI analysis for the meeting's client
    const clientInfo = getClientInfo(meeting);
    if (clientInfo) {
      try {
        await triggerAnalysisForMeeting(meeting.id, clientInfo.email);
      } catch (error) {
        console.error("Failed to trigger meeting analysis:", error);
      }
    }
  };

  const handleCompleteMeeting = (meeting: SampleMeeting) => {
    setSelectedMeetingForCompletion(meeting);
    setShowCompletionForm(true);
  };

  const handleMeetingCompletion = (completionData: { meetingId: string; clientId: string; completionData: Record<string, unknown> }) => {
    console.log("Meeting completed:", completionData);
    setShowCompletionForm(false);
    setSelectedMeetingForCompletion(null);
    // In a real app, this would update the meeting status and store completion data
  };

  const handleAIPanelToggle = (isOpen: boolean) => {
    setIsAIPanelOpen(isOpen);
    onAIPanelToggle?.(isOpen);
  };

  // Get communications for AI analysis when a meeting is selected
  const getCommunicationsForMeeting = () => {
    if (!selectedMeeting) return [];
    
    const comms = getCommunicationsByClient(selectedMeeting.clientId);
    const client = clients.find(c => c.id === selectedMeeting.clientId);
    
    if (!client) return [];
    
    return [
      ...comms.emails.map(e => ({
        id: e.id,
        type: "email" as const,
        from: client.email,
        subject: e.subject,
        body: e.body,
        timestamp: e.receivedDateTime,
      })),
      ...comms.events.map(e => ({
        id: e.id,
        type: "event" as const,
        from: client.email,
        subject: e.subject,
        body: e.notes ?? "",
        timestamp: e.start,
      })),
      ...comms.chats.map(c => ({
        id: c.id,
        type: "chat" as const,
        from: client.email,
        subject: c.content.slice(0, 60),
        body: c.content,
        timestamp: c.createdDateTime,
      })),
      ...comms.meetings.map(m => ({
        id: m.id,
        type: "meeting" as const,
        from: client.email,
        subject: m.subject,
        body: `${m.description}\n\nAgenda:\n${m.agenda || 'No agenda'}\n\nNotes:\n${m.notes || 'No notes'}`,
        timestamp: m.startTime,
      }))
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  };

  // CommandBar items for calendar
  const commandBarItems: ICommandBarItemProps[] = useMemo(() => [
    {
      key: "newMeeting",
      text: "New Meeting",
      iconProps: { iconName: "Add" },
      onClick: () => setShowSmartScheduler(true),
    },
    {
      key: "quickMeeting",
      text: "Quick Meeting",
      iconProps: { iconName: "Calendar" },
      onClick: () => setShowCreateModal(true),
    },
    {
      key: "viewList",
      text: "List View",
      iconProps: { iconName: "List" },
      onClick: () => setViewMode("list"),
      checked: viewMode === "list",
    },
    {
      key: "viewWeek",
      text: "Week View",
      iconProps: { iconName: "CalendarWeek" },
      onClick: () => setViewMode("week"),
      checked: viewMode === "week",
    },
    {
      key: "viewMonth",
      text: "Month View",
      iconProps: { iconName: "Calendar" },
      onClick: () => setViewMode("month"),
      checked: viewMode === "month",
    },
  ], [viewMode]);

  const commandBarFarItems: ICommandBarItemProps[] = useMemo(() => [
    {
      key: "search",
      onRender: () => (
        <SearchBox
          placeholder="Search meetings..."
          value={searchQuery}
          onChange={(_, newValue) => setSearchQuery(newValue || "")}
          styles={{ root: { width: 300 } }}
        />
      ),
    },
    {
      key: "filter",
      onRender: () => (
        <Dropdown
          placeholder="All Types"
          options={[
            { key: "all", text: "All Types" },
            { key: "scheduled_call", text: "Scheduled Calls" },
            { key: "portfolio_review", text: "Portfolio Reviews" },
            { key: "planning_session", text: "Planning Sessions" },
            { key: "urgent_consultation", text: "Urgent Consultations" },
          ]}
          selectedKey={filterType}
          onChange={(_, option) => setFilterType(option?.key as MeetingType | "all")}
          styles={{ root: { width: 200 } }}
        />
      ),
    },
    {
      key: "email",
      text: "Email",
      iconProps: { iconName: "Mail" },
      onClick: onNavigateToEmail,
    },
  ], [searchQuery, filterType]);

  // DetailsList columns for meetings
  const meetingColumns: IColumn[] = useMemo(() => [
    {
      key: "subject",
      name: "Subject",
      fieldName: "subject",
      minWidth: 200,
      maxWidth: 300,
      isResizable: true,
      onRender: (item: SampleMeeting) => (
        <Stack>
          <Text variant="medium" styles={{ root: { fontWeight: 600 } }}>
            {item.subject}
          </Text>
          <Text variant="small" styles={{ root: { color: "#605e5c" } }}>
            {getClientInfo(item)?.name || "Unknown Client"}
          </Text>
        </Stack>
      ),
    },
    {
      key: "startTime",
      name: "Start Time",
      fieldName: "startTime",
      minWidth: 150,
      maxWidth: 200,
      isResizable: true,
      onRender: (item: SampleMeeting) => (
        <Text variant="small">
          {new Date(item.startTime).toLocaleString()}
        </Text>
      ),
    },
    {
      key: "meetingType",
      name: "Type",
      fieldName: "meetingType",
      minWidth: 120,
      maxWidth: 150,
      isResizable: true,
      onRender: (item: SampleMeeting) => (
        <Text variant="small">
          {item.meetingType.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}
        </Text>
      ),
    },
    {
      key: "status",
      name: "Status",
      fieldName: "status",
      minWidth: 100,
      maxWidth: 120,
      isResizable: true,
      onRender: (item: SampleMeeting) => (
        <Text 
          variant="small" 
          styles={{ 
            root: { 
              color: item.status === "completed" ? "#107c10" : 
                    item.status === "scheduled" ? "#0078d4" : "#d13438"
            } 
          }}
        >
          {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
        </Text>
      ),
    },
    {
      key: "actions",
      name: "Actions",
      minWidth: 150,
      maxWidth: 200,
      isResizable: true,
      onRender: (item: SampleMeeting) => (
        <Stack horizontal tokens={{ childrenGap: 8 }}>
          <IconButton
            iconProps={{ iconName: "View" }}
            title="View Details"
            onClick={() => handleMeetingSelect(item)}
          />
          {item.status === "scheduled" && (
            <IconButton
              iconProps={{ iconName: "CheckMark" }}
              title="Complete Meeting"
              onClick={() => handleCompleteMeeting(item)}
            />
          )}
          <IconButton
            iconProps={{ iconName: "Chart" }}
            title="View Insights"
            onClick={() => {
              setSelectedMeeting(item);
              setShowInsightsDashboard(true);
            }}
          />
        </Stack>
      ),
    },
  ], []);

  return (
    <>
    <Stack styles={{ root: { height: "100%", backgroundColor: "#ffffff" } }}>
      {/* CommandBar */}
      <CommandBar
        items={commandBarItems}
        farItems={commandBarFarItems}
        styles={{
          root: {
            backgroundColor: "#ffffff",
            borderBottom: "1px solid #edebe9",
          },
        }}
      />

      {/* Content */}
      <Stack styles={{ root: { flex: 1, overflow: "hidden" } }}>
        {viewMode === "list" && (
          <Stack styles={{ root: { flex: 1, padding: 16 } }}>
            {filteredMeetings.length === 0 ? (
              <Stack 
                horizontalAlign="center" 
                verticalAlign="center" 
                styles={{ root: { height: 400 } }}
                tokens={{ childrenGap: 16 }}
              >
                <IconButton
                  iconProps={{ iconName: "Calendar" }}
                  styles={{ root: { fontSize: 48, color: "#605e5c" } }}
                />
                <Text variant="large" styles={{ root: { fontWeight: 600 } }}>
                  No meetings found
                </Text>
                <Text variant="medium" styles={{ root: { color: "#605e5c" } }}>
                  {searchQuery || filterType !== "all" 
                    ? "Try adjusting your search or filter criteria."
                    : "Schedule your first meeting with a client."
                  }
                </Text>
                <PrimaryButton
                  iconProps={{ iconName: "Add" }}
                  onClick={() => setShowCreateModal(true)}
                >
                  Schedule Meeting
                </PrimaryButton>
              </Stack>
            ) : (
              <DetailsList
                items={filteredMeetings}
                columns={meetingColumns}
                selectionMode={SelectionMode.none}
                onActiveItemChanged={(item) => {
                  if (item) {
                    handleMeetingSelect(item);
                  }
                }}
                styles={{
                  root: {
                    flex: 1,
                    overflow: "auto",
                  },
                  headerWrapper: {
                    backgroundColor: "#f3f2f1",
                  },
                }}
              />
            )}
          </Stack>
        )}

        {viewMode === "week" && (
          <Stack 
            horizontalAlign="center" 
            verticalAlign="center" 
            styles={{ root: { height: 400 } }}
            tokens={{ childrenGap: 16 }}
          >
            <IconButton
              iconProps={{ iconName: "Calendar" }}
              styles={{ root: { fontSize: 48, color: "#605e5c" } }}
            />
            <Text variant="large" styles={{ root: { fontWeight: 600 } }}>
              Week View
            </Text>
            <Text variant="medium" styles={{ root: { color: "#605e5c" } }}>
              Week view coming soon...
            </Text>
          </Stack>
        )}

        {viewMode === "month" && (
          <Stack 
            horizontalAlign="center" 
            verticalAlign="center" 
            styles={{ root: { height: 400 } }}
            tokens={{ childrenGap: 16 }}
          >
            <IconButton
              iconProps={{ iconName: "Calendar" }}
              styles={{ root: { fontSize: 48, color: "#605e5c" } }}
            />
            <Text variant="large" styles={{ root: { fontWeight: 600 } }}>
              Month View
            </Text>
            <Text variant="medium" styles={{ root: { color: "#605e5c" } }}>
              Month view coming soon...
            </Text>
          </Stack>
        )}
      </Stack>

    </Stack>

    {/* Create Meeting Modal */}
    <Modal
      open={showCreateModal}
      title="Schedule New Meeting"
      onClose={() => setShowCreateModal(false)}
    >
      <MeetingForm
        onSave={(meeting) => {
          console.log("Meeting saved:", meeting);
          setShowCreateModal(false);
        }}
        onCancel={() => setShowCreateModal(false)}
      />
    </Modal>

      {/* Meeting Details Modal - Large with AI Panel */}
      {showMeetingDetails && selectedMeeting && (
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
              setShowMeetingDetails(false);
              setSelectedMeeting(null);
            }
          }}
        >
          <div 
            style={{
              width: "75%",
              height: "75%",
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
                  {selectedMeeting.subject}
                </h2>
                <p style={{ 
                  margin: "4px 0 0 0", 
                  fontSize: "14px", 
                  color: "#605e5c" 
                }}>
                  Meeting Details
                </p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                {/* AI Assistant Button - only show when AI panel is hidden */}
                {!isAIPanelOpen && (
                  <PrimaryButton
                    iconProps={{ iconName: "Lightbulb" }}
                    onClick={() => setIsAIPanelOpen(true)}
                    text="AI Insights"
                    styles={{
                      root: {
                        backgroundColor: "#0078d4",
                        color: "white",
                        borderRadius: "4px",
                        border: "none",
                        padding: "8px 16px",
                        height: "auto",
                        ":hover": {
                          backgroundColor: "#106ebe"
                        }
                      }
                    }}
                  />
                )}
                <IconButton
                  iconProps={{ iconName: "ChromeClose" }}
                  onClick={() => {
                    setShowMeetingDetails(false);
                    setSelectedMeeting(null);
                  }}
                  title="Close"
                />
              </div>
            </div>

            {/* Modal Content */}
            <div style={{ 
              flex: 1, 
              display: "flex", 
              overflow: "hidden" 
            }}>
              {/* Meeting Details - Left Side */}
              <div style={{
                flex: 1,
                padding: "24px",
                overflowY: "auto",
                borderRight: "1px solid #edebe9"
              }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
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
                        Type
                      </label>
                      <p style={{ 
                        margin: 0, 
                        fontSize: "14px", 
                        color: "#323130",
                        textTransform: "capitalize"
                      }}>
                        {selectedMeeting.meetingType.replace('_', ' ')}
                      </p>
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
                        Status
                      </label>
                      <span style={{
                        display: "inline-block",
                        padding: "4px 8px",
                        fontSize: "12px",
                        fontWeight: 600,
                        borderRadius: "12px",
                        backgroundColor: getStatusColor(selectedMeeting.status).includes('green') ? '#dff6dd' : 
                                        getStatusColor(selectedMeeting.status).includes('blue') ? '#deecf9' : '#fef7e0',
                        color: getStatusColor(selectedMeeting.status).includes('green') ? '#107c10' : 
                               getStatusColor(selectedMeeting.status).includes('blue') ? '#0078d4' : '#8a8886'
                      }}>
                        {selectedMeeting.status}
                      </span>
                    </div>
                  </div>
                  
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
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
                        Start Time
                      </label>
                      <p style={{ margin: 0, fontSize: "14px", color: "#323130" }}>
                        {formatDate(selectedMeeting.startTime)} at {formatTime(selectedMeeting.startTime)}
                      </p>
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
                        End Time
                      </label>
                      <p style={{ margin: 0, fontSize: "14px", color: "#323130" }}>
                        {formatDate(selectedMeeting.endTime)} at {formatTime(selectedMeeting.endTime)}
                      </p>
                    </div>
                  </div>
                  
                  {selectedMeeting.location && (
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
                        Location
                      </label>
                      <p style={{ margin: 0, fontSize: "14px", color: "#323130" }}>
                        {selectedMeeting.location}
                      </p>
                    </div>
                  )}
                  
                  {selectedMeeting.meetingUrl && (
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
                        Meeting URL
                      </label>
                      <a 
                        href={selectedMeeting.meetingUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        style={{ 
                          fontSize: "14px", 
                          color: "#0078d4", 
                          textDecoration: "none"
                        }}
                        onMouseEnter={(e) => (e.target as HTMLElement).style.textDecoration = "underline"}
                        onMouseLeave={(e) => (e.target as HTMLElement).style.textDecoration = "none"}
                      >
                        {selectedMeeting.meetingUrl}
                      </a>
                    </div>
                  )}
                  
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
                      Attendees
                    </label>
                    <div style={{ fontSize: "14px", color: "#323130" }}>
                      {selectedMeeting.attendees.map((attendee, index) => (
                        <div key={index} style={{ marginBottom: "4px" }}>
                          {attendee.name} ({attendee.address})
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {selectedMeeting.description && (
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
                      <p style={{ margin: 0, fontSize: "14px", color: "#323130", lineHeight: "1.5" }}>
                        {selectedMeeting.description}
                      </p>
                    </div>
                  )}
                  
                  {selectedMeeting.agenda && (
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
                      <pre style={{ 
                        margin: 0, 
                        fontSize: "14px", 
                        color: "#323130", 
                        whiteSpace: "pre-wrap",
                        fontFamily: "inherit",
                        lineHeight: "1.5",
                        backgroundColor: "#f8f8f8",
                        padding: "12px",
                        borderRadius: "4px",
                        border: "1px solid #edebe9"
                      }}>
                        {selectedMeeting.agenda}
                      </pre>
                    </div>
                  )}
                  
                  {selectedMeeting.notes && (
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
                        Notes
                      </label>
                      <p style={{ margin: 0, fontSize: "14px", color: "#323130", lineHeight: "1.5" }}>
                        {selectedMeeting.notes}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* AI Panel - Right Side */}
              {isAIPanelOpen && (
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
                        setIsAIPanelOpen(false);
                      }}
                      communications={getCommunicationsForMeeting()}
                      clientEmail={getClientInfo(selectedMeeting)?.email}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Smart Meeting Scheduler */}
      {showSmartScheduler && (
        <SmartMeetingScheduler
          onClose={() => setShowSmartScheduler(false)}
          onSchedule={(meetingData) => {
            console.log("New meeting scheduled:", meetingData);
            setShowSmartScheduler(false);
            // In a real app, this would add to a global state or backend
          }}
        />
      )}

      {/* Meeting Completion Form */}
      {showCompletionForm && selectedMeetingForCompletion && (
        <MeetingCompletionForm
          meeting={selectedMeetingForCompletion}
          client={clients.find(c => c.id === selectedMeetingForCompletion.clientId)!}
          onComplete={handleMeetingCompletion}
          onClose={() => {
            setShowCompletionForm(false);
            setSelectedMeetingForCompletion(null);
          }}
        />
      )}

      {/* Meeting Insights Dashboard */}
      {showInsightsDashboard && (
        <Modal open={true} title="Meeting Insights Dashboard" onClose={() => setShowInsightsDashboard(false)}>
          <MeetingInsightsDashboard
            clientId={selectedMeeting?.clientId}
            onClose={() => setShowInsightsDashboard(false)}
          />
        </Modal>
      )}
    </>
  );
}
