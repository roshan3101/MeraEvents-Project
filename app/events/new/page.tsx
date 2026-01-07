"use client";

import { EventForm } from "@/components/event-form";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NewEventPage() {
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
          <h1 className="text-3xl font-bold tracking-tight">Create New Event</h1>
          <p className="text-muted-foreground mt-2">
            Fill in the details below to create a new event
          </p>
        </div>

        <EventForm />
      </div>
    </div>
  );
}

