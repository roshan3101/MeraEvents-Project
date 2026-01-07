"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { attendeeSchema, type AttendeeFormData } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import type { EventWithAttendees } from "@/lib/types";

interface AttendeeFormProps {
  events: EventWithAttendees[];
  attendeeId?: number;
  initialData?: {
    name: string;
    email: string;
    eventId: number;
  };
}

export function AttendeeForm({ events, attendeeId, initialData }: AttendeeFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isEditMode = !!attendeeId;

  const form = useForm<AttendeeFormData>({
    resolver: zodResolver(attendeeSchema),
    defaultValues: initialData || {
      name: "",
      email: "",
      eventId: events[0]?.id || 0,
    },
    mode: "onChange",
  });

  const mutation = useMutation({
    mutationFn: async (data: AttendeeFormData) => {
      const url = isEditMode ? `/api/attendees/${attendeeId}` : "/api/attendees";
      const method = isEditMode ? "PUT" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `Failed to ${isEditMode ? "update" : "register"} attendee`);
      }

      return response.json();
    },
    onMutate: async (newAttendee) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: ["attendees", newAttendee.eventId],
      });
      await queryClient.cancelQueries({ queryKey: ["events"] });

      // Snapshot previous values
      const previousAttendees = queryClient.getQueryData([
        "attendees",
        newAttendee.eventId,
      ]);
      const previousEvents = queryClient.getQueryData(["events"]);

      // Optimistically update attendees
      queryClient.setQueryData(
        ["attendees", newAttendee.eventId],
        (old: any) => {
          const optimisticAttendee = {
            id: Date.now(),
            ...newAttendee,
            event: events.find((e) => e.id === newAttendee.eventId),
          };
          return old ? [...old, optimisticAttendee] : [optimisticAttendee];
        }
      );

      // Optimistically update event attendee count
      queryClient.setQueryData(["events"], (old: any) => {
        return old?.map((event: EventWithAttendees) => {
          if (event.id === newAttendee.eventId) {
            return {
              ...event,
              attendees: [
                ...event.attendees,
                {
                  id: Date.now(),
                  name: newAttendee.name,
                  email: newAttendee.email,
                  eventId: newAttendee.eventId,
                },
              ],
            };
          }
          return event;
        });
      });

      return { previousAttendees, previousEvents };
    },
    onError: (err, newAttendee, context) => {
      // Rollback on error
      if (context?.previousAttendees) {
        queryClient.setQueryData(
          ["attendees", newAttendee.eventId],
          context.previousAttendees
        );
      }
      if (context?.previousEvents) {
        queryClient.setQueryData(["events"], context.previousEvents);
      }
      toast.error(err.message || "Failed to register attendee");
    },
    onSuccess: () => {
      toast.success("Successfully registered for event!");
      queryClient.invalidateQueries({ queryKey: ["events"] });
      router.push("/");
      router.refresh();
    },
    onSettled: (data) => {
      if (data) {
        queryClient.invalidateQueries({
          queryKey: ["attendees", data.eventId],
        });
        queryClient.invalidateQueries({ queryKey: ["events"] });
      }
    },
  });

  const onSubmit = (data: AttendeeFormData) => {
    mutation.mutate(data);
  };

  if (events.length === 0) {
    return (
      <div className="rounded-lg border p-4 text-center text-muted-foreground">
        No events available. Create an event first.
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-lg border p-6">

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="eventId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Event</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(parseInt(value))}
                  defaultValue={field.value?.toString()}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an event" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {events.map((event) => (
                      <SelectItem key={event.id} value={event.id.toString()}>
                        {event.title} - {new Date(event.date).toLocaleDateString()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Your full name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="your.email@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex gap-2">
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending
                ? isEditMode
                  ? "Updating..."
                  : "Registering..."
                : isEditMode
                ? "Update"
                : "Register"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/")}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

