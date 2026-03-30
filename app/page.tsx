import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-mauve-50 to-gold-50">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-mauve-100 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">✨</span>
            <span className="font-bold text-mauve-900 text-xl" style={{ fontFamily: "var(--font-heading)" }}>
              Soins Énergétiques
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/connexion"
              className="text-mauve-800 font-semibold hover:text-mauve-600 transition-colors px-4 py-2"
            >
              Connexion
            </Link>
            <Link
              href="/inscription"
              className="bg-mauve-500 hover:bg-mauve-600 text-white font-semibold px-5 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all"
            >
              Commencer
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-mauve-100 text-mauve-800 px-4 py-2 rounded-full text-sm font-semibold mb-6">
          <span>🌟</span>
          <span>La plateforme des praticiens de bien-être</span>
        </div>
        <h1 className="text-5xl md:text-6xl font-bold text-mauve-900 mb-6 leading-tight" style={{ fontFamily: "var(--font-heading)" }}>
          Partagez votre lumière
          <br />
          <span className="text-mauve-500">avec le monde</span>
        </h1>
        <p className="text-xl text-mauve-700 mb-10 max-w-2xl mx-auto leading-relaxed">
          Créez votre espace en ligne, gérez vos réservations et développez
          votre activité de soins énergétiques avec une plateforme pensée pour vous.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/inscription"
            className="bg-mauve-500 hover:bg-mauve-600 text-white font-bold px-8 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all text-lg"
          >
            Créer mon espace — 49€/mois
          </Link>
          <a
            href="#comment-ca-marche"
            className="border-2 border-mauve-300 text-mauve-800 font-bold px-8 py-4 rounded-2xl hover:bg-mauve-50 transition-all text-lg"
          >
            En savoir plus
          </a>
        </div>
        <p className="text-sm text-mauve-600 mt-4">
          ✓ Sans engagement &nbsp;·&nbsp; ✓ Annulable à tout moment &nbsp;·&nbsp; ✓ Support inclus
        </p>
      </section>

      {/* Features */}
      <section id="comment-ca-marche" className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-mauve-900 mb-4" style={{ fontFamily: "var(--font-heading)" }}>
            Tout ce dont vous avez besoin
          </h2>
          <p className="text-mauve-700 text-lg">
            Un outil complet pour votre activité de praticien
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: "🌸",
              title: "Votre fiche personnalisée",
              desc: "Une page dédiée avec votre photo, vos soins, vos tarifs et votre agenda. Tout automatiquement généré à votre inscription.",
            },
            {
              icon: "📅",
              title: "Réservations en ligne",
              desc: "Vos clients réservent facilement leurs créneaux 24h/24. Les créneaux pris se grisent automatiquement.",
            },
            {
              icon: "📊",
              title: "Dashboard intuitif",
              desc: "Suivez vos réservations, visualisez vos revenus du mois et gérez tout depuis votre espace personnel.",
            },
            {
              icon: "📱",
              title: "Notifications email",
              desc: "Recevez une notification par email à chaque nouvelle réservation avec toutes les informations du client.",
            },
            {
              icon: "🎨",
              title: "Paramètres flexibles",
              desc: "Modifiez vos prestations, tarifs, horaires et informations à tout moment. Les changements s'appliquent instantanément.",
            },
            {
              icon: "🔒",
              title: "Sécurisé & fiable",
              desc: "Paiement sécurisé via Stripe, données protégées et disponibilité 24h/24.",
            },
          ].map((f, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-8 border border-mauve-100 shadow-sm hover:shadow-md hover:border-mauve-200 transition-all"
            >
              <div className="text-4xl mb-4">{f.icon}</div>
              <h3 className="text-xl font-bold text-mauve-900 mb-3" style={{ fontFamily: "var(--font-heading)" }}>{f.title}</h3>
              <p className="text-mauve-700 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="bg-gradient-to-br from-mauve-400 to-gold-400 rounded-3xl p-12 text-center text-white shadow-xl">
          <h2 className="text-4xl font-bold mb-4" style={{ fontFamily: "var(--font-heading)" }}>Un tarif simple & transparent</h2>
          <p className="text-mauve-100 text-lg mb-8">
            Tout est inclus, sans surprise
          </p>
          <div className="bg-white/20 backdrop-blur rounded-2xl p-8 max-w-sm mx-auto mb-8">
            <div className="text-6xl font-bold mb-2">49€</div>
            <div className="text-mauve-100 text-lg">/mois</div>
            <ul className="text-left mt-6 space-y-3">
              {[
                "Fiche praticien personnalisée",
                "Système de réservation en ligne",
                "Dashboard & statistiques",
                "Notifications email",
                "Gestion des créneaux illimitée",
                "Support inclus",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <span>✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <Link
            href="/inscription"
            className="bg-white text-mauve-600 font-bold px-10 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all text-lg inline-block hover:bg-mauve-50"
          >
            Commencer maintenant
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-mauve-100 bg-white py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-mauve-600 text-sm">
          <div className="flex items-center gap-2">
            <span>✨</span>
            <span className="font-semibold text-mauve-800">Soins Énergétiques</span>
          </div>
          <p>© 2025 — Fait avec amour et lumière 🌸</p>
          <div className="flex gap-4">
            <Link href="/connexion" className="hover:text-mauve-600 transition-colors">
              Connexion praticien
            </Link>
            <Link href="/inscription" className="hover:text-mauve-600 transition-colors">
              S&apos;inscrire
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
