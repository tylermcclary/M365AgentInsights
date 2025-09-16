import { IStackStyles, IStackTokens } from "@fluentui/react";

// Outlook theme colors
export const outlookTheme = {
  navigationBackground: "#f3f2f1",
  contentBackground: "#ffffff",
  accentColor: "#0078d4",
  textPrimary: "#323130",
  textSecondary: "#605e5c",
  borderColor: "#edebe9",
  hoverColor: "#f3f2f1",
  selectedColor: "#0078d4",
  selectedTextColor: "#ffffff",
};

// Shared stack styles
export const stackStyles: IStackStyles = {
  root: {
    height: "100vh",
    backgroundColor: outlookTheme.navigationBackground,
    width: "100%",
    maxWidth: "100vw",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  },
};

export const navigationStackStyles: IStackStyles = {
  root: {
    minWidth: 180,
    maxWidth: 250,
    width: "200px",
    backgroundColor: outlookTheme.navigationBackground,
    borderRight: `1px solid ${outlookTheme.borderColor}`,
    flexShrink: 0,
    height: "100%",
    overflow: "hidden",
  },
};

export const contentStackStyles: IStackStyles = {
  root: {
    flex: 1,
    backgroundColor: outlookTheme.contentBackground,
    height: "100%",
    minWidth: 0,
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  },
};

export const emailListStyles: IStackStyles = {
  root: {
    width: 320,
    minWidth: 280,
    maxWidth: 400,
    flex: "0 0 auto",
    borderRight: `1px solid ${outlookTheme.borderColor}`,
    height: "100%",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    backgroundColor: outlookTheme.contentBackground,
  },
};

export const readingPaneStyles: IStackStyles = {
  root: {
    flex: 1,
    minWidth: 0,
    overflow: "hidden",
    position: "relative",
    backgroundColor: outlookTheme.contentBackground,
  },
};

export const aiPanelStyles: IStackStyles = {
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
    overflow: "hidden",
  },
};

export const stackTokens: IStackTokens = {
  childrenGap: 0,
};

// Navigation groups configuration
export const navLinkGroups = [
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

// Utility functions for styling
export const getEmailItemStyles = (isSelected: boolean, isHovered: boolean) => ({
  padding: "12px 16px",
  borderBottom: `1px solid ${outlookTheme.borderColor}`,
  cursor: "pointer",
  backgroundColor: isSelected 
    ? outlookTheme.accentColor 
    : isHovered 
      ? outlookTheme.hoverColor 
      : "transparent",
  color: isSelected ? outlookTheme.selectedTextColor : outlookTheme.textPrimary,
  width: "100%",
  maxWidth: "100%",
  boxSizing: "border-box" as const,
  lineHeight: "1.4",
});

export const getEmailContentStyles = (isSelected: boolean) => ({
  display: "flex",
  alignItems: "flex-start",
  gap: "8px",
  width: "100%",
  maxWidth: "100%",
  minWidth: 0,
});

export const getEmailTextStyles = (isSelected: boolean, isSecondary = false) => ({
  fontWeight: isSecondary ? "normal" : "bold",
  fontSize: isSecondary ? "13px" : "14px",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  marginBottom: "2px",
  lineHeight: "1.3",
  color: isSelected 
    ? (isSecondary ? "rgba(255,255,255,0.9)" : outlookTheme.selectedTextColor)
    : (isSecondary ? outlookTheme.textSecondary : outlookTheme.textPrimary),
});
