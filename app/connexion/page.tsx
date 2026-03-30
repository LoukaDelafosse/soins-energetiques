"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function ConnexionPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      setError("Email ou mot de passe incorrect.");
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-mauve-50 to-gold-50 flex flex-col">
      {/* Header */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-mauve-100 px-6 py-4">
        <Link href="/" className="flex items-center gap-2 w-fit">
          <span className="text-2xl">✨</span>
          <span className="font-bold text-mauve-900 text-xl" style={{ fontFamily: "var(--font-heading)" }}>
            Soins Énergétiques
          </span>
        </Link>
      </nav>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="bg-white rounded-3xl shadow-xl border border-mauve-100 p-10 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">🌸</div>
            <h1 className="text-3xl font-bold text-mauve-900" style={{ fontFamily: "var(--font-heading)" }}>
              Connexion
            </h1>
            <p className="text-mauve-600 mt-2">Accédez à votre espace praticien</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre@email.fr"
              required
            />
            <Input
              label="Mot de passe"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">
                {error}
              </div>
            )}

            <Button type="submit" loading={loading} className="w-full" size="lg">
              Se connecter
            </Button>
          </form>

          <div className="mt-6 text-center text-mauve-600 text-sm">
            Pas encore de compte ?{" "}
            <Link href="/inscription" className="text-mauve-600 font-semibold hover:text-mauve-700">
              S&apos;inscrire
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
