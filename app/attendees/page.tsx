"use client";

import { AttendeeList } from "@/components/attendee-list";
import { useQuery } from "@tanstack/react-query";
import type { EventWithAttendees } from "@/lib/types";
import { Users, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

async function fetchEvents(): Promise<EventWithAttendees[]> {
  const response = await fetch("/api/events");
  if (!response.ok) {
    throw new Error("Failed to fetch events");
  }
  return response.json();
}

export default function AttendeesPage() {
  const { data: events = [] } = useQuery({
    queryKey: ["events"],
    queryFn: fetchEvents,
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <Users className="h-8 w-8" />
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Attendees</h1>
              <p className="text-muted-foreground">
                View and manage event registrations
              </p>
            </div>
          </div>
          <Link href="/attendees/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Register
            </Button>
          </Link>
        </div>

        <AttendeeList events={events} />
      </div>
    </div>
  );
}

