"use client";

import { EventForm } from "@/components/event-form";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import type { EventWithAttendees } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDateTimeLocal } from "@/lib/date-utils";

async function fetchEvent(id: number): Promise<EventWithAttendees> {
  const response = await fetch(`/api/events`);
  if (!response.ok) {
    throw new Error("Failed to fetch event");
  }
  const events: EventWithAttendees[] = await response.json();
  const event = events.find((e) => e.id === id);
  if (!event) {
    throw new Error("Event not found");
  }
  return event;
}

export default function EditEventPage() {
  const params = useParams();
  const eventId = parseInt(params.id as string);

  const { data: event, isLoading } = useQuery({
    queryKey: ["events", eventId],
    queryFn: () => fetchEvent(eventId),
    enabled: !isNaN(eventId),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto max-w-3xl">
          <Skeleton className="h-10 w-48 mb-4" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto max-w-3xl">
          <p>Event not found</p>
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

  const formattedDate = formatDateTimeLocal(event.date);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-3xl">
        <div className="mb-6">
          <Link href="/events">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Events
            </Button>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Edit Event</h1>
          <p className="text-muted-foreground mt-2">
            Update the event details below
          </p>
        </div>

        <EventForm
          eventId={event.id}
          initialData={{
            title: event.title,
            date: formattedDate,
            description: event.description,
            capacity: event.capacity,
          }}
        />
      </div>
    </div>
  );
}

