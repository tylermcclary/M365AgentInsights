"use client";

import React, { useState, useMemo } from "react";
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
  DetailsList,
  IColumn,
  SelectionMode,
  Panel,
  PanelType,
} from "@fluentui/react";
import { 
  outlookTheme, 
  stackStyles, 
  navigationStackStyles, 
  contentStackStyles, 
  stackTokens, 
  navLinkGroups 
} from "@/lib/outlook-theme";
import OutlookInterface from "../email/OutlookInterface";
import CalendarInterface from "../calendar/CalendarInterface";
import { clients, meetings, type SampleMeeting } from "@/data/sampleData";

type ViewMode = "mail" | "calendar" | "people";

export default function OutlookMainInterface() {
  const [currentView, setCurrentView] = useState<ViewMode>("mail");
  const [showAIPanel, setShowAIPanel] = useState(false);

  const handleAIPanelToggle = (isOpen: boolean) => {
    setShowAIPanel(isOpen);
  };

  // CommandBar items
  const commandBarItems: ICommandBarItemProps[] = useMemo(() => [
    {
      key: "new",
      text: "New",
      iconProps: { iconName: "Add" },
      onClick: () => {
        if (currentView === "mail") {
          console.log("New email");
        } else if (currentView === "calendar") {
          console.log("New meeting");
        }
      },
    },
    {
      key: "reply",
      text: "Reply",
      iconProps: { iconName: "Reply" },
      disabled: currentView !== "mail",
      onClick: () => console.log("Reply"),
    },
    {
      key: "replyAll",
      text: "Reply All",
      iconProps: { iconName: "ReplyAll" },
      disabled: currentView !== "mail",
      onClick: () => console.log("Reply All"),
    },
    {
      key: "forward",
      text: "Forward",
      iconProps: { iconName: "Forward" },
      disabled: currentView !== "mail",
      onClick: () => console.log("Forward"),
    },
    {
      key: "aiInsights",
      text: "AI Insights",
      iconProps: { iconName: "Lightbulb" },
      onClick: () => handleAIPanelToggle(true),
    },
  ], [currentView]);

  const commandBarFarItems: ICommandBarItemProps[] = useMemo(() => [
    {
      key: "search",
      onRender: () => (
        <SearchBox
          placeholder={currentView === "mail" ? "Search mail" : "Search calendar"}
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
  ], [currentView]);

  // Navigation groups - show folders when in mail view, sections when in other views
  const navigationGroups: INavLinkGroup[] = useMemo(() => {
    if (currentView === "mail") {
      // Show email folders when in mail view
      return [
        {
          links: [
            {
              name: "Inbox",
              key: "inbox",
              url: "",
              iconProps: { iconName: "Inbox" },
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
    } else {
      // Show main sections for calendar and people
      return [
        {
          links: [
            {
              name: "Mail",
              key: "mail",
              url: "",
              iconProps: { iconName: "Mail" },
            },
            {
              name: "Calendar",
              key: "calendar",
              url: "",
              iconProps: { iconName: "Calendar" },
            },
            {
              name: "People",
              key: "people",
              url: "",
              iconProps: { iconName: "People" },
            },
          ],
        },
      ];
    }
  }, [currentView]);

  return (
    <Stack styles={stackStyles} tokens={stackTokens} className="outlook-container">
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

      <Stack horizontal styles={{ root: { flex: 1, minWidth: 0, overflow: "hidden" } }} tokens={stackTokens}>
        {/* Left Navigation */}
        <Stack styles={navigationStackStyles} className="outlook-navigation">
          <div style={{ padding: "12px 8px" }}>
            <Stack>
              <div style={{ fontWeight: "bold", color: outlookTheme.textPrimary, fontSize: "16px" }}>
                Outlook
              </div>
            </Stack>
          </div>
          
          <Nav
            groups={navigationGroups}
            selectedKey={currentView === "mail" ? "inbox" : currentView}
            onLinkClick={(_, item) => {
              if (item && item.key) {
                if (currentView === "mail") {
                  // In mail view, clicking folders should stay in mail view
                  // The OutlookInterface will handle folder selection
                  return;
                } else {
                  // In other views, clicking switches the main view
                  setCurrentView(item.key as ViewMode);
                }
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
            selectedKey={currentView}
            onLinkClick={(item) => {
              if (item && item.props.itemKey) {
                setCurrentView(item.props.itemKey as ViewMode);
              }
            }}
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

          {/* Content Area */}
          <Stack styles={{ root: { flex: 1, height: "100%", minWidth: 0, overflow: "hidden" } }} tokens={stackTokens}>
            {currentView === "mail" && (
              <OutlookInterface 
                showAIPanel={showAIPanel}
                onAIPanelToggle={handleAIPanelToggle}
              />
            )}
            
            {currentView === "calendar" && (
              <CalendarInterface
                onNavigateToEmail={() => setCurrentView("mail")}
                showAIPanel={showAIPanel}
                onAIPanelToggle={handleAIPanelToggle}
              />
            )}
            
            {currentView === "people" && (
              <Stack styles={{ root: { padding: 20, alignItems: "center", justifyContent: "center" } }}>
                <div style={{ fontSize: "18px", color: outlookTheme.textSecondary }}>
                  People view coming soon...
                </div>
              </Stack>
            )}
          </Stack>
        </Stack>
      </Stack>
    </Stack>
  );
}
