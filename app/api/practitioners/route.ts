import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { generateSlug } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      email,
      password,
      firstName,
      lastName,
      city,
      bio,
      sessionMode,
      sessionDuration,
      services,
      timeSlots,
    } = body;

    // Check if email exists
    const existing = await prisma.practitioner.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "Cet email est déjà utilisé." },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // Generate unique slug
    let slug = generateSlug(firstName, lastName, city);
    const slugExists = await prisma.practitioner.findUnique({ where: { slug } });
    if (slugExists) {
      slug = `${slug}-${Date.now()}`;
    }

    const practitioner = await prisma.practitioner.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        city,
        bio: bio || "",
        sessionMode,
        sessionDuration: parseInt(sessionDuration) || 60,
        slug,
        services: {
          create: services?.map((s: { name: string; price: number }) => ({
            name: s.name,
            price: parseFloat(s.price.toString()),
          })) || [],
        },
      },
    });

    // Create time slots if provided
    if (timeSlots && timeSlots.length > 0) {
      await prisma.timeSlot.createMany({
        data: timeSlots.map((dt: string) => ({
          practitionerId: practitioner.id,
          dateTime: new Date(dt),
          isBooked: false,
        })),
      });
    }

    return NextResponse.json({ id: practitioner.id, slug: practitioner.slug });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erreur lors de la création du compte." },
      { status: 500 }
    );
  }
}
