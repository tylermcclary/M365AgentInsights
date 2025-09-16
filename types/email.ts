export interface EmailItem {
  id: string;
  sender: string;
  senderEmail?: string;
  subject: string;
  preview: string;
  body: string;
  receivedTime: string;
  isRead: boolean;
  isFlagged: boolean;
  hasAttachments: boolean;
  folder: string;
}

export type FolderKey = "inbox" | "sent" | "drafts" | "deleted" | "archive" | "flagged";

export interface EmailListProps {
  emails: EmailItem[];
  selectedEmail: EmailItem | null;
  onEmailSelect: (email: EmailItem) => void;
  selectedFolder: FolderKey;
  searchQuery: string;
  isLoading?: boolean;
  error?: string;
}

export interface ReadingPaneProps {
  selectedEmail: EmailItem | null;
  onReply?: () => void;
  onReplyAll?: () => void;
  onForward?: () => void;
  onClose?: () => void;
  onToggleAIPanel?: () => void;
  isAIPanelOpen?: boolean;
}

export interface EmailInterfaceState {
  selectedFolder: FolderKey;
  selectedEmail: EmailItem | null;
  searchQuery: string;
  isReadingPaneOpen: boolean;
  isAIPanelOpen: boolean;
  isLoading: boolean;
  error: string | undefined;
}

export interface EmailInterfaceActions {
  setSelectedFolder: (folder: FolderKey) => void;
  setSelectedEmail: (email: EmailItem | null) => void;
  setSearchQuery: (query: string) => void;
  setIsReadingPaneOpen: (open: boolean) => void;
  setIsAIPanelOpen: (open: boolean) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | undefined) => void;
}
