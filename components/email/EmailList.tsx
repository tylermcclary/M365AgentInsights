"use client";

import React, { useState } from "react";
import { Stack, Text } from "@fluentui/react";
import { FlagRegular } from "@fluentui/react-icons";
import { EmailListProps } from "@/types/email";
import { outlookTheme, emailListStyles, getEmailItemStyles, getEmailContentStyles, getEmailTextStyles } from "@/lib/outlook-theme";
import { EmailService } from "@/services/email-service";

export default function EmailList({
  emails,
  selectedEmail,
  onEmailSelect,
  selectedFolder,
  searchQuery,
  isLoading = false,
  error = undefined,
}: EmailListProps) {
  const [hoveredEmailId, setHoveredEmailId] = useState<string | null>(null);

  const handleEmailClick = (email: typeof emails[0]) => {
    try {
      onEmailSelect(email);
    } catch (error) {
      console.error("Error selecting email:", error);
    }
  };

  const handleMouseEnter = (emailId: string) => {
    setHoveredEmailId(emailId);
  };

  const handleMouseLeave = () => {
    setHoveredEmailId(null);
  };

  if (error) {
    return (
      <Stack styles={emailListStyles} className="outlook-email-list">
        <div style={{ padding: "8px 16px", borderBottom: `1px solid ${outlookTheme.borderColor}` }}>
          <Text variant="medium" styles={{ root: { fontWeight: "bold" } }}>
            {EmailService.getFolderDisplayName(selectedFolder)}
          </Text>
        </div>
        <div style={{ 
          flex: 1, 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center",
          padding: "20px",
          textAlign: "center"
        }}>
          <Text variant="medium" styles={{ root: { color: outlookTheme.textSecondary } }}>
            Error loading emails: {error}
          </Text>
        </div>
      </Stack>
    );
  }

  if (isLoading) {
    return (
      <Stack styles={emailListStyles} className="outlook-email-list">
        <div style={{ padding: "8px 16px", borderBottom: `1px solid ${outlookTheme.borderColor}` }}>
          <Text variant="medium" styles={{ root: { fontWeight: "bold" } }}>
            {EmailService.getFolderDisplayName(selectedFolder)}
          </Text>
        </div>
        <div style={{ 
          flex: 1, 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center",
          padding: "20px"
        }}>
          <Text variant="medium" styles={{ root: { color: outlookTheme.textSecondary } }}>
            Loading emails...
          </Text>
        </div>
      </Stack>
    );
  }

  if (emails.length === 0) {
    return (
      <Stack styles={emailListStyles} className="outlook-email-list">
        <div style={{ padding: "8px 16px", borderBottom: `1px solid ${outlookTheme.borderColor}` }}>
          <Text variant="medium" styles={{ root: { fontWeight: "bold" } }}>
            {EmailService.getFolderDisplayName(selectedFolder)}
          </Text>
        </div>
        <div style={{ 
          flex: 1, 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center",
          padding: "20px",
          textAlign: "center"
        }}>
          <div>
            <Text variant="medium" styles={{ root: { color: outlookTheme.textSecondary } }}>
              {searchQuery ? "No emails found matching your search" : "No emails in this folder"}
            </Text>
            {searchQuery && (
              <Text variant="small" styles={{ 
                root: { 
                  color: outlookTheme.textSecondary, 
                  marginTop: "8px",
                  display: "block"
                } 
              }}>
                Try a different search term
              </Text>
            )}
          </div>
        </div>
      </Stack>
    );
  }

  return (
    <Stack styles={emailListStyles} className="outlook-email-list">
      <div style={{ padding: "8px 16px", borderBottom: `1px solid ${outlookTheme.borderColor}` }}>
        <Text variant="medium" styles={{ root: { fontWeight: "bold" } }}>
          {EmailService.getFolderDisplayName(selectedFolder)}
        </Text>
      </div>
      <div style={{ 
        flex: 1, 
        overflowY: "auto", 
        overflowX: "hidden", 
        backgroundColor: outlookTheme.contentBackground, 
        minHeight: 0, 
        width: "100%", 
        maxWidth: "100%" 
      }}>
        {emails.map((email) => {
          const isSelected = selectedEmail?.id === email.id;
          const isHovered = hoveredEmailId === email.id;
          
          return (
            <div
              key={`email-${email.id}`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleEmailClick(email);
              }}
              style={getEmailItemStyles(isSelected, isHovered)}
              onMouseEnter={() => handleMouseEnter(email.id)}
              onMouseLeave={handleMouseLeave}
            >
              <div 
                style={getEmailContentStyles(isSelected)}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleEmailClick(email);
                }}
              >
                {/* Status indicators */}
                <div style={{ display: "flex", alignItems: "center", gap: "4px", minWidth: "20px", flexShrink: 0 }}>
                  {email.isFlagged && (
                    <FlagRegular style={{ 
                      color: isSelected ? "white" : outlookTheme.accentColor, 
                      fontSize: "12px" 
                    }} />
                  )}
                  <div style={{ 
                    width: 6, 
                    height: 6, 
                    borderRadius: "50%", 
                    backgroundColor: email.isRead 
                      ? "transparent" 
                      : (isSelected ? "white" : outlookTheme.accentColor), 
                    flexShrink: 0 
                  }} />
                </div>
                
                {/* Email content */}
                <div style={{ flex: 1, minWidth: 0, maxWidth: "calc(100% - 80px)" }}>
                  <div style={getEmailTextStyles(isSelected)}>
                    {email.sender}
                  </div>
                  <div style={getEmailTextStyles(isSelected, true)}>
                    {email.subject}
                  </div>
                  <div style={getEmailTextStyles(isSelected, true)}>
                    {email.preview}
                  </div>
                </div>
                
                {/* Date */}
                <div style={{ 
                  fontSize: "11px", 
                  color: isSelected ? "rgba(255,255,255,0.7)" : outlookTheme.textSecondary, 
                  whiteSpace: "nowrap", 
                  flexShrink: 0,
                  minWidth: "60px",
                  textAlign: "right"
                }}>
                  {EmailService.formatListDate(email.receivedTime)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Stack>
  );
}
