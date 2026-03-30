import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendBookingNotification } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      practitionerId,
      serviceId,
      timeSlotId,
      clientFirstName,
      clientLastName,
      clientPhone,
      sessionMode,
    } = body;

    // Check slot is still available
    const slot = await prisma.timeSlot.findUnique({ where: { id: timeSlotId } });
    if (!slot || slot.isBooked) {
      return NextResponse.json(
        { error: "Ce créneau n'est plus disponible." },
        { status: 409 }
      );
    }

    // Create booking and mark slot as booked in a transaction
    const booking = await prisma.$transaction(async (tx) => {
      const b = await tx.booking.create({
        data: {
          practitionerId,
          serviceId,
          timeSlotId,
          clientFirstName,
          clientLastName,
          clientPhone,
          sessionMode,
        },
        include: {
          service: true,
          practitioner: true,
          timeSlot: true,
        },
      });

      await tx.timeSlot.update({
        where: { id: timeSlotId },
        data: { isBooked: true },
      });

      return b;
    });

    // Send email notification
    await sendBookingNotification({
      practitionerEmail: booking.practitioner.email,
      practitionerName: `${booking.practitioner.firstName} ${booking.practitioner.lastName}`,
      clientFirstName,
      clientLastName,
      clientPhone,
      serviceName: booking.service.name,
      servicePrice: booking.service.price,
      dateTime: booking.timeSlot.dateTime,
      sessionMode,
    });

    return NextResponse.json({ id: booking.id });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erreur lors de la réservation." },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const practitionerId = searchParams.get("practitionerId");

  if (!practitionerId) {
    return NextResponse.json({ error: "practitionerId requis." }, { status: 400 });
  }

  const bookings = await prisma.booking.findMany({
    where: { practitionerId },
    include: { service: true, timeSlot: true },
    orderBy: { timeSlot: { dateTime: "asc" } },
  });

  return NextResponse.json(bookings);
}
