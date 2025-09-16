"use client";

import React from "react";
import { Stack, Text, IconButton, PrimaryButton } from "@fluentui/react";
import { ReadingPaneProps } from "@/types/email";
import { outlookTheme, readingPaneStyles } from "@/lib/outlook-theme";
import { EmailService } from "@/services/email-service";

export default function ReadingPane({
  selectedEmail,
  onReply,
  onReplyAll,
  onForward,
  onClose,
  onToggleAIPanel,
  isAIPanelOpen = false,
}: ReadingPaneProps) {
  const handleAction = (action: (() => void) | undefined) => {
    try {
      if (action) {
        action();
      }
    } catch (error) {
      console.error("Error performing email action:", error);
    }
  };

  if (!selectedEmail) {
    return (
      <Stack styles={readingPaneStyles} className="outlook-reading-pane">
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center", 
          height: "100%",
          backgroundColor: outlookTheme.contentBackground,
          padding: "40px"
        }}>
          <div style={{ textAlign: "center", maxWidth: "400px" }}>
            <Text variant="large" styles={{ 
              root: { 
                color: outlookTheme.textSecondary,
                fontSize: "24px",
                fontWeight: "300",
                marginBottom: "12px"
              } 
            }}>
              Select an email to view
            </Text>
            <Text variant="medium" styles={{ 
              root: { 
                color: outlookTheme.textSecondary,
                fontSize: "14px",
                lineHeight: "1.5"
              } 
            }}>
              Choose an email from the list to read its content
            </Text>
          </div>
        </div>
      </Stack>
    );
  }

  return (
    <Stack styles={readingPaneStyles} className="outlook-reading-pane">
      <div style={{ 
        display: "flex", 
        flexDirection: "column", 
        height: "100%", 
        width: "100%",
        backgroundColor: outlookTheme.contentBackground
      }}>
        {/* Email Header */}
        <div style={{ 
          padding: "20px", 
          borderBottom: `1px solid ${outlookTheme.borderColor}`,
          backgroundColor: outlookTheme.contentBackground,
          flexShrink: 0
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ marginBottom: "12px" }}>
                <Text variant="large" styles={{ 
                  root: { 
                    fontWeight: "bold", 
                    fontSize: "18px",
                    lineHeight: "1.3",
                    wordBreak: "break-word"
                  } 
                }}>
                  {selectedEmail.subject || "No Subject"}
                </Text>
              </div>
              <div style={{ marginBottom: "8px" }}>
                <Text variant="medium" styles={{ 
                  root: { 
                    color: outlookTheme.textPrimary,
                    fontWeight: "600"
                  } 
                }}>
                  From: {selectedEmail.sender || "Unknown Sender"}
                </Text>
              </div>
              <div style={{ marginBottom: "4px" }}>
                <Text variant="small" styles={{ 
                  root: { 
                    color: outlookTheme.textSecondary,
                    fontSize: "13px"
                  } 
                }}>
                  To: Me
                </Text>
              </div>
              <div>
                <Text variant="small" styles={{ 
                  root: { 
                    color: outlookTheme.textSecondary,
                    fontSize: "13px"
                  } 
                }}>
                  {EmailService.formatDate(selectedEmail.receivedTime)}
                </Text>
              </div>
            </div>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              {onToggleAIPanel && (
                <PrimaryButton
                  text={isAIPanelOpen ? "Hide AI" : "AI Insights"}
                  iconProps={{ iconName: "Lightbulb" }}
                  onClick={onToggleAIPanel}
                />
              )}
              {onClose && (
                <IconButton
                  iconProps={{ iconName: "ChromeClose" }}
                  onClick={() => handleAction(onClose)}
                  title="Close reading pane"
                />
              )}
            </div>
          </div>
        </div>
        
        {/* Email Content */}
        <div 
          style={{ 
            padding: "24px", 
            flex: 1, 
            overflowY: "auto",
            overflowX: "hidden",
            backgroundColor: outlookTheme.contentBackground,
            minHeight: 0
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {selectedEmail.body ? (
            <Text styles={{ 
              root: { 
                lineHeight: "1.6", 
                fontSize: "14px", 
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                color: outlookTheme.textPrimary
              } 
            }}>
              {selectedEmail.body}
            </Text>
          ) : (
            <div style={{ 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center", 
              height: "200px",
              color: outlookTheme.textSecondary
            }}>
              <Text variant="medium" styles={{ root: { color: outlookTheme.textSecondary } }}>
                No content available for this email
              </Text>
            </div>
          )}
        </div>
        
        {/* Email Actions */}
        <div style={{ 
          padding: "16px", 
          borderTop: `1px solid ${outlookTheme.borderColor}`,
          backgroundColor: outlookTheme.contentBackground,
          flexShrink: 0
        }}>
          <div style={{ display: "flex", gap: "8px" }}>
            <IconButton 
              iconProps={{ iconName: "Reply" }} 
              title="Reply" 
              onClick={() => handleAction(onReply)}
            />
            <IconButton 
              iconProps={{ iconName: "ReplyAll" }} 
              title="Reply All" 
              onClick={() => handleAction(onReplyAll)}
            />
            <IconButton 
              iconProps={{ iconName: "Forward" }} 
              title="Forward" 
              onClick={() => handleAction(onForward)}
            />
          </div>
        </div>
      </div>
    </Stack>
  );
}
