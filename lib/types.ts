import type { Event, Attendee } from "@prisma/client";

export type EventWithAttendees = Event & {
  attendees: Attendee[];
};

export type AttendeeWithEvent = Attendee & {
  event: Event;
};

