"use client";

import { EventList } from "@/components/event-list";
import { Calendar, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function EventsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <Calendar className="h-8 w-8" />
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Events</h1>
              <p className="text-muted-foreground">
                Manage and organize your events
              </p>
            </div>
          </div>
          <Link href="/events/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Event
            </Button>
          </Link>
        </div>

        <EventList />
      </div>
    </div>
  );
}

