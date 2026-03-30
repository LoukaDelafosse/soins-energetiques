import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: {
    signIn: "/connexion",
    error: "/connexion",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        // Dynamic import to avoid edge runtime bundling issues
        const { prisma } = await import("./db");

        const practitioner = await prisma.practitioner.findUnique({
          where: { email: credentials.email as string },
        });

        if (!practitioner) return null;

        const isValid = await bcrypt.compare(
          credentials.password as string,
          practitioner.password
        );

        if (!isValid) return null;

        return {
          id: practitioner.id,
          email: practitioner.email,
          name: `${practitioner.firstName} ${practitioner.lastName}`,
          subscriptionStatus: practitioner.subscriptionStatus,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.subscriptionStatus = (user as any).subscriptionStatus;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        (session.user as any).subscriptionStatus = token.subscriptionStatus;
      }
      return session;
    },
  },
});
