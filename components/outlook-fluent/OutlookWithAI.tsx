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
  IconButton,
  SearchBox,
  PrimaryButton,
} from "@fluentui/react";
import {
  FlagRegular,
} from "@fluentui/react-icons";
import { clients, getCommunicationsByClient } from "@/data/sampleData";
import AssistantPanel from "@/components/ai-agent/AssistantPanel";

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
    width: 200,
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
  const [isAIPanelOpen, setIsAIPanelOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Convert communications to flat array for AssistantPanel - only from selected client
  const communicationsArray = useMemo(() => {
    if (!selectedEmail) return [];
    
    // Find the client that matches the selected email's sender
    const selectedClient = clients.find(client => 
      client.name === selectedEmail.sender || client.email === selectedEmail.senderEmail
    );
    
    if (!selectedClient) return [];
    
    const comms = getCommunicationsByClient(selectedClient.id);
    const clientComms: Array<{
      id: string;
      type: 'email' | 'calendar' | 'teams';
      from: string;
      to: string;
      subject: string;
      body: string;
      timestamp: string;
      clientId: string;
    }> = [
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
        body: e.notes || '',
        timestamp: e.start,
        clientId: e.clientId,
      })),
      ...comms.chats.map(c => ({
        id: c.id,
        type: 'teams' as const,
        from: selectedClient.name,
        to: 'advisor@firm.com',
        subject: 'Teams Message',
        body: c.content,
        timestamp: c.createdDateTime,
        clientId: c.clientId,
      }))
    ];
    
    return clientComms.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [selectedEmail]);

  // Generate email items from all clients' sample data
  const emailItems: EmailItem[] = useMemo(() => {
    const allEmails: EmailItem[] = [];
    
    // Get emails from all clients
    clients.forEach(client => {
      const comms = getCommunicationsByClient(client.id);
      const emails = comms.emails.map((e, idx) => ({
        id: e.id,
        sender: client.name,
        senderEmail: client.email,
        subject: e.subject || "(No subject)",
        preview: e.body.slice(0, 100) + "...",
        body: e.body,
        receivedTime: new Date(e.receivedDateTime).toISOString(),
        isRead: true, // All emails are read
        isFlagged: idx === 0,
        hasAttachments: idx % 3 === 0,
        folder: "inbox",
      }));
      allEmails.push(...emails);
    });
    
    // Sort by newest to oldest (most recent first)
    return allEmails.sort((a, b) => new Date(b.receivedTime).getTime() - new Date(a.receivedTime).getTime());
  }, []);

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
    
    // Sort by newest to oldest (most recent first)
    return filtered.sort((a, b) => new Date(b.receivedTime).getTime() - new Date(a.receivedTime).getTime());
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
      key: "status",
      name: "",
      fieldName: "status",
      minWidth: 24,
      maxWidth: 24,
      onRender: (item: EmailItem) => (
        <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
          {item.isFlagged && <FlagRegular style={{ color: outlookTheme.accentColor, fontSize: "12px" }} />}
          <div style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: item.isRead ? "transparent" : outlookTheme.accentColor }} />
        </div>
      ),
    },
    {
      key: "content",
      name: "Email",
      fieldName: "content",
      minWidth: 0,
      flexGrow: 1,
      isResizable: false,
      onRender: (item: EmailItem) => (
        <div style={{ padding: "2px 2px", minWidth: 0, width: "100%" }}>
          {/* Sender name */}
          <div style={{ marginBottom: "1px" }}>
            <Text 
              styles={{ 
                root: { 
                  fontWeight: item.isRead ? "normal" : "bold",
                  fontSize: "13px",
                  color: outlookTheme.textPrimary,
                  wordWrap: "break-word",
                  overflowWrap: "break-word",
                  whiteSpace: "normal",
                  wordBreak: "break-word"
                } 
              }}
            >
              {item.sender}
            </Text>
          </div>
          
          {/* Subject line with wrapping */}
          <div style={{ display: "flex", alignItems: "flex-start", gap: "2px", marginBottom: "1px" }}>
            <Text 
              styles={{ 
                root: { 
                  fontWeight: item.isRead ? "normal" : "bold",
                  fontSize: "12px",
                  color: outlookTheme.textSecondary,
                  wordWrap: "break-word",
                  overflowWrap: "break-word",
                  whiteSpace: "normal",
                  wordBreak: "break-word",
                  flex: 1,
                  lineHeight: "1.3"
                } 
              }}
            >
              {item.subject}
            </Text>
            {item.hasAttachments && <span style={{ flexShrink: 0, fontSize: "10px", marginTop: "1px" }}>📎</span>}
          </div>
          
          {/* Date below subject */}
          <div>
            <Text 
              styles={{ 
                root: { 
                  fontSize: "11px",
                  color: outlookTheme.textSecondary
                } 
              }}
            >
              {(() => {
                const date = new Date(item.receivedTime);
                return `${date.toLocaleDateString('en-US', { month: 'short' })} ${date.getDate()}`;
              })()}
            </Text>
          </div>
        </div>
      ),
    },
  ];

  const selection = useMemo(() => {
    const sel = new Selection({
      onSelectionChanged: () => {
        const selectionDetails = sel.getSelection();
        // Only update if there's actually a selection, don't clear on deselection
        if (selectionDetails.length > 0) {
          setSelectedEmail(selectionDetails[0] as EmailItem);
        }
      },
    });
    return sel;
  }, []);


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
          <div style={{ padding: "12px 8px" }}>
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
                paddingLeft: 8,
                paddingRight: 8,
              },
              link: {
                color: outlookTheme.textPrimary,
                paddingLeft: 8,
                paddingRight: 8,
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
            <Stack styles={{ root: { width: 280, borderRight: `1px solid ${outlookTheme.borderColor}` } }}>
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
                    overflow: "hidden",
                  },
                  headerWrapper: {
                    backgroundColor: outlookTheme.contentBackground,
                    borderBottom: `1px solid ${outlookTheme.borderColor}`,
                  },
                  contentWrapper: {
                    overflow: "hidden",
                  },
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
                        <div style={{ marginBottom: "8px" }}>
                          <Text variant="large" styles={{ root: { fontWeight: "bold" } }}>
                            {selectedEmail.subject}
                          </Text>
                        </div>
                        <div style={{ marginBottom: "4px" }}>
                          <Text variant="small" styles={{ root: { color: outlookTheme.textSecondary } }}>
                            From: {selectedEmail.sender}
                          </Text>
                        </div>
                        <div>
                          <Text variant="small" styles={{ root: { color: outlookTheme.textSecondary } }}>
                            {(() => {
                              const date = new Date(selectedEmail.receivedTime);
                              return date.toLocaleDateString('en-US', { 
                                weekday: 'short', 
                                year: 'numeric', 
                                month: 'short', 
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              });
                            })()}
                          </Text>
                        </div>
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
                  <div 
                    style={{ 
                      padding: "24px", 
                      flex: 1, 
                      overflow: "auto",
                      backgroundColor: outlookTheme.contentBackground
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
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
            {isAIPanelOpen && (
              <Stack styles={{ root: { width: 400, height: "100%", borderLeft: `1px solid ${outlookTheme.borderColor}`, backgroundColor: outlookTheme.contentBackground } }}>
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
                <div style={{ flex: 1, overflowY: "auto", minHeight: 0 }}>
                  <AssistantPanel
                    email={selectedEmail ? {
                      sender: selectedEmail.sender,
                      senderEmail: selectedEmail.senderEmail,
                      subject: selectedEmail.subject,
                      body: selectedEmail.body,
                      receivedAt: selectedEmail.receivedTime,
                    } : null}
                    communications={communicationsArray}
                    clientEmail={selectedEmail?.senderEmail}
                    onCollapse={() => setIsAIPanelOpen(false)}
                  />
                </div>
              </Stack>
            )}
          </Stack>
        </Stack>
      </Stack>

    </Stack>
  );
}
