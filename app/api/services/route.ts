import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const practitionerId = searchParams.get("practitionerId");

  if (!practitionerId) {
    return NextResponse.json({ error: "practitionerId requis." }, { status: 400 });
  }

  const services = await prisma.service.findMany({
    where: { practitionerId },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(services);
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  const body = await req.json();
  const { services } = body;

  await prisma.service.deleteMany({
    where: { practitionerId: userId },
  });

  if (services && services.length > 0) {
    await prisma.service.createMany({
      data: services.map((s: { name: string; price: number }) => ({
        practitionerId: userId,
        name: s.name,
        price: parseFloat(s.price.toString()),
      })),
    });
  }

  return NextResponse.json({ success: true });
}
