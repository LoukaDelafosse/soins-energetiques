import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  const practitioner = await prisma.practitioner.findUnique({
    where: { id: session.user.id },
    include: {
      services: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!practitioner) {
    return NextResponse.json({ error: "Praticien introuvable." }, { status: 404 });
  }

  const { password, ...data } = practitioner;
  return NextResponse.json(data);
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  const body = await req.json();
  const {
    firstName,
    lastName,
    city,
    bio,
    sessionMode,
    sessionDuration,
    photoUrl,
  } = body;

  const updated = await prisma.practitioner.update({
    where: { id: session.user.id },
    data: {
      firstName,
      lastName,
      city,
      bio,
      sessionMode,
      sessionDuration: parseInt(sessionDuration),
      ...(photoUrl !== undefined && { photoUrl }),
    },
    include: { services: true },
  });

  const { password, ...data } = updated;
  return NextResponse.json(data);
}
