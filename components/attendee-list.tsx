"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Users, Mail, Edit, Trash2, Search, Plus } from "lucide-react";
import { useState, useMemo } from "react";
import type { EventWithAttendees, AttendeeWithEvent } from "@/lib/types";
import { toast } from "sonner";
import Link from "next/link";
import { ErrorRetry } from "@/components/error-retry";
import { formatEventDate } from "@/lib/date-utils";

async function fetchAttendees(eventId: number): Promise<AttendeeWithEvent[]> {
  const response = await fetch(`/api/attendees?eventId=${eventId}`);
  if (!response.ok) {
    throw new Error("Failed to fetch attendees");
  }
  return response.json();
}

interface AttendeeListProps {
  events: EventWithAttendees[];
}

export function AttendeeList({ events }: AttendeeListProps) {
  const [selectedEventId, setSelectedEventId] = useState<number | null>(
    events[0]?.id || null
  );
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [attendeeToDelete, setAttendeeToDelete] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const queryClient = useQueryClient();

  const { data: attendees, isLoading, error, refetch } = useQuery({
    queryKey: ["attendees", selectedEventId],
    queryFn: () => fetchAttendees(selectedEventId!),
    enabled: selectedEventId !== null,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const filteredAttendees = useMemo(() => {
    if (!attendees) return [];
    if (!searchQuery.trim()) return attendees;

    const query = searchQuery.toLowerCase();
    return attendees.filter(
      (attendee) =>
        attendee.name.toLowerCase().includes(query) ||
        attendee.email.toLowerCase().includes(query)
    );
  }, [attendees, searchQuery]);

  const deleteMutation = useMutation({
    mutationFn: async (attendeeId: number) => {
      const response = await fetch(`/api/attendees/${attendeeId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete attendee");
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success("Attendee deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["attendees", selectedEventId] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
      setDeleteDialogOpen(false);
      setAttendeeToDelete(null);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete attendee");
    },
  });

  const handleDeleteClick = (attendeeId: number) => {
    setAttendeeToDelete(attendeeId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (attendeeToDelete) {
      deleteMutation.mutate(attendeeToDelete);
    }
  };

  const selectedEvent = events.find((e) => e.id === selectedEventId);

  if (events.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground py-8">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">No events available</p>
            <p className="text-sm mb-4">Create an event to view attendees</p>
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Attendees
        </CardTitle>
        <CardDescription>
          View registered attendees for a specific event
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Select
          value={selectedEventId?.toString() || ""}
          onValueChange={(value) => setSelectedEventId(parseInt(value))}
          aria-label="Select an event to view attendees"
        >
          <SelectTrigger>
            <SelectValue placeholder="Select an event" />
          </SelectTrigger>
          <SelectContent>
            {events.map((event) => (
              <SelectItem key={event.id} value={event.id.toString()}>
                {event.title} - {formatEventDate(event.date)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {selectedEvent && (
          <div className="text-sm text-muted-foreground" aria-live="polite">
            {selectedEvent.attendees?.length || 0} / {selectedEvent.capacity} registered
          </div>
        )}

        {selectedEventId && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search attendees..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
              aria-label="Search attendees"
            />
          </div>
        )}

        {isLoading && (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 p-3 border rounded-lg">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                </div>
              </div>
            ))}
          </div>
        )}

        {error && (
          <ErrorRetry
            error={error as Error}
            onRetry={() => refetch()}
            title="Failed to load attendees"
            description="Unable to fetch attendees. Please check your connection and try again."
          />
        )}

        {!isLoading &&
          !error &&
          (!attendees || attendees.length === 0) &&
          selectedEventId && (
            <div className="text-center text-muted-foreground py-8">
              <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">No attendees yet</p>
              <p className="text-sm mb-4">
                No one has registered for this event yet.
              </p>
              <Link href="/attendees/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Register First Attendee
                </Button>
              </Link>
            </div>
          )}

        {!isLoading && !error && filteredAttendees.length === 0 && searchQuery && (
          <div className="text-center text-muted-foreground py-8">
            <p className="text-lg font-medium">No attendees found</p>
            <p className="text-sm">Try adjusting your search query</p>
          </div>
        )}

        {!isLoading && !error && filteredAttendees && filteredAttendees.length > 0 && (
          <div className="space-y-2" role="list" aria-label="Attendee list">
            {filteredAttendees.map((attendee) => (
              <div
                key={attendee.id}
                className="flex items-center gap-3 p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                role="listitem"
              >
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold"
                  aria-hidden="true"
                >
                  {attendee.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{attendee.name}</p>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Mail className="h-3 w-3" aria-hidden="true" />
                    {attendee.email}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link href={`/attendees/${attendee.id}/edit`}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      aria-label={`Edit ${attendee.name}`}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleDeleteClick(attendee.id)}
                    aria-label={`Delete ${attendee.name}`}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Attendee</DialogTitle>
              <DialogDescription>
                Are you sure you want to remove this attendee from the event? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setDeleteDialogOpen(false);
                  setAttendeeToDelete(null);
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
      </CardContent>
    </Card>
  );
}

