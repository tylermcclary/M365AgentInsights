"use client";

import React, { useMemo } from "react";
import {
  CommandBar,
  ICommandBarItemProps,
  Nav,
  INavLinkGroup,
  Pivot,
  PivotItem,
  Stack,
  IStackTokens,
  SearchBox,
  IconButton,
  PrimaryButton,
} from "@fluentui/react";
import { 
  outlookTheme, 
  stackStyles, 
  navigationStackStyles, 
  contentStackStyles, 
  stackTokens, 
  navLinkGroups 
} from "@/lib/outlook-theme";
import { useEmailInterface } from "@/hooks/useEmailInterface";
import EmailList from "./EmailList";
import ReadingPane from "./ReadingPane";
import AssistantPanel from "@/components/ai-agent/AssistantPanel";
import { FolderKey } from "@/types/email";
import { clients, getCommunicationsByClient } from "@/data/sampleData";

interface OutlookInterfaceProps {
  showAIPanel?: boolean;
  onAIPanelToggle?: (isOpen: boolean) => void;
}

export default function OutlookInterface({ 
  showAIPanel = false, 
  onAIPanelToggle 
}: OutlookInterfaceProps) {
  const { state, actions, filteredEmails } = useEmailInterface();
  
  // Override AI panel state if controlled from parent
  const isAIPanelOpen = showAIPanel !== undefined ? showAIPanel : state.isAIPanelOpen;
  const handleAIPanelToggle = (isOpen: boolean) => {
    if (onAIPanelToggle) {
      onAIPanelToggle(isOpen);
    } else {
      actions.setIsAIPanelOpen(isOpen);
    }
  };

  // Get communications for the selected email's client with improved identification
  const getCommunicationsForSelectedEmail = () => {
    if (!state.selectedEmail) {
      console.log('📧 No email selected, returning empty communications');
      return [];
    }
    
    console.log('📧 Getting communications for selected email:', {
      sender: state.selectedEmail.sender,
      senderEmail: state.selectedEmail.senderEmail,
      subject: state.selectedEmail.subject
    });
    
    // Improved client identification - try multiple matching strategies
    const selectedEmail = state.selectedEmail; // Store reference to avoid null checks
    let selectedClient = null;
    
    // Strategy 1: Exact email match
    if (selectedEmail.senderEmail) {
      selectedClient = clients.find(client => 
        client.email.toLowerCase() === selectedEmail.senderEmail?.toLowerCase()
      );
    }
    
    // Strategy 2: Name match (fallback)
    if (!selectedClient && selectedEmail.sender) {
      selectedClient = clients.find(client => 
        client.name.toLowerCase() === selectedEmail.sender?.toLowerCase()
      );
    }
    
    // Strategy 3: Partial email match (for display names like "John Doe <john@email.com>")
    if (!selectedClient && selectedEmail.senderEmail) {
      const emailPart = selectedEmail.senderEmail.split('@')[0];
      selectedClient = clients.find(client => 
        client.email.toLowerCase().includes(emailPart.toLowerCase()) ||
        client.name.toLowerCase().includes(emailPart.toLowerCase())
      );
    }
    
    if (!selectedClient) {
      console.warn('📧 No client found for email:', {
        sender: selectedEmail.sender,
        senderEmail: selectedEmail.senderEmail
      });
      return [];
    }
    
    console.log('📧 Found client:', selectedClient.name, selectedClient.email);
    
    const comms = getCommunicationsByClient(selectedClient.id);
    console.log('📧 Raw communications:', {
      emails: comms.emails.length,
      events: comms.events.length,
      chats: comms.chats.length,
      meetings: comms.meetings.length
    });
    
    // Normalize and map communications data
    const emails = comms.emails.map(e => ({
      id: e.id,
      type: "email" as const,
      from: selectedClient.email,
      subject: e.subject || "(No subject)",
      body: e.body || "",
      timestamp: e.receivedDateTime,
    }));
    
    const events = comms.events.map(e => ({
      id: e.id,
      type: "event" as const,
      from: selectedClient.email,
      subject: e.subject || "(No subject)",
      body: e.notes || "",
      timestamp: e.start,
    }));
    
    const chats = comms.chats.map(c => ({
      id: c.id,
      type: "chat" as const,
      from: selectedClient.email,
      subject: c.content.slice(0, 60) + (c.content.length > 60 ? '...' : ''),
      body: c.content,
      timestamp: c.createdDateTime,
    }));
    
    const meetings = comms.meetings.map(m => ({
      id: m.id,
      type: "meeting" as const,
      from: selectedClient.email,
      subject: m.subject || "(No subject)",
      body: `${m.description}\n\nAgenda:\n${m.agenda || 'No agenda'}\n\nNotes:\n${m.notes || 'No notes'}`,
      timestamp: m.startTime,
    }));
    
    const allCommunications = [...emails, ...events, ...chats, ...meetings].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    
    console.log('📧 Normalized communications:', allCommunications.length);
    return allCommunications;
  };

  // CommandBar items
  const commandBarItems: ICommandBarItemProps[] = useMemo(() => [
    {
      key: "new",
      text: "New",
      iconProps: { iconName: "Add" },
      onClick: () => console.log("New email"),
    },
    {
      key: "reply",
      text: "Reply",
      iconProps: { iconName: "Reply" },
      disabled: !state.selectedEmail,
      onClick: () => console.log("Reply"),
    },
    {
      key: "replyAll",
      text: "Reply All",
      iconProps: { iconName: "ReplyAll" },
      disabled: !state.selectedEmail,
      onClick: () => console.log("Reply All"),
    },
    {
      key: "forward",
      text: "Forward",
      iconProps: { iconName: "Forward" },
      disabled: !state.selectedEmail,
      onClick: () => console.log("Forward"),
    },
    ...(showAIPanel !== undefined ? [] : [{
      key: "aiInsights",
      text: "AI Insights",
      iconProps: { iconName: "Lightbulb" },
      onClick: () => handleAIPanelToggle(true),
    }]),
  ], [state.selectedEmail, showAIPanel]);

  const commandBarFarItems: ICommandBarItemProps[] = useMemo(() => [
    {
      key: "search",
      onRender: () => (
        <SearchBox
          placeholder="Search mail"
          value={state.searchQuery}
          onChange={(_, newValue) => actions.setSearchQuery(newValue || "")}
          styles={{ root: { width: 300 } }}
        />
      ),
    },
    {
      key: "settings",
      iconProps: { iconName: "Settings" },
      onClick: () => console.log("Settings"),
    },
    {
      key: "profile",
      iconProps: { iconName: "Person" },
      onClick: () => console.log("Profile"),
    },
  ], [state.searchQuery, actions]);

  return (
    <Stack styles={{ root: { height: "100%", backgroundColor: "#ffffff" } }}>
      <Stack horizontal styles={{ root: { flex: 1, minWidth: 0, overflow: "hidden" } }} tokens={stackTokens}>
        {/* Email List */}
        <EmailList
          emails={filteredEmails}
          selectedEmail={state.selectedEmail}
          onEmailSelect={actions.setSelectedEmail}
          selectedFolder={state.selectedFolder}
          searchQuery={state.searchQuery}
          isLoading={state.isLoading}
          error={state.error}
        />

        {/* Reading Pane */}
        {state.isReadingPaneOpen && (
          <ReadingPane
            selectedEmail={state.selectedEmail}
            onReply={() => console.log("Reply")}
            onReplyAll={() => console.log("Reply All")}
            onForward={() => console.log("Forward")}
            onClose={() => actions.setIsReadingPaneOpen(false)}
            onToggleAIPanel={() => handleAIPanelToggle(!isAIPanelOpen)}
            isAIPanelOpen={isAIPanelOpen}
          />
        )}

        {/* AI Insights Panel */}
        {isAIPanelOpen && (
          <Stack styles={{ 
            root: { 
              width: 320, 
              minWidth: 280, 
              maxWidth: 400, 
              flex: "0 0 auto", 
              height: "100%", 
              borderLeft: `1px solid ${outlookTheme.borderColor}`, 
              backgroundColor: outlookTheme.contentBackground, 
              display: "flex", 
              flexDirection: "column",
              overflow: "hidden"
            } 
          }} className="outlook-ai-panel">
            {/* AI Panel Header */}
            <div style={{ 
              padding: "16px", 
              borderBottom: `1px solid ${outlookTheme.borderColor}`,
              backgroundColor: outlookTheme.contentBackground,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexShrink: 0
            }}>
              <div style={{ fontWeight: "bold", color: outlookTheme.textPrimary }}>
                AI Assistant
              </div>
              <IconButton
                iconProps={{ iconName: "ChromeClose" }}
                onClick={() => handleAIPanelToggle(false)}
                title="Close AI Assistant"
              />
            </div>
            
            {/* AI Panel Content */}
            <div style={{ flex: 1, minHeight: 0, padding: "0", overflowY: "auto" }}>
              <AssistantPanel
                email={state.selectedEmail ? {
                  id: state.selectedEmail.id,
                  sender: state.selectedEmail.sender,
                  senderEmail: state.selectedEmail.senderEmail || state.selectedEmail.sender,
                  subject: state.selectedEmail.subject,
                  body: state.selectedEmail.body,
                  receivedAt: state.selectedEmail.receivedTime,
                } : undefined}
                communications={getCommunicationsForSelectedEmail()}
                clientEmail={state.selectedEmail?.senderEmail || state.selectedEmail?.sender}
              />
            </div>
          </Stack>
        )}
      </Stack>
    </Stack>
  );
}
