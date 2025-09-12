"use client";

import { useState, useMemo } from "react";
import {
  CommandBar,
  ICommandBarItemProps,
  Nav,
  INavLinkGroup,
  Pivot,
  PivotItem,
  Stack,
  IStackStyles,
  IStackTokens,
  DetailsList,
  IColumn,
  Selection,
  Text,
  Separator,
  IconButton,
  SearchBox,
  Panel,
  PanelType,
  PrimaryButton,
  DefaultButton,
  Spinner,
  SpinnerSize,
} from "@fluentui/react";
import {
  FlagRegular,
} from "@fluentui/react-icons";
import { clients, getCommunicationsByClient } from "@/data/sampleData";
import AssistantPanel from "@/components/ai-agent/AssistantPanel";
import ContextTrigger from "@/components/ai-agent/ContextTrigger";
import { useEmailContext } from "@/hooks/useEmailContext";

// Outlook theme colors
const outlookTheme = {
  navigationBackground: "#f3f2f1",
  contentBackground: "#ffffff",
  accentColor: "#0078d4",
  textPrimary: "#323130",
  textSecondary: "#605e5c",
  borderColor: "#edebe9",
};

const stackStyles: IStackStyles = {
  root: {
    height: "100vh",
    backgroundColor: outlookTheme.navigationBackground,
    overflow: "hidden",
  },
};

const navigationStackStyles: IStackStyles = {
  root: {
    width: 280,
    backgroundColor: outlookTheme.navigationBackground,
    borderRight: `1px solid ${outlookTheme.borderColor}`,
  },
};

const contentStackStyles: IStackStyles = {
  root: {
    flex: 1,
    backgroundColor: outlookTheme.contentBackground,
    overflow: "hidden",
  },
};

const stackTokens: IStackTokens = {
  childrenGap: 0,
};

type EmailItem = {
  id: string;
  sender: string;
  subject: string;
  preview: string;
  receivedTime: string;
  isRead: boolean;
  isFlagged: boolean;
  hasAttachments: boolean;
  folder: string;
  body: string;
  senderEmail: string;
};

type FolderKey = "inbox" | "sent" | "drafts" | "deleted" | "archive" | "flagged";

export default function OutlookWithAI() {
  const [selectedFolder, setSelectedFolder] = useState<FolderKey>("inbox");
  const [selectedEmail, setSelectedEmail] = useState<EmailItem | null>(null);
  const [isReadingPaneOpen, setIsReadingPaneOpen] = useState(true);
  const [isAIPanelOpen, setIsAIPanelOpen] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState(clients[0]?.id ?? "");
  const [searchQuery, setSearchQuery] = useState("");

  const selectedClient = useMemo(() => clients.find(c => c.id === selectedClientId), [selectedClientId]);

  // Convert communications to flat array for AssistantPanel
  const communicationsArray = useMemo(() => {
    if (!selectedClient) return [];
    const comms = getCommunicationsByClient(selectedClient.id);
    const allComms = [
      ...comms.emails.map(e => ({
        id: e.id,
        type: 'email' as const,
        from: selectedClient.name,
        to: 'advisor@firm.com',
        subject: e.subject || '(No subject)',
        body: e.body,
        timestamp: e.receivedDateTime,
        clientId: e.clientId,
      })),
      ...comms.events.map(e => ({
        id: e.id,
        type: 'calendar' as const,
        from: selectedClient.name,
        to: 'advisor@firm.com',
        subject: e.subject || '(No subject)',
        body: e.body || '',
        timestamp: e.start.dateTime,
        clientId: e.clientId,
      })),
      ...comms.chats.map(c => ({
        id: c.id,
        type: 'teams' as const,
        from: selectedClient.name,
        to: 'advisor@firm.com',
        subject: 'Teams Message',
        body: c.message,
        timestamp: c.timestamp,
        clientId: c.clientId,
      }))
    ];
    return allComms.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [selectedClient]);

  // Generate email items from sample data
  const emailItems: EmailItem[] = useMemo(() => {
    console.log("OutlookWithAI - emailItems useMemo:", { selectedClient: selectedClient?.id, selectedClientName: selectedClient?.name });
    if (!selectedClient) return [];
    const comms = getCommunicationsByClient(selectedClient.id);
    console.log("OutlookWithAI - communications:", { emailsCount: comms.emails.length, eventsCount: comms.events.length, chatsCount: comms.chats.length });
    const emails = comms.emails.map((e, idx) => ({
      id: e.id,
      sender: selectedClient.name,
      senderEmail: selectedClient.email,
      subject: e.subject || "(No subject)",
      preview: e.body.slice(0, 100) + "...",
      body: e.body,
      receivedTime: new Date(e.receivedDateTime).toLocaleString(),
      isRead: idx > 2, // First few are unread
      isFlagged: idx === 0,
      hasAttachments: idx % 3 === 0,
      folder: "inbox",
    }));
    console.log("OutlookWithAI - generated emails:", emails.length, "items");
    return emails;
  }, [selectedClient]);

  const filteredEmails = useMemo(() => {
    // First filter by folder
    let filtered = emailItems.filter(email => email.folder === selectedFolder);
    
    // Then filter by search query if provided
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        email =>
          email.sender.toLowerCase().includes(query) ||
          email.subject.toLowerCase().includes(query) ||
          email.preview.toLowerCase().includes(query)
      );
    }
    
    console.log("OutlookWithAI - filteredEmails:", { 
      emailItemsCount: emailItems.length, 
      selectedFolder, 
      folderFilteredCount: emailItems.filter(email => email.folder === selectedFolder).length,
      searchQuery, 
      finalFilteredCount: filtered.length 
    });
    
    return filtered;
  }, [emailItems, searchQuery, selectedFolder]);

  // CommandBar items
  const commandBarItems: ICommandBarItemProps[] = [
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
      disabled: !selectedEmail,
      onClick: () => console.log("Reply"),
    },
    {
      key: "replyAll",
      text: "Reply All",
      iconProps: { iconName: "ReplyAll" },
      disabled: !selectedEmail,
      onClick: () => console.log("Reply All"),
    },
    {
      key: "forward",
      text: "Forward",
      iconProps: { iconName: "Forward" },
      disabled: !selectedEmail,
      onClick: () => console.log("Forward"),
    },
    {
      key: "aiInsights",
      text: "AI Insights",
      iconProps: { iconName: "Lightbulb" },
      onClick: () => setIsAIPanelOpen(true),
    },
  ];

  const commandBarFarItems: ICommandBarItemProps[] = [
    {
      key: "search",
      onRender: () => (
        <SearchBox
          placeholder="Search mail"
          value={searchQuery}
          onChange={(_, newValue) => setSearchQuery(newValue || "")}
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
  ];

  // Navigation groups
  const navLinkGroups: INavLinkGroup[] = [
    {
      links: [
        {
          name: "Inbox",
          key: "inbox",
          url: "",
          iconProps: { iconName: "Inbox" },
          isExpanded: true,
        },
        {
          name: "Sent Items",
          key: "sent",
          url: "",
          iconProps: { iconName: "Send" },
        },
        {
          name: "Drafts",
          key: "drafts",
          url: "",
          iconProps: { iconName: "Edit" },
        },
        {
          name: "Deleted Items",
          key: "deleted",
          url: "",
          iconProps: { iconName: "Delete" },
        },
        {
          name: "Archive",
          key: "archive",
          url: "",
          iconProps: { iconName: "Archive" },
        },
        {
          name: "Flagged",
          key: "flagged",
          url: "",
          iconProps: { iconName: "Flag" },
        },
      ],
    },
  ];

  // Email list columns - compact nested layout
  const emailColumns: IColumn[] = [
    {
      key: "flag",
      name: "",
      fieldName: "isFlagged",
      minWidth: 20,
      maxWidth: 20,
      onRender: (item: EmailItem) => (
        item.isFlagged ? <FlagRegular style={{ color: outlookTheme.accentColor }} /> : null
      ),
    },
    {
      key: "read",
      name: "",
      fieldName: "isRead",
      minWidth: 20,
      maxWidth: 20,
      onRender: (item: EmailItem) => (
        <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: item.isRead ? "transparent" : outlookTheme.accentColor }} />
      ),
    },
    {
      key: "content",
      name: "Email",
      fieldName: "content",
      minWidth: 200,
      flexGrow: 1,
      isResizable: false,
      onRender: (item: EmailItem) => (
        <div style={{ padding: "4px 0", minWidth: 0 }}>
          {/* Sender name and date on same line */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2px" }}>
            <Text 
              styles={{ 
                root: { 
                  fontWeight: item.isRead ? "normal" : "bold",
                  fontSize: "13px",
                  color: outlookTheme.textPrimary,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  flex: 1,
                  marginRight: "8px"
                } 
              }}
            >
              {item.sender}
            </Text>
            <Text 
              styles={{ 
                root: { 
                  fontSize: "11px",
                  color: outlookTheme.textSecondary,
                  flexShrink: 0
                } 
              }}
            >
              {new Date(item.receivedTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </Text>
          </div>
          
          {/* Subject line below sender */}
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <Text 
              styles={{ 
                root: { 
                  fontWeight: item.isRead ? "normal" : "bold",
                  fontSize: "12px",
                  color: outlookTheme.textSecondary,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  flex: 1
                } 
              }}
            >
              {item.subject}
            </Text>
            {item.hasAttachments && <span style={{ flexShrink: 0, fontSize: "10px" }}>📎</span>}
          </div>
        </div>
      ),
    },
  ];

  const selection = new Selection({
    onSelectionChanged: () => {
      const selectionDetails = selection.getSelection();
      setSelectedEmail(selectionDetails[0] as EmailItem || null);
    },
  });

  return (
    <Stack styles={stackStyles} tokens={stackTokens}>
      {/* CommandBar */}
      <CommandBar
        items={commandBarItems}
        farItems={commandBarFarItems}
        styles={{
          root: {
            backgroundColor: outlookTheme.contentBackground,
            borderBottom: `1px solid ${outlookTheme.borderColor}`,
          },
        }}
      />

      <Stack horizontal styles={{ root: { flex: 1 } }} tokens={stackTokens}>
        {/* Left Navigation */}
        <Stack styles={navigationStackStyles}>
          <div style={{ padding: "16px 8px" }}>
            <Text variant="large" styles={{ root: { fontWeight: "bold", color: outlookTheme.textPrimary } }}>
              Outlook
            </Text>
          </div>
          
          <Nav
            groups={navLinkGroups}
            selectedKey={selectedFolder}
            onLinkClick={(_, item) => {
              if (item) {
                setSelectedFolder(item.key as FolderKey);
              }
            }}
            styles={{
              root: {
                backgroundColor: outlookTheme.navigationBackground,
              },
              link: {
                color: outlookTheme.textPrimary,
                "&:hover": {
                  backgroundColor: outlookTheme.borderColor,
                },
                "&.is-selected": {
                  backgroundColor: outlookTheme.accentColor,
                  color: "white",
                },
              },
            }}
          />

          <Separator />

          <div style={{ padding: "8px" }}>
            <Text variant="small" styles={{ root: { color: outlookTheme.textSecondary, marginBottom: 8 } }}>
              Client
            </Text>
            <select
              value={selectedClientId}
              onChange={e => setSelectedClientId(e.target.value)}
              style={{
                width: "100%",
                padding: "4px 8px",
                border: `1px solid ${outlookTheme.borderColor}`,
                borderRadius: 2,
                backgroundColor: outlookTheme.contentBackground,
              }}
            >
              {clients.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </Stack>

        {/* Main Content */}
        <Stack styles={contentStackStyles}>
          {/* Pivot for Mail/Calendar/People */}
          <Pivot
            selectedKey="mail"
            styles={{
              root: {
                borderBottom: `1px solid ${outlookTheme.borderColor}`,
                backgroundColor: outlookTheme.contentBackground,
              },
            }}
          >
            <PivotItem headerText="Mail" itemKey="mail" itemIcon="Mail" />
            <PivotItem headerText="Calendar" itemKey="calendar" itemIcon="Calendar" />
            <PivotItem headerText="People" itemKey="people" itemIcon="People" />
          </Pivot>

          <Stack horizontal styles={{ root: { flex: 1, overflow: "hidden" } }} tokens={stackTokens}>
            {/* Email List - Smaller sidebar */}
            <Stack styles={{ root: { width: 350, borderRight: `1px solid ${outlookTheme.borderColor}` } }}>
              <div style={{ padding: "8px 16px", borderBottom: `1px solid ${outlookTheme.borderColor}` }}>
                <Text variant="medium" styles={{ root: { fontWeight: "bold" } }}>
                  {selectedFolder === "inbox" ? "Inbox" : 
                   selectedFolder === "sent" ? "Sent Items" :
                   selectedFolder === "drafts" ? "Drafts" :
                   selectedFolder === "deleted" ? "Deleted Items" :
                   selectedFolder === "archive" ? "Archive" : "Flagged"}
                </Text>
              </div>
              <DetailsList
                items={filteredEmails}
                columns={emailColumns}
                selection={selection}
                styles={{
                  root: {
                    backgroundColor: outlookTheme.contentBackground,
                  },
                  headerWrapper: {
                    backgroundColor: outlookTheme.contentBackground,
                    borderBottom: `1px solid ${outlookTheme.borderColor}`,
                  },
                }}
                onRenderRow={(props) => {
                  console.log("DetailsList onRenderRow:", props?.item?.subject);
                  return props?.defaultRender?.(props);
                }}
              />
            </Stack>

            {/* Main Email Content Area */}
            <Stack styles={{ root: { flex: 1, position: "relative" } }}>
              {selectedEmail ? (
                <>
                  {/* Email Header with AI Insights Button */}
                  <div style={{ 
                    padding: "16px", 
                    borderBottom: `1px solid ${outlookTheme.borderColor}`,
                    backgroundColor: outlookTheme.contentBackground,
                    position: "relative"
                  }}>
                    <Stack horizontal horizontalAlign="space-between" verticalAlign="center">
                      <div style={{ flex: 1 }}>
                        <Text variant="large" styles={{ root: { fontWeight: "bold" } }}>
                          {selectedEmail.subject}
                        </Text>
                        <Text variant="small" styles={{ root: { color: outlookTheme.textSecondary, marginTop: 4 } }}>
                          From: {selectedEmail.sender} • {selectedEmail.receivedTime}
                        </Text>
                      </div>
                      <Stack horizontal tokens={{ childrenGap: 8 }}>
                        <IconButton iconProps={{ iconName: "Reply" }} title="Reply" />
                        <IconButton iconProps={{ iconName: "ReplyAll" }} title="Reply All" />
                        <IconButton iconProps={{ iconName: "Forward" }} title="Forward" />
                        <PrimaryButton
                          text={isAIPanelOpen ? "Hide AI" : "AI Insights"}
                          iconProps={{ iconName: "Lightbulb" }}
                          onClick={() => setIsAIPanelOpen(!isAIPanelOpen)}
                        />
                      </Stack>
                    </Stack>
                  </div>
                  
                  {/* Email Content */}
                  <div style={{ 
                    padding: "24px", 
                    flex: 1, 
                    overflow: "auto",
                    backgroundColor: outlookTheme.contentBackground
                  }}>
                    <Text styles={{ root: { lineHeight: "1.6", fontSize: "14px" } }}>
                      {selectedEmail.body}
                    </Text>
                  </div>
                </>
              ) : (
                /* No Email Selected State */
                <div style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center", 
                  height: "100%",
                  backgroundColor: outlookTheme.contentBackground
                }}>
                  <div style={{ textAlign: "center" }}>
                    <Text variant="large" styles={{ root: { color: outlookTheme.textSecondary } }}>
                      Select an email to view
                    </Text>
                    <Text variant="small" styles={{ root: { color: outlookTheme.textSecondary, marginTop: 8 } }}>
                      Choose an email from the list to read its content
                    </Text>
                  </div>
                </div>
              )}
            </Stack>

            {/* AI Insights Panel - Inline */}
            {console.log("Rendering AI panel - isAIPanelOpen:", isAIPanelOpen)}
            {isAIPanelOpen && (
              <Stack styles={{ root: { width: 400, borderLeft: `1px solid ${outlookTheme.borderColor}`, backgroundColor: outlookTheme.contentBackground } }}>
                {/* AI Panel Header */}
                <div style={{ 
                  padding: "16px", 
                  borderBottom: `1px solid ${outlookTheme.borderColor}`,
                  backgroundColor: outlookTheme.contentBackground,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between"
                }}>
                  <Text variant="large" styles={{ root: { fontWeight: "bold" } }}>
                    AI Assistant
                  </Text>
                  <IconButton
                    iconProps={{ iconName: "ChromeClose" }}
                    onClick={() => setIsAIPanelOpen(false)}
                    title="Close AI Assistant"
                  />
                </div>
                
                {/* AI Panel Content */}
                <div style={{ flex: 1, overflow: "auto" }}>
                  {selectedEmail && (
                    <ContextTrigger
                      emailContext={{
                        sender: selectedEmail.sender,
                        senderEmail: selectedEmail.senderEmail,
                        subject: selectedEmail.subject,
                        body: selectedEmail.body,
                        receivedDateTime: selectedEmail.receivedTime,
                      }}
                    />
                  )}
                  <AssistantPanel
                    email={selectedEmail ? {
                      sender: selectedEmail.sender,
                      senderEmail: selectedEmail.senderEmail,
                      subject: selectedEmail.subject,
                      body: selectedEmail.body,
                      receivedAt: selectedEmail.receivedTime,
                    } : null}
                    communications={communicationsArray}
                    clientEmail={selectedClient?.email}
                    onCollapse={() => setIsAIPanelOpen(false)}
                  />
                  {console.log("OutlookWithAI - Passing to AssistantPanel:", {
                    email: selectedEmail?.subject,
                    communicationsCount: communicationsArray.length,
                    clientEmail: selectedClient?.email
                  })}
                </div>
              </Stack>
            )}
          </Stack>
        </Stack>
      </Stack>

    </Stack>
  );
}
