import { z } from "zod";

export const eventSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title must be less than 200 characters"),
  date: z.string().min(1, "Date is required").refine(
    (date) => {
      const dateObj = new Date(date);
      return !isNaN(dateObj.getTime()) && dateObj > new Date();
    },
    { message: "Date must be a valid future date" }
  ),
  description: z.string().min(1, "Description is required").max(1000, "Description must be less than 1000 characters"),
  capacity: z.number().int().positive("Capacity must be a positive number").min(1, "Capacity must be at least 1"),
});

export const attendeeSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  email: z.string().email("Invalid email address"),
  eventId: z.number().int().positive("Event ID is required"),
});

export type EventFormData = z.infer<typeof eventSchema>;
export type AttendeeFormData = z.infer<typeof attendeeSchema>;

