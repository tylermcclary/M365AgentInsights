export type GraphUser = {
  id: string;
  displayName?: string;
  mail?: string;
  userPrincipalName?: string;
};

export type GraphEmailAddress = {
  name?: string;
  address?: string;
};

export type GraphRecipient = {
  emailAddress?: GraphEmailAddress;
};

export type GraphMailItem = {
  id: string;
  subject?: string;
  from?: GraphRecipient;
  receivedDateTime: string;
};

export type GraphDateTimeTimeZone = {
  dateTime: string;
  timeZone?: string;
};

export type GraphOrganizer = {
  emailAddress?: GraphEmailAddress;
};

export type GraphCalendarEvent = {
  id: string;
  subject?: string;
  start: GraphDateTimeTimeZone;
  end: GraphDateTimeTimeZone;
  organizer?: GraphOrganizer;
};


