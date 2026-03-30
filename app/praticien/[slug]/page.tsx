import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import BookingForm from "./BookingForm";
import Image from "next/image";
import { SESSION_MODE_LABELS, formatPrice } from "@/lib/utils";
import Badge from "@/components/ui/Badge";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const practitioner = await prisma.practitioner.findUnique({ where: { slug } });
  if (!practitioner) return { title: "Praticien introuvable" };
  return {
    title: `${practitioner.firstName} ${practitioner.lastName} — Soins Énergétiques`,
    description: practitioner.bio,
  };
}

export default async function PraticienPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const practitioner = await prisma.practitioner.findUnique({
    where: { slug },
    include: {
      services: { orderBy: { createdAt: "asc" } },
      timeSlots: {
        where: { dateTime: { gte: new Date() } },
        orderBy: { dateTime: "asc" },
      },
    },
  });

  if (!practitioner || practitioner.subscriptionStatus !== "active") {
    notFound();
  }

  const modeLabel = SESSION_MODE_LABELS[practitioner.sessionMode] || practitioner.sessionMode;

  return (
    <div className="min-h-screen bg-gradient-to-b from-mauve-50 to-gold-50">
      {/* Header */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-mauve-100 px-6 py-4">
        <a href="/" className="flex items-center gap-2 w-fit">
          <span className="text-2xl">✨</span>
          <span className="font-bold text-mauve-900 text-xl" style={{ fontFamily: "var(--font-heading)" }}>
            Soins Énergétiques
          </span>
        </a>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* Profile Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-mauve-100 overflow-hidden mb-8">
          {/* Banner */}
          <div className="h-24 bg-gradient-to-r from-mauve-300 via-gold-300 to-rose-300" />

          <div className="px-8 pb-8">
            {/* Avatar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-12 mb-6">
              <div className="w-24 h-24 rounded-2xl border-4 border-white shadow-lg overflow-hidden bg-mauve-100 flex-shrink-0">
                {practitioner.photoUrl ? (
                  <Image
                    src={practitioner.photoUrl}
                    alt={`${practitioner.firstName} ${practitioner.lastName}`}
                    width={96}
                    height={96}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl">🧘</div>
                )}
              </div>
              <div className="pb-2">
                <h1 className="text-3xl font-bold text-mauve-900" style={{ fontFamily: "var(--font-heading)" }}>
                  {practitioner.firstName} {practitioner.lastName}
                </h1>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge variant="mauve">📍 {practitioner.city}</Badge>
                  <Badge variant="rose">
                    {practitioner.sessionMode === "BOTH" ? "🌐 Présentiel & Distance" :
                     practitioner.sessionMode === "PRESENTIEL" ? "🏠 En présentiel" : "💻 À distance"}
                  </Badge>
                  <Badge variant="green">⏱ {practitioner.sessionDuration} min</Badge>
                </div>
              </div>
            </div>

            {/* Bio */}
            {practitioner.bio && (
              <div className="bg-mauve-50 rounded-2xl p-6 mb-6">
                <h2 className="font-bold text-mauve-900 mb-2 text-lg">À propos</h2>
                <p className="text-mauve-800 leading-relaxed whitespace-pre-line">{practitioner.bio}</p>
              </div>
            )}

            {/* Services */}
            <div>
              <h2 className="text-xl font-bold text-mauve-900 mb-4" style={{ fontFamily: "var(--font-heading)" }}>
                🌟 Mes prestations
              </h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {practitioner.services.map((service) => (
                  <div
                    key={service.id}
                    className="flex justify-between items-center bg-gradient-to-r from-mauve-50 to-gold-50 rounded-xl p-4 border border-mauve-100"
                  >
                    <span className="font-semibold text-mauve-900">{service.name}</span>
                    <span className="text-mauve-700 font-bold text-lg">{formatPrice(service.price)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Booking Section */}
        <div className="bg-white rounded-3xl shadow-xl border border-mauve-100 p-8">
          <h2 className="text-2xl font-bold text-mauve-900 mb-6 text-center" style={{ fontFamily: "var(--font-heading)" }}>
            📅 Prendre rendez-vous
          </h2>

          <BookingForm
            practitioner={{
              id: practitioner.id,
              sessionMode: practitioner.sessionMode,
              services: practitioner.services,
              timeSlots: practitioner.timeSlots,
            }}
          />
        </div>
      </div>
    </div>
  );
}
