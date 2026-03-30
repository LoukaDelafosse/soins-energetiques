import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import ParametresClient from "./ParametresClient";

export default async function ParametresPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/connexion");

  const practitioner = await prisma.practitioner.findUnique({
    where: { id: session.user.id },
    include: {
      services: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!practitioner) redirect("/connexion");

  const timeSlots = await prisma.timeSlot.findMany({
    where: {
      practitionerId: session.user.id,
      isBooked: false,
      dateTime: { gte: new Date() },
    },
    orderBy: { dateTime: "asc" },
  });

  const { password, ...safeData } = practitioner;

  return (
    <ParametresClient
      initialData={safeData as any}
      initialTimeSlots={timeSlots}
    />
  );
}
