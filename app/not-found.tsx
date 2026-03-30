import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-mauve-50 to-gold-50 flex flex-col items-center justify-center px-4">
      <div className="text-center">
        <div className="text-7xl mb-6">🌸</div>
        <h1 className="text-4xl font-bold text-mauve-900 mb-4" style={{ fontFamily: "var(--font-heading)" }}>
          Page introuvable
        </h1>
        <p className="text-mauve-700 mb-8 text-lg">
          Cette page n&apos;existe pas ou a été déplacée.
        </p>
        <Link
          href="/"
          className="bg-mauve-500 hover:bg-mauve-600 text-white font-bold px-8 py-3 rounded-xl shadow-md hover:shadow-lg transition-all"
        >
          Retour à l&apos;accueil
        </Link>
      </div>
    </div>
  );
}
