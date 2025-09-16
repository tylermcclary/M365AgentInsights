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
                onItemInvoked={(item) => handleMeetingSelect(item)}
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

      {/* AI Assistant Panel */}
      <Panel
        isOpen={isAIPanelOpen}
        onDismiss={() => handleAIPanelToggle(false)}
        type={PanelType.custom}
        customWidth="320px"
        styles={{
          root: { zIndex: 1000 },
          content: { padding: 0 },
          main: { backgroundColor: "#ffffff" },
        }}
      >
        <AssistantPanel
          email={null}
          defaultOpen={true}
          onCollapse={() => handleAIPanelToggle(false)}
          communications={selectedMeeting ? getCommunicationsForMeeting() : []}
          clientEmail={selectedMeeting ? getClientInfo(selectedMeeting)?.email : undefined}
        />
      </Panel>
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

    {/* Meeting Details Modal */}
    <Modal
      open={showMeetingDetails}
      title={selectedMeeting?.subject || "Meeting Details"}
      onClose={() => {
        setShowMeetingDetails(false);
        setSelectedMeeting(null);
      }}
    >
      {selectedMeeting && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Type</label>
              <p className="text-sm text-gray-900 capitalize">{selectedMeeting.meetingType.replace('_', ' ')}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedMeeting.status)}`}>
                {selectedMeeting.status}
              </span>
            </div>
          </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Start Time</label>
                <p className="text-sm text-gray-900">{formatDate(selectedMeeting.startTime)} at {formatTime(selectedMeeting.startTime)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">End Time</label>
                <p className="text-sm text-gray-900">{formatDate(selectedMeeting.endTime)} at {formatTime(selectedMeeting.endTime)}</p>
              </div>
            </div>
            
            {selectedMeeting.location && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Location</label>
                <p className="text-sm text-gray-900">{selectedMeeting.location}</p>
              </div>
            )}
            
            {selectedMeeting.meetingUrl && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Meeting URL</label>
                <a href={selectedMeeting.meetingUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:text-blue-800">
                  {selectedMeeting.meetingUrl}
                </a>
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Attendees</label>
              <div className="text-sm text-gray-900">
                {selectedMeeting.attendees.map((attendee, index) => (
                  <div key={index}>{attendee.name} ({attendee.address})</div>
                ))}
              </div>
            </div>
            
            {selectedMeeting.description && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <p className="text-sm text-gray-900">{selectedMeeting.description}</p>
              </div>
            )}
            
            {selectedMeeting.agenda && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Agenda</label>
                <pre className="text-sm text-gray-900 whitespace-pre-wrap">{selectedMeeting.agenda}</pre>
              </div>
            )}
            
            {selectedMeeting.notes && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Notes</label>
                <p className="text-sm text-gray-900">{selectedMeeting.notes}</p>
              </div>
            )}
            
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <Button
                variant="ghost"
                onClick={() => {
                  setShowMeetingDetails(false);
                  setSelectedMeeting(null);
                }}
              >
                Close
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  setShowMeetingDetails(false);
                  setSelectedMeeting(null);
                  handleAIPanelToggle(true);
                }}
              >
                Analyze with AI
              </Button>
            </div>
          </div>
        )}
      </Modal>

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
