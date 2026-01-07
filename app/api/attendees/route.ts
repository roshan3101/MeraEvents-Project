import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { attendeeSchema } from "@/lib/validations";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("eventId");

    if (!eventId) {
      return NextResponse.json(
        { error: "Event ID is required" },
        { status: 400 }
      );
    }

    const attendees = await prisma.attendee.findMany({
      where: {
        eventId: parseInt(eventId),
      },
      include: {
        event: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(attendees);
  } catch (error) {
    console.error("Error fetching attendees:", error);
    return NextResponse.json(
      { error: "Failed to fetch attendees" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = attendeeSchema.parse(body);

    // Check if event exists and has capacity
    const event = await prisma.event.findUnique({
      where: { id: validatedData.eventId },
      include: { attendees: true },
    });

    if (!event) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      );
    }

    if (event.attendees.length >= event.capacity) {
      return NextResponse.json(
        { error: "Event is at full capacity" },
        { status: 400 }
      );
    }

    // Check if email is already registered for this event
    const existingAttendee = await prisma.attendee.findFirst({
      where: {
        email: validatedData.email,
        eventId: validatedData.eventId,
      },
    });

    if (existingAttendee) {
      return NextResponse.json(
        { error: "Email is already registered for this event" },
        { status: 400 }
      );
    }

    const attendee = await prisma.attendee.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        eventId: validatedData.eventId,
      },
      include: {
        event: true,
      },
    });

    return NextResponse.json(attendee, { status: 201 });
  } catch (error) {
    console.error("Error creating attendee:", error);
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation failed", details: error },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create attendee" },
      { status: 500 }
    );
  }
}

