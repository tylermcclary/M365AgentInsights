"use client";

import { useState } from "react";
import {
  CommandBar,
  ICommandBarItemProps,
  Nav,
  INavLinkGroup,
  INavLink,
  Pivot,
  PivotItem,
  Stack,
  IStackStyles,
  IStackTokens,
  DetailsList,
  IColumn,
  Panel,
  PanelType,
  Text,
  ITextStyles,
  Separator,
  IconButton,
  IIconProps,
  SearchBox,
  IContextualMenuProps,
  IContextualMenuItem,
} from "@fluentui/react";
import {
  FlagRegular,
} from "@fluentui/react-icons";
import { clients, getCommunicationsByClient } from "@/data/sampleData";
import { useMemo } from "react";

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
    width: "100%",
    maxWidth: "100vw",
    overflow: "hidden",
  },
};

const navigationStackStyles: IStackStyles = {
  root: {
    minWidth: 180,
    maxWidth: 250,
    width: "auto",
    backgroundColor: outlookTheme.navigationBackground,
    borderRight: `1px solid ${outlookTheme.borderColor}`,
    flexShrink: 0,
  },
};

const contentStackStyles: IStackStyles = {
  root: {
    flex: 1,
    backgroundColor: outlookTheme.contentBackground,
    height: "100%",
    minWidth: 0,
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
  body: string;
  receivedTime: string;
  isRead: boolean;
  isFlagged: boolean;
  hasAttachments: boolean;
  folder: string;
};

type FolderKey = "inbox" | "sent" | "drafts" | "deleted" | "archive" | "flagged";

export default function OutlookShell() {
  const [selectedFolder, setSelectedFolder] = useState<FolderKey>("inbox");
  const [selectedEmail, setSelectedEmail] = useState<EmailItem | null>(null);
  const [isReadingPaneOpen, setIsReadingPaneOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Generate email items from all clients' sample data
  const emailItems: EmailItem[] = useMemo(() => {
    const allEmails: EmailItem[] = [];
    
    // Get emails from all clients
    clients.forEach(client => {
      const comms = getCommunicationsByClient(client.id);
      const emails = comms.emails.map((e, idx) => ({
        id: e.id,
        sender: client.name,
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
    let filtered = emailItems;
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = emailItems.filter(
        email =>
          email.sender.toLowerCase().includes(query) ||
          email.subject.toLowerCase().includes(query) ||
          email.preview.toLowerCase().includes(query)
      );
    }
    
    // Sort by newest to oldest (most recent first)
    return filtered.sort((a, b) => new Date(b.receivedTime).getTime() - new Date(a.receivedTime).getTime());
  }, [emailItems, searchQuery]);

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

  // Navigation groups with proper Outlook folder structure
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

  // Custom email list rendering (no longer using DetailsList columns)


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

          <Stack horizontal styles={{ root: { flex: 1, height: "100%" } }} tokens={stackTokens}>
            {/* Email List */}
            <Stack styles={{ root: { width: 280, flex: "0 0 auto", height: "100%", display: "flex", flexDirection: "column" } }}>
              <div style={{ padding: "8px 16px", borderBottom: `1px solid ${outlookTheme.borderColor}` }}>
                <Text variant="medium" styles={{ root: { fontWeight: "bold" } }}>
                  {selectedFolder === "inbox" ? "Inbox" : 
                   selectedFolder === "sent" ? "Sent Items" :
                   selectedFolder === "drafts" ? "Drafts" :
                   selectedFolder === "deleted" ? "Deleted Items" :
                   selectedFolder === "archive" ? "Archive" : "Flagged"}
                </Text>
              </div>
              <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden", backgroundColor: outlookTheme.contentBackground, minHeight: 0, width: "100%" }}>
                {/* Debug: {filteredEmails.length} emails */}
                {filteredEmails.map((email) => (
                  <div
                    key={email.id}
                    onClick={() => {
                      console.log("Email clicked:", email.id, email.subject, email.body?.length);
                      console.log("Current selectedEmail:", selectedEmail?.id);
                      setSelectedEmail(email);
                    }}
                    style={{
                      padding: "8px 12px",
                      borderBottom: `1px solid ${outlookTheme.borderColor}`,
                      cursor: "pointer",
                      backgroundColor: selectedEmail?.id === email.id ? outlookTheme.accentColor : "transparent",
                      color: selectedEmail?.id === email.id ? "white" : outlookTheme.textPrimary,
                    }}
                    onMouseEnter={(e) => {
                      if (selectedEmail?.id !== email.id) {
                        e.currentTarget.style.backgroundColor = outlookTheme.borderColor;
                      }
                    }}
                    onMouseLeave={(e) => {
                      // Always reset to the correct state based on selection
                      if (selectedEmail?.id === email.id) {
                        e.currentTarget.style.backgroundColor = outlookTheme.accentColor;
                      } else {
                        e.currentTarget.style.backgroundColor = "transparent";
                      }
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "4px", minWidth: "24px" }}>
                        {email.isFlagged && <FlagRegular style={{ color: selectedEmail?.id === email.id ? "white" : outlookTheme.accentColor, fontSize: "12px" }} />}
                        <div style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: email.isRead ? "transparent" : (selectedEmail?.id === email.id ? "white" : outlookTheme.accentColor) }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: email.isRead ? "normal" : "bold", fontSize: "14px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {email.sender}
                        </div>
                        <div style={{ fontSize: "13px", color: selectedEmail?.id === email.id ? "rgba(255,255,255,0.9)" : outlookTheme.textSecondary, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {email.subject}
                        </div>
                        <div style={{ fontSize: "12px", color: selectedEmail?.id === email.id ? "rgba(255,255,255,0.7)" : outlookTheme.textSecondary, wordWrap: "break-word", overflowWrap: "break-word", lineHeight: "1.3" }}>
                          {email.preview}
                        </div>
                      </div>
                      <div style={{ fontSize: "12px", color: selectedEmail?.id === email.id ? "rgba(255,255,255,0.7)" : outlookTheme.textSecondary, whiteSpace: "nowrap" }}>
                        {new Date(email.receivedTime).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Stack>

            {/* Reading Pane */}
            {isReadingPaneOpen && selectedEmail && (
              <Stack styles={{ root: { minWidth: 280, maxWidth: "40%", flex: "1 1 auto", borderLeft: `1px solid ${outlookTheme.borderColor}` } }}>
                <div style={{ padding: "16px", borderBottom: `1px solid ${outlookTheme.borderColor}` }}>
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
                    <IconButton
                      iconProps={{ iconName: "ChromeClose" }}
                      onClick={() => setIsReadingPaneOpen(false)}
                      title="Close reading pane"
                    />
                  </Stack>
                </div>
                <div 
                  style={{ padding: "16px", flex: 1 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Text styles={{ root: { lineHeight: "1.6", fontSize: "14px", whiteSpace: "pre-wrap" } }}>
                    {selectedEmail.body || "No content available"}
                  </Text>
                </div>
                <div style={{ padding: "16px", borderTop: `1px solid ${outlookTheme.borderColor}` }}>
                  <Stack horizontal tokens={{ childrenGap: 8 }}>
                    <IconButton iconProps={{ iconName: "Reply" }} title="Reply" />
                    <IconButton iconProps={{ iconName: "ReplyAll" }} title="Reply All" />
                    <IconButton iconProps={{ iconName: "Forward" }} title="Forward" />
                  </Stack>
                </div>
              </Stack>
            )}
          </Stack>
        </Stack>
      </Stack>
    </Stack>
  );
}
