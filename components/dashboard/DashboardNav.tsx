"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Accueil", icon: "🏠" },
  { href: "/dashboard/reservations", label: "Réservations", icon: "📅" },
  { href: "/dashboard/statistiques", label: "Statistiques", icon: "📊" },
  { href: "/dashboard/parametres", label: "Paramètres", icon: "⚙️" },
];

export default function DashboardNav({ user }: { user: any }) {
  const pathname = usePathname();

  return (
    <nav className="bg-white border-b border-mauve-100 shadow-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="text-xl">✨</span>
          <span className="font-bold text-mauve-900 hidden sm:block" style={{ fontFamily: "var(--font-heading)" }}>
            Soins Énergétiques
          </span>
        </Link>

        <div className="flex items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all
                  ${isActive
                    ? "bg-mauve-100 text-mauve-800"
                    : "text-mauve-700 hover:text-mauve-700 hover:bg-mauve-50"
                  }`}
              >
                <span>{item.icon}</span>
                <span className="hidden md:block">{item.label}</span>
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-2 text-sm text-mauve-700">
            <span className="w-7 h-7 rounded-full bg-mauve-200 flex items-center justify-center text-mauve-800 font-bold text-xs">
              {user?.name?.[0]?.toUpperCase() || "P"}
            </span>
            <span className="hidden lg:block font-medium">{user?.name}</span>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="text-xs text-mauve-600 hover:text-red-500 transition-colors px-2 py-1 rounded-lg hover:bg-red-50 font-medium"
          >
            Déconnexion
          </button>
        </div>
      </div>
    </nav>
  );
}
