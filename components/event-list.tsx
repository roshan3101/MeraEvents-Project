"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Calendar, Users, FileText, Edit, Trash2, Plus } from "lucide-react";
import type { EventWithAttendees } from "@/lib/types";
import { toast } from "sonner";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState, useMemo } from "react";
import { formatEventDate, formatEventTime, isPastEvent } from "@/lib/date-utils";
import { ErrorRetry } from "@/components/error-retry";
import { EventSearch } from "@/components/event-search";

async function fetchEvents(): Promise<EventWithAttendees[]> {
  const response = await fetch("/api/events");
  if (!response.ok) {
    throw new Error("Failed to fetch events");
  }
  return response.json();
}

export function EventList() {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const queryClient = useQueryClient();

  const { data: events, isLoading, error, refetch } = useQuery({
    queryKey: ["events"],
    queryFn: fetchEvents,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const filteredEvents = useMemo(() => {
    if (!events) return [];
    if (!searchQuery.trim()) return events;

    const query = searchQuery.toLowerCase();
    return events.filter(
      (event) =>
        event.title.toLowerCase().includes(query) ||
        event.description.toLowerCase().includes(query)
    );
  }, [events, searchQuery]);

  const deleteMutation = useMutation({
    mutationFn: async (eventId: number) => {
      const response = await fetch(`/api/events/${eventId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete event");
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success("Event deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["events"] });
      setDeleteDialogOpen(false);
      setEventToDelete(null);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete event");
    },
  });

  const handleDeleteClick = (eventId: number) => {
    setEventToDelete(eventId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (eventToDelete) {
      deleteMutation.mutate(eventToDelete);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32 mt-2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4 mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <ErrorRetry
        error={error as Error}
        onRetry={() => refetch()}
        title="Failed to load events"
        description="Unable to fetch events. Please check your connection and try again."
      />
    );
  }

  if (!events || events.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground py-8">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">No events yet</p>
            <p className="text-sm mb-4">Create your first event to get started!</p>
            <Link href="/events/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Event
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <EventSearch onSearch={setSearchQuery} />

      {filteredEvents.length === 0 && searchQuery ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground py-8">
              <p className="text-lg font-medium">No events found</p>
              <p className="text-sm">Try adjusting your search query</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        filteredEvents.map((event) => {
          const eventDate = new Date(event.date);
          const attendeeCount = event.attendees?.length || 0;
          const isFull = attendeeCount >= event.capacity;
          const isPast = isPastEvent(event.date);

          return (
            <Card
              key={event.id}
              className={`${isFull ? "opacity-75" : ""} ${isPast ? "border-muted" : ""}`}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl flex items-center gap-2">
                      {event.title}
                      {isPast && (
                        <span className="text-xs font-normal text-muted-foreground bg-muted px-2 py-1 rounded">
                          Past
                        </span>
                      )}
                    </CardTitle>
                    <CardDescription className="mt-1 flex items-center gap-4 flex-wrap">
                      <span className="flex items-center gap-1" aria-label="Event date and time">
                        <Calendar className="h-4 w-4" aria-hidden="true" />
                        {formatEventDate(eventDate)} at {formatEventTime(eventDate)}
                      </span>
                      <span
                        className={`flex items-center gap-1 ${isFull ? "text-destructive" : ""}`}
                        aria-label={`${attendeeCount} out of ${event.capacity} attendees registered`}
                      >
                        <Users className="h-4 w-4" aria-hidden="true" />
                        {attendeeCount} / {event.capacity}
                        {isFull && " (Full)"}
                      </span>
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/events/${event.id}/edit`}>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Edit ${event.title}`}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteClick(event.id)}
                      aria-label={`Delete ${event.title}`}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-2">
                  <FileText
                    className="h-4 w-4 mt-0.5 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <p className="text-sm text-muted-foreground">{event.description}</p>
                </div>
              </CardContent>
            </Card>
          );
        })
      )}

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Event</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this event? This will also delete all registered attendees. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setEventToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

