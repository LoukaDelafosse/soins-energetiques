import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import Card from "@/components/ui/Card";
import { formatPrice } from "@/lib/utils";
import { startOfMonth, endOfMonth } from "date-fns";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/connexion");

  const id = session.user.id;
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  const [practitioner, upcomingBookings, monthlyBookings, todayBookings] =
    await Promise.all([
      prisma.practitioner.findUnique({
        where: { id },
        select: { firstName: true, slug: true },
      }),
      prisma.booking.findMany({
        where: { practitionerId: id, timeSlot: { dateTime: { gte: now } } },
        include: { service: true, timeSlot: true },
        orderBy: { timeSlot: { dateTime: "asc" } },
        take: 5,
      }),
      prisma.booking.findMany({
        where: {
          practitionerId: id,
          timeSlot: { dateTime: { gte: monthStart, lte: monthEnd } },
        },
        include: { service: true },
      }),
      prisma.booking.findMany({
        where: {
          practitionerId: id,
          timeSlot: {
            dateTime: {
              gte: new Date(now.setHours(0, 0, 0, 0)),
              lte: new Date(now.setHours(23, 59, 59, 999)),
            },
          },
        },
      }),
    ]);

  const monthlyRevenue = monthlyBookings.reduce((sum, b) => sum + b.service.price, 0);
  const availableSlots = await prisma.timeSlot.count({
    where: { practitionerId: id, isBooked: false, dateTime: { gte: new Date() } },
  });

  const formatDate = (d: Date | string) =>
    new Intl.DateTimeFormat("fr-FR", {
      weekday: "short",
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(d));

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-mauve-900" style={{ fontFamily: "var(--font-heading)" }}>
            Bonjour, {practitioner?.firstName} 🌸
          </h1>
          <p className="text-mauve-600 mt-1">Voici un aperçu de votre activité</p>
        </div>
        <Link
          href={`/praticien/${practitioner?.slug}`}
          target="_blank"
          className="bg-mauve-500 hover:bg-mauve-600 text-white font-semibold px-4 py-2 rounded-xl text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2"
        >
          <span>👁</span>
          <span className="hidden sm:block">Ma fiche publique</span>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Séances aujourd&apos;hui",
            value: todayBookings.length,
            icon: "📅",
            color: "from-mauve-100 to-mauve-50",
            textColor: "text-mauve-800",
          },
          {
            label: "Séances ce mois",
            value: monthlyBookings.length,
            icon: "📊",
            color: "from-gold-100 to-gold-50",
            textColor: "text-orange-800",
          },
          {
            label: "Revenus du mois",
            value: formatPrice(monthlyRevenue),
            icon: "💰",
            color: "from-rose-100 to-rose-50",
            textColor: "text-rose-800",
          },
          {
            label: "Créneaux disponibles",
            value: availableSlots,
            icon: "🗓",
            color: "from-gold-100 to-lime-50",
            textColor: "text-gold-700",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className={`bg-gradient-to-br ${stat.color} rounded-2xl p-5 border border-white`}
          >
            <div className="text-3xl mb-2">{stat.icon}</div>
            <div className={`text-2xl font-bold ${stat.textColor}`}>{stat.value}</div>
            <div
              className="text-xs text-mauve-600 mt-1"
              dangerouslySetInnerHTML={{ __html: stat.label }}
            />
          </div>
        ))}
      </div>

      {/* Upcoming bookings */}
      <Card>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-mauve-900" style={{ fontFamily: "var(--font-heading)" }}>
            Prochaines réservations
          </h2>
          <Link
            href="/dashboard/reservations"
            className="text-mauve-600 hover:text-mauve-700 text-sm font-semibold"
          >
            Voir tout →
          </Link>
        </div>

        {upcomingBookings.length === 0 ? (
          <div className="text-center py-10 text-mauve-400">
            <div className="text-4xl mb-3">🗓</div>
            <p>Aucune réservation à venir pour le moment.</p>
            <p className="text-sm mt-1">
              Partagez votre{" "}
              <Link href={`/praticien/${practitioner?.slug}`} className="text-mauve-500 underline" target="_blank">
                fiche publique
              </Link>{" "}
              pour recevoir des réservations.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingBookings.map((booking) => (
              <div
                key={booking.id}
                className="flex items-center justify-between p-4 bg-mauve-50/60 rounded-xl border border-mauve-100"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-mauve-200 flex items-center justify-center text-mauve-800 font-bold text-sm">
                    {booking.clientFirstName[0]}{booking.clientLastName[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-mauve-900">
                      {booking.clientFirstName} {booking.clientLastName}
                    </p>
                    <p className="text-xs text-mauve-600">{booking.service.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-mauve-700">
                    {formatDate(booking.timeSlot.dateTime)}
                  </p>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full
                    ${booking.sessionMode === "DISTANCE"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-rose-100 text-rose-700"
                    }`}>
                    {booking.sessionMode === "DISTANCE" ? "💻 Distance" : "🏠 Présentiel"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
