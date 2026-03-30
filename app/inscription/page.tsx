"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Button from "@/components/ui/Button";

const DAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
const HOURS = Array.from({ length: 14 }, (_, i) => i + 7); // 7h → 20h

interface Service {
  name: string;
  price: string;
}

interface SelectedSlot {
  day: number;
  hour: number;
}

export default function InscriptionPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Step 1 — Infos perso
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [city, setCity] = useState("");
  const [bio, setBio] = useState("");
  const [sessionMode, setSessionMode] = useState("BOTH");
  const [sessionDuration, setSessionDuration] = useState("60");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // Step 2 — Prestations
  const [services, setServices] = useState<Service[]>([{ name: "", price: "" }]);

  // Step 3 — Créneaux
  const [selectedSlots, setSelectedSlots] = useState<SelectedSlot[]>([]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const addService = () => setServices([...services, { name: "", price: "" }]);
  const removeService = (i: number) => setServices(services.filter((_, idx) => idx !== i));
  const updateService = (i: number, field: "name" | "price", value: string) => {
    const updated = [...services];
    updated[i][field] = value;
    setServices(updated);
  };

  const toggleSlot = (day: number, hour: number) => {
    const exists = selectedSlots.find((s) => s.day === day && s.hour === hour);
    if (exists) {
      setSelectedSlots(selectedSlots.filter((s) => !(s.day === day && s.hour === hour)));
    } else {
      setSelectedSlots([...selectedSlots, { day, hour }]);
    }
  };

  const isSlotSelected = (day: number, hour: number) =>
    selectedSlots.some((s) => s.day === day && s.hour === hour);

  // Generate next 8 weeks of slots based on selected day/hour combinations
  const generateTimeSlots = (): string[] => {
    const slots: string[] = [];
    const now = new Date();
    for (let week = 0; week < 8; week++) {
      for (const slot of selectedSlots) {
        const date = new Date(now);
        const currentDay = date.getDay(); // 0=Sunday, 1=Monday...
        const targetDay = slot.day === 6 ? 0 : slot.day + 1; // Convert: 0=Lundi→1, 6=Dimanche→0
        let daysToAdd = targetDay - currentDay;
        if (daysToAdd <= 0) daysToAdd += 7;
        date.setDate(date.getDate() + daysToAdd + week * 7);
        date.setHours(slot.hour, 0, 0, 0);
        if (date > now) {
          slots.push(date.toISOString());
        }
      }
    }
    return slots;
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");

    try {
      // 1. Create practitioner account
      const timeSlots = generateTimeSlots();
      const validServices = services.filter((s) => s.name.trim() && s.price);

      const createRes = await fetch("/api/practitioners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          firstName,
          lastName,
          city,
          bio,
          sessionMode,
          sessionDuration,
          services: validServices.map((s) => ({ name: s.name, price: parseFloat(s.price) })),
          timeSlots,
        }),
      });

      if (!createRes.ok) {
        const data = await createRes.json();
        setError(data.error || "Erreur lors de la création du compte.");
        setLoading(false);
        return;
      }

      const { id } = await createRes.json();

      // 2. Upload photo if provided
      if (photoFile) {
        // Sign in first to get auth for upload
        const { signIn } = await import("next-auth/react");
        await signIn("credentials", { email, password, redirect: false });

        const formData = new FormData();
        formData.append("file", photoFile);
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        if (uploadRes.ok) {
          const { url } = await uploadRes.json();
          await fetch("/api/profile", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ firstName, lastName, city, bio, sessionMode, sessionDuration, photoUrl: url }),
          });
        }
      }

      // 3. Redirect to Stripe checkout
      const checkoutRes = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ practitionerId: id }),
      });

      const { url } = await checkoutRes.json();
      if (url) {
        window.location.href = url;
      } else {
        router.push("/connexion?registered=true");
      }
    } catch (err) {
      setError("Une erreur s'est produite. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  const canGoNext = () => {
    if (step === 1) {
      return firstName && lastName && email && password && city;
    }
    if (step === 2) {
      return services.some((s) => s.name.trim() && s.price);
    }
    if (step === 3) {
      return selectedSlots.length > 0;
    }
    return true;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-mauve-50 to-gold-50">
      {/* Header */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-mauve-100 px-6 py-4">
        <Link href="/" className="flex items-center gap-2 w-fit">
          <span className="text-2xl">✨</span>
          <span className="font-bold text-mauve-900 text-xl" style={{ fontFamily: "var(--font-heading)" }}>
            Soins Énergétiques
          </span>
        </Link>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Progress */}
        <div className="flex items-center justify-center gap-4 mb-10">
          {[
            { num: 1, label: "Profil" },
            { num: 2, label: "Prestations" },
            { num: 3, label: "Créneaux" },
            { num: 4, label: "Paiement" },
          ].map((s) => (
            <div key={s.num} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all
                  ${step >= s.num
                    ? "bg-mauve-500 text-white shadow-md"
                    : "bg-mauve-100 text-mauve-400"
                  }`}
              >
                {step > s.num ? "✓" : s.num}
              </div>
              <span
                className={`text-sm font-medium hidden sm:block ${
                  step >= s.num ? "text-mauve-700" : "text-mauve-300"
                }`}
              >
                {s.label}
              </span>
              {s.num < 4 && (
                <div
                  className={`w-8 h-0.5 ml-1 ${step > s.num ? "bg-mauve-400" : "bg-mauve-200"}`}
                />
              )}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-mauve-100 p-8 md:p-10">
          {/* STEP 1 — Informations personnelles */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h1 className="text-3xl font-bold text-mauve-900" style={{ fontFamily: "var(--font-heading)" }}>
                  Votre profil
                </h1>
                <p className="text-mauve-600 mt-1">Ces informations apparaîtront sur votre fiche</p>
              </div>

              {/* Photo */}
              <div className="flex flex-col items-center gap-3">
                <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-mauve-200 bg-mauve-50 flex items-center justify-center">
                  {photoPreview ? (
                    <Image src={photoPreview} alt="Photo" width={112} height={112} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-4xl">🧘</span>
                  )}
                </div>
                <label className="cursor-pointer bg-mauve-50 hover:bg-mauve-100 text-mauve-700 font-semibold px-4 py-2 rounded-xl border border-mauve-200 text-sm transition-colors">
                  <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                  Choisir une photo de profil
                </label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Prénom"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Marie"
                  required
                />
                <Input
                  label="Nom"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Dupont"
                  required
                />
              </div>

              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="marie@exemple.fr"
                required
              />

              <Input
                label="Mot de passe"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 8 caractères"
                required
                hint="Au moins 8 caractères"
              />

              <Input
                label="Ville"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Paris"
                required
              />

              <Textarea
                label="Description (présentez-vous)"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Partagez votre parcours, votre approche, vos valeurs..."
                rows={4}
              />

              {/* Mode de séance */}
              <div>
                <label className="text-sm font-semibold text-mauve-900 block mb-2">
                  Mode de séance <span className="text-rose-400">*</span>
                </label>
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

              {/* Durée séance */}
              <div>
                <label className="text-sm font-semibold text-mauve-900 block mb-2">
                  Durée d&apos;une séance
                </label>
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
          )}

          {/* STEP 2 — Prestations */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h1 className="text-3xl font-bold text-mauve-900" style={{ fontFamily: "var(--font-heading)" }}>
                  Vos prestations
                </h1>
                <p className="text-mauve-600 mt-1">
                  Ajoutez chaque soin que vous proposez avec son tarif
                </p>
              </div>

              <div className="space-y-4">
                {services.map((service, i) => (
                  <div key={i} className="flex gap-3 items-start">
                    <div className="flex-1">
                      <Input
                        label={i === 0 ? "Nom du soin" : undefined}
                        value={service.name}
                        onChange={(e) => updateService(i, "name", e.target.value)}
                        placeholder="Ex: Soins énergétiques, Reiki, Massage..."
                      />
                    </div>
                    <div className="w-32">
                      <Input
                        label={i === 0 ? "Tarif (€)" : undefined}
                        type="number"
                        value={service.price}
                        onChange={(e) => updateService(i, "price", e.target.value)}
                        placeholder="80"
                        min="0"
                      />
                    </div>
                    {services.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeService(i)}
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
                onClick={addService}
                className="w-full border-2 border-dashed border-mauve-300 text-mauve-600 font-semibold py-3 rounded-xl hover:bg-mauve-50 transition-colors flex items-center justify-center gap-2"
              >
                <span className="text-xl">+</span>
                Ajouter une prestation
              </button>

              <div className="bg-mauve-50 rounded-2xl p-4 text-mauve-800 text-sm">
                <strong>Exemples :</strong> Soins énergétiques, Reiki, Magnétisme, Cristallothérapie,
                Naturopathie, Hypnose, Méditation guidée...
              </div>
            </div>
          )}

          {/* STEP 3 — Créneaux */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h1 className="text-3xl font-bold text-mauve-900" style={{ fontFamily: "var(--font-heading)" }}>
                  Vos créneaux
                </h1>
                <p className="text-mauve-600 mt-1">
                  Choisissez les heures auxquelles vous êtes disponible chaque semaine
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
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
                        <td className="text-xs text-mauve-400 pr-2 py-1 whitespace-nowrap">
                          {hour}h
                        </td>
                        {DAYS.map((_, dayIdx) => (
                          <td key={dayIdx} className="px-1 py-1">
                            <button
                              type="button"
                              onClick={() => toggleSlot(dayIdx, hour)}
                              className={`w-full h-8 rounded-lg text-xs font-semibold transition-all
                                ${isSlotSelected(dayIdx, hour)
                                  ? "bg-mauve-400 text-white shadow-sm"
                                  : "bg-mauve-50 hover:bg-mauve-100 text-mauve-600 border border-mauve-100"
                                }`}
                            >
                              {isSlotSelected(dayIdx, hour) ? "✓" : ""}
                            </button>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="bg-mauve-50 rounded-2xl p-4 text-mauve-800 text-sm flex items-start gap-2">
                <span>💡</span>
                <div>
                  <strong>{selectedSlots.length} créneau(x) sélectionné(s)</strong> par semaine.
                  Les disponibilités seront générées pour les 8 prochaines semaines.
                </div>
              </div>
            </div>
          )}

          {/* STEP 4 — Récap avant paiement */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h1 className="text-3xl font-bold text-mauve-900" style={{ fontFamily: "var(--font-heading)" }}>
                  Récapitulatif
                </h1>
                <p className="text-mauve-600 mt-1">Vérifiez vos informations avant le paiement</p>
              </div>

              <div className="space-y-4">
                <div className="bg-mauve-50 rounded-2xl p-5">
                  <h3 className="font-bold text-mauve-900 mb-3">👤 Profil</h3>
                  <div className="space-y-1 text-sm text-mauve-800">
                    <p><strong>Nom :</strong> {firstName} {lastName}</p>
                    <p><strong>Email :</strong> {email}</p>
                    <p><strong>Ville :</strong> {city}</p>
                    <p><strong>Mode :</strong> {sessionMode === "BOTH" ? "Présentiel & Distance" : sessionMode === "PRESENTIEL" ? "En présentiel" : "À distance"}</p>
                    <p><strong>Durée séance :</strong> {sessionDuration} min</p>
                  </div>
                </div>

                <div className="bg-rose-50 rounded-2xl p-5">
                  <h3 className="font-bold text-rose-900 mb-3">🌟 Prestations ({services.filter(s => s.name).length})</h3>
                  <div className="space-y-1">
                    {services.filter(s => s.name).map((s, i) => (
                      <div key={i} className="flex justify-between text-sm text-mauve-800">
                        <span>{s.name}</span>
                        <span className="font-semibold">{s.price}€</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gold-50 rounded-2xl p-5">
                  <h3 className="font-bold text-gold-700 mb-1">📅 Créneaux</h3>
                  <p className="text-sm text-mauve-800">{selectedSlots.length} créneau(x) par semaine → {selectedSlots.length * 8} créneaux générés</p>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">
                  {error}
                </div>
              )}

              <div className="bg-gradient-to-r from-mauve-100 to-gold-100 rounded-2xl p-6 text-center">
                <div className="text-3xl font-bold text-mauve-800 mb-1">49€/mois</div>
                <p className="text-mauve-700 text-sm">Annulable à tout moment via votre espace</p>
              </div>
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-mauve-100">
            {step > 1 ? (
              <Button variant="outline" onClick={() => setStep(step - 1)}>
                ← Retour
              </Button>
            ) : (
              <Link href="/" className="inline-flex items-center text-mauve-600 hover:text-mauve-800 transition-colors text-sm font-medium py-2">
                ← Retour au site
              </Link>
            )}

            {step < 4 ? (
              <Button
                onClick={() => setStep(step + 1)}
                disabled={!canGoNext()}
              >
                Suivant →
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                loading={loading}
                size="lg"
                className="bg-gradient-to-r from-mauve-500 to-gold-500 hover:from-mauve-600 hover:to-gold-600"
              >
                Payer 49€/mois →
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
