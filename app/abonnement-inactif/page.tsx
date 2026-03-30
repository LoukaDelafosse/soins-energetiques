import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AbonnementInactifPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/connexion");

  return (
    <div className="min-h-screen bg-gradient-to-br from-mauve-50 to-gold-50 flex flex-col items-center justify-center px-4">
      <div className="bg-white rounded-3xl shadow-xl border border-mauve-100 p-10 max-w-md w-full text-center">
        <div className="text-5xl mb-4">🔒</div>
        <h1 className="text-3xl font-bold text-mauve-900 mb-3" style={{ fontFamily: "var(--font-heading)" }}>
          Abonnement inactif
        </h1>
        <p className="text-mauve-700 mb-6">
          Votre abonnement n&apos;est pas encore actif. Veuillez compléter le paiement pour accéder à votre espace.
        </p>
        <p className="text-mauve-600 text-sm mb-8">
          Si vous venez de vous inscrire, l&apos;activation peut prendre quelques instants après le paiement.
        </p>
        <div className="space-y-3">
          <Link
            href="/inscription"
            className="block w-full bg-mauve-500 hover:bg-mauve-600 text-white font-bold py-3 rounded-xl transition-colors"
          >
            Compléter l&apos;inscription
          </Link>
          <Link
            href="/connexion"
            className="block w-full border-2 border-mauve-200 text-mauve-700 font-semibold py-3 rounded-xl hover:bg-mauve-50 transition-colors"
          >
            Se reconnecter
          </Link>
        </div>
      </div>
    </div>
  );
}
