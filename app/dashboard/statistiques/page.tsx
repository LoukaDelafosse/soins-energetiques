import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import Card from "@/components/ui/Card";
import { formatPrice } from "@/lib/utils";
import { startOfMonth, endOfMonth, format, eachDayOfInterval, startOfDay, endOfDay } from "date-fns";
import { fr } from "date-fns/locale";
import StatsChart from "@/components/dashboard/StatsChart";

export default async function StatistiquesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/connexion");

  const id = session.user.id;
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  const [monthlyBookings, allBookings] = await Promise.all([
    prisma.booking.findMany({
      where: {
        practitionerId: id,
        timeSlot: { dateTime: { gte: monthStart, lte: monthEnd } },
      },
      include: { service: true, timeSlot: true },
    }),
    prisma.booking.findMany({
      where: { practitionerId: id },
      include: { service: true },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  const monthlyRevenue = monthlyBookings.reduce((sum, b) => sum + b.service.price, 0);

  // Stats per day this month
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const dailyStats = days.map((day) => {
    const dayBookings = monthlyBookings.filter((b) => {
      const d = new Date(b.timeSlot.dateTime);
      return d >= startOfDay(day) && d <= endOfDay(day);
    });
    return {
      label: format(day, "d MMM", { locale: fr }),
      count: dayBookings.length,
      revenue: dayBookings.reduce((sum, b) => sum + b.service.price, 0),
    };
  });

  // Revenue by service
  const serviceStats = allBookings.reduce((acc, b) => {
    const key = b.service.name;
    if (!acc[key]) acc[key] = { count: 0, revenue: 0 };
    acc[key].count += 1;
    acc[key].revenue += b.service.price;
    return acc;
  }, {} as Record<string, { count: number; revenue: number }>);

  const serviceStatsArray = Object.entries(serviceStats).map(([name, stats]) => ({
    name,
    ...stats,
  })).sort((a, b) => b.revenue - a.revenue);

  const totalRevenue = allBookings.reduce((sum, b) => sum + b.service.price, 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-mauve-900" style={{ fontFamily: "var(--font-heading)" }}>
          Statistiques
        </h1>
        <p className="text-mauve-600 mt-1">
          {format(now, "MMMM yyyy", { locale: fr })}
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Séances ce mois",
            value: monthlyBookings.length,
            icon: "📅",
            color: "from-mauve-100 to-mauve-50",
            textColor: "text-mauve-800",
          },
          {
            label: "Revenus ce mois",
            value: formatPrice(monthlyRevenue),
            icon: "💰",
            color: "from-gold-100 to-gold-50",
            textColor: "text-orange-800",
          },
          {
            label: "Total séances",
            value: allBookings.length,
            icon: "🌟",
            color: "from-rose-100 to-rose-50",
            textColor: "text-rose-800",
          },
          {
            label: "Revenu total",
            value: formatPrice(totalRevenue),
            icon: "✨",
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
            <div className="text-xs text-mauve-600 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Daily chart */}
      <Card>
        <h2 className="text-xl font-bold text-mauve-900 mb-6" style={{ fontFamily: "var(--font-heading)" }}>
          📈 Séances par jour — {format(now, "MMMM", { locale: fr })}
        </h2>
        <StatsChart data={dailyStats} />
      </Card>

      {/* Services breakdown */}
      <Card>
        <h2 className="text-xl font-bold text-mauve-900 mb-5" style={{ fontFamily: "var(--font-heading)" }}>
          🌟 Revenus par prestation
        </h2>

        {serviceStatsArray.length === 0 ? (
          <p className="text-center text-mauve-400 py-8">Aucune donnée disponible.</p>
        ) : (
          <div className="space-y-4">
            {serviceStatsArray.map((s) => {
              const pct = totalRevenue > 0 ? (s.revenue / totalRevenue) * 100 : 0;
              return (
                <div key={s.name}>
                  <div className="flex justify-between items-center mb-1">
                    <div>
                      <span className="font-semibold text-mauve-900">{s.name}</span>
                      <span className="text-mauve-400 text-sm ml-2">({s.count} séance{s.count > 1 ? "s" : ""})</span>
                    </div>
                    <span className="font-bold text-mauve-700">{formatPrice(s.revenue)}</span>
                  </div>
                  <div className="h-3 bg-mauve-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-mauve-400 to-gold-400 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
