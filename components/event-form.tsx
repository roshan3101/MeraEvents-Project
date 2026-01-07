"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { eventSchema, type EventFormData } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface EventFormProps {
  eventId?: number;
  initialData?: {
    title: string;
    date: string;
    description: string;
    capacity: number;
  };
}

export function EventForm({ eventId, initialData }: EventFormProps = {}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isEditMode = !!eventId;

  const form = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: initialData || {
      title: "",
      date: "",
      description: "",
      capacity: 1,
    },
    mode: "onChange",
  });

  const mutation = useMutation({
    mutationFn: async (data: EventFormData) => {
      const url = isEditMode ? `/api/events/${eventId}` : "/api/events";
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
        throw new Error(error.error || `Failed to ${isEditMode ? "update" : "create"} event`);
      }

      return response.json();
    },
    onMutate: async (newEvent) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["events"] });

      // Snapshot previous value
      const previousEvents = queryClient.getQueryData(["events"]);

      // Optimistically update
      queryClient.setQueryData(["events"], (old: any) => {
        const optimisticEvent = {
          id: Date.now(), // Temporary ID
          ...newEvent,
          date: new Date(newEvent.date),
          attendees: [],
        };
        return old ? [...old, optimisticEvent] : [optimisticEvent];
      });

      return { previousEvents };
    },
    onError: (err, newEvent, context) => {
      // Rollback on error
      if (context?.previousEvents) {
        queryClient.setQueryData(["events"], context.previousEvents);
      }
      toast.error(err.message || "Failed to create event");
    },
    onSuccess: () => {
      toast.success(`Event ${isEditMode ? "updated" : "created"} successfully!`);
      queryClient.invalidateQueries({ queryKey: ["events"] });
      router.push("/");
      router.refresh();
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });

  const onSubmit = (data: EventFormData) => {
    mutation.mutate(data);
  };

  return (
    <div className="space-y-4 rounded-lg border p-6">

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="Event title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date</FormLabel>
                <FormControl>
                  <Input type="datetime-local" {...field} />
                </FormControl>
                <FormDescription>
                  Select the date and time for your event
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Event description"
                    className="resize-none"
                    rows={4}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="capacity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Capacity</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                    value={field.value}
                  />
                </FormControl>
                <FormDescription>
                  Maximum number of attendees allowed
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex gap-2">
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending
                ? isEditMode
                  ? "Updating..."
                  : "Creating..."
                : isEditMode
                ? "Update Event"
                : "Create Event"}
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

