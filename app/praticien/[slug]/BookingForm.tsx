"use client";
import { useState } from "react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { formatDateTime } from "@/lib/utils";

interface Service {
  id: string;
  name: string;
  price: number;
}

interface TimeSlot {
  id: string;
  dateTime: Date | string;
  isBooked: boolean;
}

interface Props {
  practitioner: {
    id: string;
    sessionMode: string;
    services: Service[];
    timeSlots: TimeSlot[];
  };
}

export default function BookingForm({ practitioner }: Props) {
  const [clientFirstName, setClientFirstName] = useState("");
  const [clientLastName, setClientLastName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [sessionMode, setSessionMode] = useState(
    practitioner.sessionMode === "BOTH" ? "" : practitioner.sessionMode
  );
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [bookedSlots, setBookedSlots] = useState<Set<string>>(
    new Set(practitioner.timeSlots.filter((s) => s.isBooked).map((s) => s.id))
  );

  const availableSlots = practitioner.timeSlots.filter((s) => !bookedSlots.has(s.id));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot || !selectedService || !sessionMode) {
      setError("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    setLoading(true);
    setError("");

    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        practitionerId: practitioner.id,
        serviceId: selectedService,
        timeSlotId: selectedSlot,
        clientFirstName,
        clientLastName,
        clientPhone,
        sessionMode,
      }),
    });

    setLoading(false);

    if (res.ok) {
      setBookedSlots((prev) => new Set([...prev, selectedSlot]));
      setSuccess(true);
    } else {
      const data = await res.json();
      setError(data.error || "Erreur lors de la réservation.");
    }
  };

  if (success) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🌸</div>
        <h3 className="text-2xl font-bold text-mauve-900 mb-2" style={{ fontFamily: "var(--font-heading)" }}>
          Réservation confirmée !
        </h3>
        <p className="text-mauve-700">
          Votre praticien va vous contacter au <strong>{clientPhone}</strong> pour confirmer le rendez-vous.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Client info */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Input
          label="Prénom"
          value={clientFirstName}
          onChange={(e) => setClientFirstName(e.target.value)}
          placeholder="Marie"
          required
        />
        <Input
          label="Nom"
          value={clientLastName}
          onChange={(e) => setClientLastName(e.target.value)}
          placeholder="Dupont"
          required
        />
      </div>

      <Input
        label="Numéro de téléphone"
        type="tel"
        value={clientPhone}
        onChange={(e) => setClientPhone(e.target.value)}
        placeholder="06 12 34 56 78"
        required
        hint="Le praticien vous contactera sur ce numéro"
      />

      {/* Service */}
      <div>
        <label className="text-sm font-semibold text-mauve-900 block mb-2">
          Prestation souhaitée <span className="text-rose-400">*</span>
        </label>
        <div className="grid sm:grid-cols-2 gap-3">
          {practitioner.services.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setSelectedService(s.id)}
              className={`p-4 rounded-xl border-2 text-left transition-all
                ${selectedService === s.id
                  ? "border-mauve-400 bg-mauve-50"
                  : "border-mauve-100 hover:border-mauve-200"
                }`}
            >
              <div className="font-semibold text-mauve-900">{s.name}</div>
              <div className="text-mauve-600 font-bold">{s.price}€</div>
            </button>
          ))}
        </div>
      </div>

      {/* Mode présentiel/distance */}
      {practitioner.sessionMode === "BOTH" && (
        <div>
          <label className="text-sm font-semibold text-mauve-900 block mb-2">
            Mode de séance <span className="text-rose-400">*</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setSessionMode("PRESENTIEL")}
              className={`p-4 rounded-xl border-2 text-center transition-all
                ${sessionMode === "PRESENTIEL"
                  ? "border-mauve-400 bg-mauve-50"
                  : "border-mauve-100 hover:border-mauve-200"
                }`}
            >
              <div className="text-2xl mb-1">🏠</div>
              <div className="font-semibold text-mauve-800">En présentiel</div>
            </button>
            <button
              type="button"
              onClick={() => setSessionMode("DISTANCE")}
              className={`p-4 rounded-xl border-2 text-center transition-all
                ${sessionMode === "DISTANCE"
                  ? "border-mauve-400 bg-mauve-50"
                  : "border-mauve-100 hover:border-mauve-200"
                }`}
            >
              <div className="text-2xl mb-1">💻</div>
              <div className="font-semibold text-mauve-800">À distance</div>
            </button>
          </div>
        </div>
      )}

      {/* Time slots */}
      <div>
        <label className="text-sm font-semibold text-mauve-900 block mb-2">
          Choisissez un créneau <span className="text-rose-400">*</span>
        </label>

        {availableSlots.length === 0 ? (
          <div className="text-center py-8 text-mauve-600 bg-mauve-50 rounded-2xl">
            <div className="text-3xl mb-2">😔</div>
            <p>Aucun créneau disponible pour le moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-72 overflow-y-auto pr-1">
            {practitioner.timeSlots.map((slot) => {
              const isBooked = bookedSlots.has(slot.id);
              return (
                <button
                  key={slot.id}
                  type="button"
                  disabled={isBooked}
                  onClick={() => !isBooked && setSelectedSlot(slot.id)}
                  className={`p-3 rounded-xl text-sm font-semibold transition-all border-2
                    ${isBooked
                      ? "border-mauve-100 bg-mauve-50 text-mauve-300 cursor-not-allowed line-through"
                      : selectedSlot === slot.id
                        ? "border-mauve-400 bg-mauve-50 text-mauve-800 shadow-md"
                        : "border-mauve-100 hover:border-mauve-300 hover:bg-mauve-50 text-mauve-800"
                    }`}
                >
                  {formatDateTime(slot.dateTime)}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <Button
        type="submit"
        loading={loading}
        disabled={!selectedSlot || !selectedService || !sessionMode || !clientFirstName || !clientLastName || !clientPhone}
        className="w-full"
        size="lg"
      >
        Confirmer la réservation ✨
      </Button>
    </form>
  );
}
