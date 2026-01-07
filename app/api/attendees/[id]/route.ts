import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { attendeeSchema } from "@/lib/validations";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const attendeeId = parseInt(id);

    if (isNaN(attendeeId)) {
      return NextResponse.json(
        { error: "Invalid attendee ID" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validatedData = attendeeSchema.parse(body);

    // Check if event exists
    const event = await prisma.event.findUnique({
      where: { id: validatedData.eventId },
    });

    if (!event) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      );
    }

    // Check if email is already registered for this event (excluding current attendee)
    const existingAttendee = await prisma.attendee.findFirst({
      where: {
        email: validatedData.email,
        eventId: validatedData.eventId,
        NOT: { id: attendeeId },
      },
    });

    if (existingAttendee) {
      return NextResponse.json(
        { error: "Email is already registered for this event" },
        { status: 400 }
      );
    }

    const attendee = await prisma.attendee.update({
      where: { id: attendeeId },
      data: {
        name: validatedData.name,
        email: validatedData.email,
        eventId: validatedData.eventId,
      },
      include: {
        event: true,
      },
    });

    return NextResponse.json(attendee);
  } catch (error) {
    console.error("Error updating attendee:", error);
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation failed", details: error },
        { status: 400 }
      );
    }
    if (error instanceof Error && error.message.includes("Record to update does not exist")) {
      return NextResponse.json(
        { error: "Attendee not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update attendee" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const attendeeId = parseInt(id);

    if (isNaN(attendeeId)) {
      return NextResponse.json(
        { error: "Invalid attendee ID" },
        { status: 400 }
      );
    }

    await prisma.attendee.delete({
      where: { id: attendeeId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting attendee:", error);
    if (error instanceof Error && error.message.includes("Record to delete does not exist")) {
      return NextResponse.json(
        { error: "Attendee not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: "Failed to delete attendee" },
      { status: 500 }
    );
  }
}

