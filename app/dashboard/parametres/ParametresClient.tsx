"use client";
import { useState } from "react";
import Image from "next/image";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

const DAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
const HOURS = Array.from({ length: 14 }, (_, i) => i + 7);

interface Service { id?: string; name: string; price: string | number; }
interface Slot { day: number; hour: number; }

function getSlotKey(day: number, hour: number) {
  return `${day}-${hour}`;
}

function extractSlotsFromDB(timeSlots: any[]): Set<string> {
  const set = new Set<string>();
  for (const slot of timeSlots) {
    const d = new Date(slot.dateTime);
    const jsDay = d.getDay(); // 0=Sun, 1=Mon...
    const appDay = jsDay === 0 ? 6 : jsDay - 1; // 0=Lundi, 6=Dimanche
    const hour = d.getHours();
    set.add(getSlotKey(appDay, hour));
  }
  return set;
}

function generateTimeSlots(slots: Slot[]): string[] {
  const result: string[] = [];
  const now = new Date();
  for (let week = 0; week < 8; week++) {
    for (const slot of slots) {
      const date = new Date(now);
      const currentDay = date.getDay();
      const targetDay = slot.day === 6 ? 0 : slot.day + 1;
      let daysToAdd = targetDay - currentDay;
      if (daysToAdd <= 0) daysToAdd += 7;
      date.setDate(date.getDate() + daysToAdd + week * 7);
      date.setHours(slot.hour, 0, 0, 0);
      if (date > now) result.push(date.toISOString());
    }
  }
  return result;
}

export default function ParametresClient({
  initialData,
  initialTimeSlots,
}: {
  initialData: any;
  initialTimeSlots: any[];
}) {
  const [tab, setTab] = useState<"profil" | "prestations" | "creneaux">("profil");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  // Profile state
  const [firstName, setFirstName] = useState(initialData.firstName);
  const [lastName, setLastName] = useState(initialData.lastName);
  const [city, setCity] = useState(initialData.city);
  const [bio, setBio] = useState(initialData.bio);
  const [sessionMode, setSessionMode] = useState(initialData.sessionMode);
  const [sessionDuration, setSessionDuration] = useState(String(initialData.sessionDuration));
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(initialData.photoUrl || null);

  // Services state
  const [services, setServices] = useState<Service[]>(
    initialData.services.length > 0
      ? initialData.services.map((s: any) => ({ id: s.id, name: s.name, price: String(s.price) }))
      : [{ name: "", price: "" }]
  );

  // Slots state
  const [selectedSlots, setSelectedSlots] = useState<Set<string>>(
    extractSlotsFromDB(initialTimeSlots)
  );

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const toggleSlot = (day: number, hour: number) => {
    const key = getSlotKey(day, hour);
    const next = new Set(selectedSlots);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setSelectedSlots(next);
  };

  const showSuccess = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const saveProfile = async () => {
    setSaving(true);
    setError("");
    try {
      let photoUrl = initialData.photoUrl;

      if (photoFile) {
        const formData = new FormData();
        formData.append("file", photoFile);
        const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
        if (uploadRes.ok) {
          const { url } = await uploadRes.json();
          photoUrl = url;
        }
      }

      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, city, bio, sessionMode, sessionDuration, photoUrl }),
      });

      if (!res.ok) throw new Error("Erreur de sauvegarde");
      showSuccess();
    } catch (e) {
      setError("Erreur lors de la sauvegarde.");
    } finally {
      setSaving(false);
    }
  };

  const saveServices = async () => {
    setSaving(true);
    setError("");
    try {
      const validServices = services.filter((s) => s.name.trim() && s.price);
      const res = await fetch("/api/services", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          services: validServices.map((s) => ({ name: s.name, price: parseFloat(String(s.price)) })),
        }),
      });
      if (!res.ok) throw new Error();
      showSuccess();
    } catch {
      setError("Erreur lors de la sauvegarde.");
    } finally {
      setSaving(false);
    }
  };

  const saveSlots = async () => {
    setSaving(true);
    setError("");
    try {
      const slotsArray: Slot[] = Array.from(selectedSlots).map((key) => {
        const [day, hour] = key.split("-").map(Number);
        return { day, hour };
      });
      const timeSlots = generateTimeSlots(slotsArray);

      const res = await fetch("/api/timeslots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slots: timeSlots }),
      });
      if (!res.ok) throw new Error();
      showSuccess();
    } catch {
      setError("Erreur lors de la sauvegarde.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold text-mauve-900" style={{ fontFamily: "var(--font-heading)" }}>
          Paramètres
        </h1>
        <p className="text-mauve-600 mt-1">Modifiez vos informations et paramètres</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-mauve-100 pb-0">
        {([
          { key: "profil", icon: "👤", label: "Mon profil" },
          { key: "prestations", icon: "🌟", label: "Prestations" },
          { key: "creneaux", icon: "📅", label: "Créneaux" },
        ] as const).map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all
              ${tab === t.key
                ? "border-mauve-500 text-mauve-700"
                : "border-transparent text-mauve-600 hover:text-mauve-600"
              }`}
          >
            <span>{t.icon}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* Profile tab */}
      {tab === "profil" && (
        <Card>
          <div className="space-y-5">
            <h2 className="text-xl font-bold text-mauve-900" style={{ fontFamily: "var(--font-heading)" }}>
              Informations personnelles
            </h2>

            {/* Photo */}
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-2xl overflow-hidden border-4 border-mauve-200 bg-mauve-50 flex-shrink-0 flex items-center justify-center">
                {photoPreview ? (
                  <Image src={photoPreview} alt="Photo" width={80} height={80} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl">🧘</span>
                )}
              </div>
              <label className="cursor-pointer bg-mauve-50 hover:bg-mauve-100 text-mauve-700 font-semibold px-4 py-2 rounded-xl border border-mauve-200 text-sm transition-colors">
                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                Changer la photo
              </label>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input label="Prénom" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
              <Input label="Nom" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
            </div>

            <Input label="Ville" value={city} onChange={(e) => setCity(e.target.value)} required />
            <Textarea label="Description" value={bio} onChange={(e) => setBio(e.target.value)} rows={5} />

            <div>
              <label className="text-sm font-semibold text-mauve-900 block mb-2">Mode de séance</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: "PRESENTIEL", icon: "🏠", label: "Présentiel" },
                  { value: "DISTANCE", icon: "💻", label: "À distance" },
                  { value: "BOTH", icon: "✨", label: "Les deux" },
                ].map((m) => (
                  <button
                    key={m.value}
                    type="button"
                    onClick={() => setSessionMode(m.value)}
                    className={`p-4 rounded-xl border-2 text-center transition-all
                      ${sessionMode === m.value
                        ? "border-mauve-400 bg-mauve-50 text-mauve-800"
                        : "border-mauve-100 hover:border-mauve-200 text-mauve-700"
                      }`}
                  >
                    <div className="text-2xl mb-1">{m.icon}</div>
                    <div className="text-sm font-semibold">{m.label}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-mauve-900 block mb-2">Durée d&apos;une séance</label>
              <div className="flex gap-3 flex-wrap">
                {["30", "45", "60", "75", "90", "120"].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setSessionDuration(d)}
                    className={`px-4 py-2 rounded-xl border-2 text-sm font-semibold transition-all
                      ${sessionDuration === d
                        ? "border-mauve-400 bg-mauve-50 text-mauve-800"
                        : "border-mauve-100 hover:border-mauve-200 text-mauve-700"
                      }`}
                  >
                    {d} min
                  </button>
                ))}
              </div>
            </div>
          </div>

          {error && <div className="mt-4 bg-red-50 text-red-600 rounded-xl px-4 py-3 text-sm">{error}</div>}
          {saved && <div className="mt-4 bg-gold-50 text-gold-700 rounded-xl px-4 py-3 text-sm font-semibold">✓ Modifications sauvegardées !</div>}

          <div className="mt-6">
            <Button onClick={saveProfile} loading={saving} size="lg">
              Sauvegarder le profil
            </Button>
          </div>
        </Card>
      )}

      {/* Services tab */}
      {tab === "prestations" && (
        <Card>
          <h2 className="text-xl font-bold text-mauve-900 mb-5" style={{ fontFamily: "var(--font-heading)" }}>
            Mes prestations
          </h2>

          <div className="space-y-4">
            {services.map((service, i) => (
              <div key={i} className="flex gap-3 items-start">
                <div className="flex-1">
                  <Input
                    label={i === 0 ? "Nom du soin" : undefined}
                    value={service.name}
                    onChange={(e) => {
                      const updated = [...services];
                      updated[i].name = e.target.value;
                      setServices(updated);
                    }}
                    placeholder="Ex: Soins énergétiques..."
                  />
                </div>
                <div className="w-32">
                  <Input
                    label={i === 0 ? "Tarif (€)" : undefined}
                    type="number"
                    value={String(service.price)}
                    onChange={(e) => {
                      const updated = [...services];
                      updated[i].price = e.target.value;
                      setServices(updated);
                    }}
                    placeholder="80"
                    min="0"
                  />
                </div>
                {services.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setServices(services.filter((_, idx) => idx !== i))}
                    className={`text-rose-400 hover:text-rose-600 transition-colors text-xl ${i === 0 ? "mt-7" : ""}`}
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setServices([...services, { name: "", price: "" }])}
            className="mt-4 w-full border-2 border-dashed border-mauve-300 text-mauve-600 font-semibold py-3 rounded-xl hover:bg-mauve-50 transition-colors flex items-center justify-center gap-2"
          >
            <span className="text-xl">+</span>
            Ajouter une prestation
          </button>

          {error && <div className="mt-4 bg-red-50 text-red-600 rounded-xl px-4 py-3 text-sm">{error}</div>}
          {saved && <div className="mt-4 bg-gold-50 text-gold-700 rounded-xl px-4 py-3 text-sm font-semibold">✓ Prestations sauvegardées !</div>}

          <div className="mt-6">
            <Button onClick={saveServices} loading={saving} size="lg">
              Sauvegarder les prestations
            </Button>
          </div>
        </Card>
      )}

      {/* Slots tab */}
      {tab === "creneaux" && (
        <Card>
          <h2 className="text-xl font-bold text-mauve-900 mb-2" style={{ fontFamily: "var(--font-heading)" }}>
            Mes créneaux hebdomadaires
          </h2>
          <p className="text-mauve-600 text-sm mb-5">
            Sélectionnez vos disponibilités. Les créneaux seront générés pour les 8 prochaines semaines.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-max">
              <thead>
                <tr>
                  <th className="w-12 text-xs text-mauve-400 pb-3 text-left">Heure</th>
                  {DAYS.map((d) => (
                    <th key={d} className="text-xs text-mauve-700 font-semibold pb-3 px-1 text-center">
                      {d.slice(0, 3)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {HOURS.map((hour) => (
                  <tr key={hour}>
                    <td className="text-xs text-mauve-400 pr-2 py-1 whitespace-nowrap">{hour}h</td>
                    {DAYS.map((_, dayIdx) => {
                      const key = getSlotKey(dayIdx, hour);
                      const selected = selectedSlots.has(key);
                      return (
                        <td key={dayIdx} className="px-1 py-1">
                          <button
                            type="button"
                            onClick={() => toggleSlot(dayIdx, hour)}
                            className={`w-full h-8 rounded-lg text-xs font-semibold transition-all
                              ${selected
                                ? "bg-mauve-400 text-white shadow-sm"
                                : "bg-mauve-50 hover:bg-mauve-100 text-mauve-600 border border-mauve-100"
                              }`}
                          >
                            {selected ? "✓" : ""}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 bg-mauve-50 rounded-xl p-3 text-sm text-mauve-800">
            <strong>{selectedSlots.size}</strong> créneau(x) sélectionné(s) par semaine
          </div>

          {error && <div className="mt-4 bg-red-50 text-red-600 rounded-xl px-4 py-3 text-sm">{error}</div>}
          {saved && <div className="mt-4 bg-gold-50 text-gold-700 rounded-xl px-4 py-3 text-sm font-semibold">✓ Créneaux mis à jour !</div>}

          <div className="mt-6">
            <Button onClick={saveSlots} loading={saving} size="lg">
              Sauvegarder les créneaux
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
