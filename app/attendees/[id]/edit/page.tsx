"use client";

import { AttendeeForm } from "@/components/attendee-form";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import type { EventWithAttendees, AttendeeWithEvent } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

async function fetchAttendee(id: number): Promise<AttendeeWithEvent> {
  const response = await fetch(`/api/attendees?eventId=0`);
  if (!response.ok) {
    throw new Error("Failed to fetch attendee");
  }
  // We need to fetch all attendees and find the one we need
  // This is not ideal but works for now
  const allEventsResponse = await fetch("/api/events");
  if (!allEventsResponse.ok) {
    throw new Error("Failed to fetch events");
  }
  const events: EventWithAttendees[] = await allEventsResponse.json();
  
  for (const event of events) {
    const attendee = event.attendees?.find((a) => a.id === id);
    if (attendee) {
      return {
        ...attendee,
        event: event,
      };
    }
  }
  
  throw new Error("Attendee not found");
}

async function fetchEvents(): Promise<EventWithAttendees[]> {
  const response = await fetch("/api/events");
  if (!response.ok) {
    throw new Error("Failed to fetch events");
  }
  return response.json();
}

export default function EditAttendeePage() {
  const params = useParams();
  const attendeeId = parseInt(params.id as string);

  const { data: attendee, isLoading: attendeeLoading } = useQuery({
    queryKey: ["attendee", attendeeId],
    queryFn: () => fetchAttendee(attendeeId),
    enabled: !isNaN(attendeeId),
  });

  const { data: events = [] } = useQuery({
    queryKey: ["events"],
    queryFn: fetchEvents,
  });

  if (attendeeLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto max-w-3xl">
          <Skeleton className="h-10 w-48 mb-4" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (!attendee) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto max-w-3xl">
          <p>Attendee not found</p>
          <Link href="/">
            <Button variant="ghost" className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-3xl">
        <div className="mb-6">
          <Link href="/attendees">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Attendees
            </Button>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Edit Attendee</h1>
          <p className="text-muted-foreground mt-2">
            Update the attendee details below
          </p>
        </div>

        <AttendeeForm
          events={events}
          attendeeId={attendee.id}
          initialData={{
            name: attendee.name,
            email: attendee.email,
            eventId: attendee.eventId,
          }}
        />
      </div>
    </div>
  );
}

