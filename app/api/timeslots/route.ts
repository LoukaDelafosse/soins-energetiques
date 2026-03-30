import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const practitionerId = searchParams.get("practitionerId");

  if (!practitionerId) {
    return NextResponse.json({ error: "practitionerId requis." }, { status: 400 });
  }

  const slots = await prisma.timeSlot.findMany({
    where: {
      practitionerId,
      dateTime: { gte: new Date() },
    },
    orderBy: { dateTime: "asc" },
  });

  return NextResponse.json(slots);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  const body = await req.json();
  const { slots } = body;

  await prisma.timeSlot.deleteMany({
    where: {
      practitionerId: userId,
      isBooked: false,
      dateTime: { gte: new Date() },
    },
  });

  if (slots && slots.length > 0) {
    await prisma.timeSlot.createMany({
      data: slots.map((dt: string) => ({
        practitionerId: userId,
        dateTime: new Date(dt),
        isBooked: false,
      })),
    });
  }

  return NextResponse.json({ success: true });
}
