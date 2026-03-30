import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import DashboardNav from "@/components/dashboard/DashboardNav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/connexion");
  }

  const subscriptionStatus = (session.user as any).subscriptionStatus;
  if (subscriptionStatus !== "active") {
    redirect("/abonnement-inactif");
  }

  return (
    <div className="min-h-screen bg-mauve-50/30 flex flex-col">
      <DashboardNav user={session.user} />
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">
        {children}
      </main>
    </div>
  );
}
