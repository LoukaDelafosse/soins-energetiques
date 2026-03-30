import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { formatDateTime, formatPrice } from "@/lib/utils";

export default async function ReservationsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/connexion");

  const bookings = await prisma.booking.findMany({
    where: { practitionerId: session.user.id },
    include: { service: true, timeSlot: true },
    orderBy: { timeSlot: { dateTime: "desc" } },
  });

  const upcoming = bookings.filter((b) => new Date(b.timeSlot.dateTime) >= new Date());
  const past = bookings.filter((b) => new Date(b.timeSlot.dateTime) < new Date());

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-mauve-900" style={{ fontFamily: "var(--font-heading)" }}>
          Mes réservations
        </h1>
        <p className="text-mauve-600 mt-1">{bookings.length} réservation(s) au total</p>
      </div>

      {/* Upcoming */}
      <Card>
        <h2 className="text-xl font-bold text-mauve-900 mb-5 flex items-center gap-2" style={{ fontFamily: "var(--font-heading)" }}>
          <span>🔜</span> À venir ({upcoming.length})
        </h2>

        {upcoming.length === 0 ? (
          <p className="text-center text-mauve-400 py-8">Aucune réservation à venir.</p>
        ) : (
          <div className="space-y-3">
            {upcoming.map((b) => (
              <BookingRow key={b.id} booking={b} />
            ))}
          </div>
        )}
      </Card>

      {/* Past */}
      {past.length > 0 && (
        <Card>
          <h2 className="text-xl font-bold text-mauve-900 mb-5 flex items-center gap-2" style={{ fontFamily: "var(--font-heading)" }}>
            <span>🕰</span> Passées ({past.length})
          </h2>
          <div className="space-y-3">
            {past.map((b) => (
              <BookingRow key={b.id} booking={b} past />
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

function BookingRow({
  booking,
  past = false,
}: {
  booking: any;
  past?: boolean;
}) {
  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border transition-all
        ${past ? "bg-mauve-50 border-mauve-100 opacity-70" : "bg-mauve-50/60 border-mauve-100 hover:border-mauve-200"}`}
    >
      <div className="flex items-center gap-4">
        <div
          className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-sm flex-shrink-0
            ${past ? "bg-stone-200 text-mauve-700" : "bg-mauve-200 text-mauve-800"}`}
        >
          {booking.clientFirstName[0]}{booking.clientLastName[0]}
        </div>
        <div>
          <p className="font-bold text-mauve-900">
            {booking.clientFirstName} {booking.clientLastName}
          </p>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            <a
              href={`tel:${booking.clientPhone}`}
              className="text-sm text-mauve-600 hover:text-mauve-700 font-medium flex items-center gap-1"
            >
              📞 {booking.clientPhone}
            </a>
            <Badge variant={booking.sessionMode === "DISTANCE" ? "blue" : "rose"}>
              {booking.sessionMode === "DISTANCE" ? "💻 À distance" : "🏠 Présentiel"}
            </Badge>
          </div>
        </div>
      </div>

      <div className="sm:text-right flex sm:flex-col flex-row sm:items-end items-center gap-3 sm:gap-1">
        <p className="font-bold text-mauve-800">{booking.service.name}</p>
        <p className="text-mauve-600 font-semibold">{formatPrice(booking.service.price)}</p>
        <p className="text-sm text-mauve-600">{formatDateTime(booking.timeSlot.dateTime)}</p>
      </div>
    </div>
  );
}
