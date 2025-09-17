import { useState, useMemo, useCallback, useEffect } from "react";
import { EmailInterfaceState, EmailInterfaceActions, EmailItem, FolderKey } from "@/types/email";
import { EmailService } from "@/services/email-service";

export function useEmailInterface() {
  // State
  const [selectedFolder, setSelectedFolder] = useState<FolderKey>("inbox");
  const [selectedEmail, setSelectedEmail] = useState<EmailItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isReadingPaneOpen, setIsReadingPaneOpen] = useState(true);
  const [isAIPanelOpen, setIsAIPanelOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  // Generate email items from sample data
  const emailItems = useMemo(() => {
    try {
      return EmailService.generateEmailItems();
    } catch (err) {
      setError("Failed to load emails");
      console.error("Error generating email items:", err);
      return [];
    }
  }, []);

  // Filter emails based on folder and search
  const filteredEmails = useMemo(() => {
    try {
      const filtered = EmailService.filterEmails(emailItems, selectedFolder, searchQuery);
      return filtered;
    } catch (err) {
      setError("Failed to filter emails");
      console.error("Error filtering emails:", err);
      return [];
    }
  }, [emailItems, selectedFolder, searchQuery]);

  // Auto-select first email when emails are loaded or folder changes
  useEffect(() => {
    if (filteredEmails.length > 0 && !selectedEmail) {
      setSelectedEmail(filteredEmails[0]);
    }
  }, [filteredEmails, selectedEmail]);

  // Actions
  const handleFolderChange = useCallback((folder: FolderKey) => {
    try {
      setSelectedFolder(folder);
      setSelectedEmail(null); // Clear selection when changing folders
      setError(undefined);
    } catch (err) {
      setError("Failed to change folder");
      console.error("Error changing folder:", err);
    }
  }, []);

  const handleEmailSelect = useCallback((email: EmailItem | null) => {
    try {
      console.log("📧 Email selected:", {
        id: email?.id,
        subject: email?.subject,
        sender: email?.sender,
        senderEmail: email?.senderEmail,
        hasBody: !!email?.body
      });
      setSelectedEmail(email);
      setError(undefined);
    } catch (err) {
      setError("Failed to select email");
      console.error("Error selecting email:", err);
    }
  }, []);

  const handleSearchChange = useCallback((query: string) => {
    try {
      setSearchQuery(query);
      setError(undefined);
    } catch (err) {
      setError("Failed to update search");
      console.error("Error updating search:", err);
    }
  }, []);

  const handleReadingPaneToggle = useCallback((open: boolean) => {
    try {
      setIsReadingPaneOpen(open);
      if (!open) {
        setSelectedEmail(null); // Clear selection when closing reading pane
      }
    } catch (err) {
      setError("Failed to toggle reading pane");
      console.error("Error toggling reading pane:", err);
    }
  }, []);

  const handleAIPanelToggle = useCallback((open: boolean) => {
    try {
      setIsAIPanelOpen(open);
    } catch (err) {
      setError("Failed to toggle AI panel");
      console.error("Error toggling AI panel:", err);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(undefined);
  }, []);

  // State object
  const state: EmailInterfaceState = {
    selectedFolder,
    selectedEmail,
    searchQuery,
    isReadingPaneOpen,
    isAIPanelOpen,
    isLoading,
    error,
  };

  // Actions object
  const actions: EmailInterfaceActions = {
    setSelectedFolder: handleFolderChange,
    setSelectedEmail: handleEmailSelect,
    setSearchQuery: handleSearchChange,
    setIsReadingPaneOpen: handleReadingPaneToggle,
    setIsAIPanelOpen: handleAIPanelToggle,
    setLoading: setIsLoading,
    setError: setError,
  };

  return {
    state,
    actions,
    emailItems,
    filteredEmails,
    clearError,
  };
}
