"use client";

import { AttendeeForm } from "@/components/attendee-form";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { EventWithAttendees } from "@/lib/types";

async function fetchEvents(): Promise<EventWithAttendees[]> {
  const response = await fetch("/api/events");
  if (!response.ok) {
    throw new Error("Failed to fetch events");
  }
  return response.json();
}

export default function NewAttendeePage() {
  const { data: events = [] } = useQuery({
    queryKey: ["events"],
    queryFn: fetchEvents,
  });

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
          <h1 className="text-3xl font-bold tracking-tight">Register for Event</h1>
          <p className="text-muted-foreground mt-2">
            Fill in your details to register for an event
          </p>
        </div>

        <AttendeeForm events={events} />
      </div>
    </div>
  );
}

