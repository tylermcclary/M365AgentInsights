import { EmailItem, FolderKey } from "@/types/email";
import { clients, getCommunicationsByClient } from "@/data/sampleData";

export class EmailService {
  /**
   * Generate email items from all clients' sample data
   */
  static generateEmailItems(): EmailItem[] {
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
  }

  /**
   * Filter emails by folder and search query
   */
  static filterEmails(
    emails: EmailItem[], 
    selectedFolder: FolderKey, 
    searchQuery: string
  ): EmailItem[] {
    // First filter by folder
    let filtered = emails.filter(email => email.folder === selectedFolder);
    
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
  }

  /**
   * Get folder display name
   */
  static getFolderDisplayName(folder: FolderKey): string {
    const folderNames: Record<FolderKey, string> = {
      inbox: "Inbox",
      sent: "Sent Items",
      drafts: "Drafts",
      deleted: "Deleted Items",
      archive: "Archive",
      flagged: "Flagged"
    };
    return folderNames[folder] || "Unknown";
  }

  /**
   * Format date for display
   */
  static formatDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return "Invalid Date";
    }
  }

  /**
   * Format date for email list
   */
  static formatListDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch (error) {
      return "Invalid Date";
    }
  }

  /**
   * Validate email item
   */
  static validateEmailItem(email: Partial<EmailItem>): email is EmailItem {
    return !!(
      email.id &&
      email.sender &&
      email.subject !== undefined &&
      email.preview !== undefined &&
      email.body !== undefined &&
      email.receivedTime &&
      typeof email.isRead === 'boolean' &&
      typeof email.isFlagged === 'boolean' &&
      typeof email.hasAttachments === 'boolean' &&
      email.folder
    );
  }
}
