"use client";

import React, { useState, useMemo, useCallback } from "react";
import { Stack } from "@fluentui/react";
import { Inbox, Send, FileText, Trash2, Archive, Star, Search, Plus, Paperclip, X, Reply, ReplyAll, Forward, PanelRightOpen, PanelRightClose, Calendar } from "lucide-react";
import AssistantPanel from "@/components/ai-agent/AssistantPanel";
import { clients, getCommunicationsByClient, emails } from "@/data/sampleData";
import ContextTrigger from "@/components/ai-agent/ContextTrigger";
import Button from "@/components/ui/Button";
import Tooltip from "@/components/ui/Tooltip";
import { outlookTheme } from "@/lib/outlook-theme";

type Email = {
  id: string;
  sender: string;
  senderEmail?: string;
  subject: string;
  preview: string;
  timestamp: string; // ISO
  body: string;
  starred?: boolean;
  folder: "Inbox" | "Sent" | "Drafts" | "Archive" | "Trash";
  attachments?: { name: string; sizeKb: number }[];
};

// Convert SampleEmail to Email format for the component
const sampleEmails: Email[] = emails.map(email => ({
  id: email.id,
  sender: email.from.name,
  senderEmail: email.from.address,
  subject: email.subject,
  preview: email.body.length > 100 ? email.body.substring(0, 100) + "..." : email.body,
  timestamp: email.receivedDateTime,
  body: email.body,
  folder: "Inbox" as const,
  starred: Math.random() < 0.2, // Randomly star some emails
  attachments: Math.random() < 0.3 ? [{ name: "attachment.pdf", sizeKb: Math.floor(Math.random() * 500) + 100 }] : undefined,
}));

interface EmailInterfaceProps {
  showAIPanel?: boolean;
  onAIPanelToggle?: (show: boolean) => void;
}

export default function EmailInterface({ showAIPanel = false, onAIPanelToggle }: EmailInterfaceProps) {
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [isReadingPaneOpen, setIsReadingPaneOpen] = useState(true);
  const [isAIPanelOpen, setIsAIPanelOpen] = useState(showAIPanel);

  const stackTokens = { childrenGap: 0 };

  const filteredEmails = useMemo(() => {
    return sampleEmails.filter(email => email.folder === "Inbox");
  }, []);

  const handleEmailSelect = useCallback((email: Email) => {
    setSelectedEmail(email);
    setIsReadingPaneOpen(true);
  }, []);

  const handleAIPanelToggle = useCallback((show: boolean) => {
    setIsAIPanelOpen(show);
    onAIPanelToggle?.(show);
  }, [onAIPanelToggle]);

  const getCommunicationsForSelectedEmail = useCallback(() => {
    // For now, return empty array to avoid type issues
    // TODO: Fix proper communication data mapping
    return [];
  }, []);

  return (
    <div style={{ height: "100%", backgroundColor: "#ffffff", display: "flex", flexDirection: "column" }}>
      <div style={{ flex: 1, minWidth: 0, overflow: "hidden", display: "flex", flexDirection: "row" }}>
        {/* Email List */}
        <div style={{
          width: "320px",
          minWidth: "280px",
          maxWidth: "400px",
          flex: "0 0 auto",
          height: "100%",
          borderRight: `1px solid ${outlookTheme.borderColor}`,
          backgroundColor: outlookTheme.contentBackground,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden"
        }}>
          {/* Email List Header */}
          <div style={{
            padding: "16px",
            borderBottom: `1px solid ${outlookTheme.borderColor}`,
            backgroundColor: outlookTheme.contentBackground,
            flexShrink: 0
          }}>
            <div style={{ fontWeight: "bold", color: outlookTheme.textPrimary }}>
              Inbox
            </div>
          </div>

          {/* Email List Content */}
          <div style={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
            {filteredEmails.map((email) => (
              <div
                key={email.id}
                onClick={() => handleEmailSelect(email)}
                style={{
                  padding: "12px 16px",
                  borderBottom: `1px solid ${outlookTheme.borderColor}`,
                  cursor: "pointer",
                  backgroundColor: selectedEmail?.id === email.id ? outlookTheme.accentColor : "transparent",
                  color: selectedEmail?.id === email.id ? "white" : outlookTheme.textPrimary
                }}
                onMouseEnter={(e) => {
                  if (selectedEmail?.id !== email.id) {
                    (e.target as HTMLElement).style.backgroundColor = outlookTheme.borderColor;
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedEmail?.id !== email.id) {
                    (e.target as HTMLElement).style.backgroundColor = "transparent";
                  }
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
                  <div style={{ fontWeight: "600", fontSize: "14px" }}>
                    {email.sender}
                  </div>
                  <div style={{ fontSize: "12px", opacity: 0.7 }}>
                    {new Date(email.timestamp).toLocaleDateString()}
                  </div>
                </div>
                <div style={{ fontWeight: "600", fontSize: "13px", marginBottom: "4px" }}>
                  {email.subject}
                </div>
                <div style={{ fontSize: "12px", opacity: 0.8, lineHeight: "1.4" }}>
                  {email.preview}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Reading Pane */}
        {isReadingPaneOpen && (
          <div style={{
            flex: 1,
            minWidth: 0,
            height: "100%",
            backgroundColor: outlookTheme.contentBackground,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden"
          }}>
            {selectedEmail ? (
              <>
                {/* Reading Pane Header */}
                <div style={{
                  padding: "16px",
                  borderBottom: `1px solid ${outlookTheme.borderColor}`,
                  backgroundColor: outlookTheme.contentBackground,
                  flexShrink: 0,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start"
                }}>
                  <div style={{ marginBottom: "8px", flex: 1 }}>
                    <div style={{ fontWeight: "bold", fontSize: "16px", color: outlookTheme.textPrimary }}>
                      {selectedEmail.subject}
                    </div>
                    <div style={{ fontSize: "14px", color: outlookTheme.textSecondary, marginTop: "4px" }}>
                      From: {selectedEmail.sender}
                    </div>
                    <div style={{ fontSize: "12px", color: outlookTheme.textSecondary }}>
                      {new Date(selectedEmail.timestamp).toLocaleString()}
                    </div>
                  </div>
                  <button
                    onClick={() => handleAIPanelToggle(!isAIPanelOpen)}
                    style={{
                      background: "none",
                      border: "1px solid #0078d4",
                      color: "#0078d4",
                      padding: "8px 16px",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontSize: "14px",
                      fontWeight: "600",
                      marginLeft: "16px",
                      flexShrink: 0
                    }}
                    onMouseEnter={(e) => {
                      (e.target as HTMLElement).style.backgroundColor = "#0078d4";
                      (e.target as HTMLElement).style.color = "white";
                    }}
                    onMouseLeave={(e) => {
                      (e.target as HTMLElement).style.backgroundColor = "transparent";
                      (e.target as HTMLElement).style.color = "#0078d4";
                    }}
                  >
                    {isAIPanelOpen ? "Hide AI" : "Show AI"}
                  </button>
                </div>

                {/* Reading Pane Content */}
                <div style={{
                  flex: 1,
                  minHeight: 0,
                  padding: "16px",
                  overflowY: "auto"
                }}>
                  <div style={{ fontSize: "14px", lineHeight: "1.6", color: outlookTheme.textPrimary }}>
                    {selectedEmail.body}
                  </div>
                </div>
              </>
            ) : (
              <div style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: outlookTheme.textSecondary
              }}>
                Select an email to read
              </div>
            )}
          </div>
        )}

        {/* AI Insights Panel */}
        {isAIPanelOpen && (
          <div style={{
            width: "320px",
            minWidth: "280px",
            maxWidth: "400px",
            flex: "0 0 auto",
            height: "100%",
            borderLeft: `1px solid ${outlookTheme.borderColor}`,
            backgroundColor: outlookTheme.contentBackground,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden"
          }}>
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
              <button
                onClick={() => handleAIPanelToggle(false)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: outlookTheme.textSecondary,
                  padding: "4px",
                  borderRadius: "4px",
                  fontSize: "16px",
                  fontWeight: "bold"
                }}
                onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = outlookTheme.borderColor}
                onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = "transparent"}
                title="Close AI Assistant"
              >
                ×
              </button>
            </div>

            {/* AI Panel Content */}
            <div style={{ flex: 1, minHeight: 0, padding: "0", overflowY: "auto" }}>
              <AssistantPanel
                email={selectedEmail ? {
                  id: selectedEmail.id,
                  sender: selectedEmail.sender,
                  senderEmail: selectedEmail.senderEmail || selectedEmail.sender,
                  subject: selectedEmail.subject,
                  body: selectedEmail.body,
                  receivedAt: selectedEmail.timestamp,
                } : undefined}
                communications={getCommunicationsForSelectedEmail()}
                clientEmail={selectedEmail?.senderEmail || selectedEmail?.sender}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}