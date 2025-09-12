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
  Selection,
  ISelection,
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
};

type FolderKey = "inbox" | "sent" | "drafts" | "deleted" | "archive" | "flagged";

export default function OutlookShell() {
  const [selectedFolder, setSelectedFolder] = useState<FolderKey>("inbox");
  const [selectedEmail, setSelectedEmail] = useState<EmailItem | null>(null);
  const [isReadingPaneOpen, setIsReadingPaneOpen] = useState(true);
  const [selectedClientId, setSelectedClientId] = useState(clients[0]?.id ?? "");
  const [searchQuery, setSearchQuery] = useState("");

  const selectedClient = useMemo(() => clients.find(c => c.id === selectedClientId), [selectedClientId]);

  // Generate email items from sample data
  const emailItems: EmailItem[] = useMemo(() => {
    if (!selectedClient) return [];
    const comms = getCommunicationsByClient(selectedClient.id);
    const emails = comms.emails.map((e, idx) => ({
      id: e.id,
      sender: selectedClient.name,
      subject: e.subject || "(No subject)",
      preview: e.body.slice(0, 100) + "...",
      receivedTime: new Date(e.receivedDateTime).toLocaleString(),
      isRead: idx > 2, // First few are unread
      isFlagged: idx === 0,
      hasAttachments: idx % 3 === 0,
      folder: "inbox",
    }));
    return emails;
  }, [selectedClient]);

  const filteredEmails = useMemo(() => {
    if (!searchQuery) return emailItems;
    const query = searchQuery.toLowerCase();
    return emailItems.filter(
      email =>
        email.sender.toLowerCase().includes(query) ||
        email.subject.toLowerCase().includes(query) ||
        email.preview.toLowerCase().includes(query)
    );
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

          <Stack horizontal styles={{ root: { flex: 1 } }} tokens={stackTokens}>
            {/* Email List */}
            <Stack styles={{ root: { flex: 1, minWidth: 300, maxWidth: "55%", overflow: "hidden" } }}>
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
                    width: "100%",
                  },
                  headerWrapper: {
                    backgroundColor: outlookTheme.contentBackground,
                    borderBottom: `1px solid ${outlookTheme.borderColor}`,
                    overflow: "hidden",
                  },
                  contentWrapper: {
                    overflow: "hidden",
                    width: "100%",
                  },
                  focusZone: {
                    overflow: "hidden",
                  },
                }}
              />
            </Stack>

            {/* Reading Pane */}
            {isReadingPaneOpen && selectedEmail && (
              <Stack styles={{ root: { width: 300, borderLeft: `1px solid ${outlookTheme.borderColor}` } }}>
                <div style={{ padding: "16px", borderBottom: `1px solid ${outlookTheme.borderColor}` }}>
                  <Stack horizontal horizontalAlign="space-between" verticalAlign="center">
                    <Text variant="large" styles={{ root: { fontWeight: "bold" } }}>
                      {selectedEmail.subject}
                    </Text>
                    <IconButton
                      iconProps={{ iconName: "ChromeClose" }}
                      onClick={() => setIsReadingPaneOpen(false)}
                      title="Close reading pane"
                    />
                  </Stack>
                  <Text variant="small" styles={{ root: { color: outlookTheme.textSecondary, marginTop: 4 } }}>
                    From: {selectedEmail.sender} • {selectedEmail.receivedTime}
                  </Text>
                </div>
                <div style={{ padding: "16px", flex: 1 }}>
                  <Text>{selectedEmail.preview}</Text>
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
