import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { validateGalleryCredentials } from "@/lib/gallery-access";
import type { UserRole } from "@prisma/client";

export const authConfig = {
  secret: process.env.AUTH_SECRET,
  trustHost: true,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      id: "credentials",
      name: "credentials",
      credentials: {
        email: { label: "E-Mail", type: "email" },
        password: { label: "Passwort", type: "password" },
        accessCode: { label: "Zugangscode", type: "text" },
      },
      async authorize(credentials) {
        try {
          if (credentials?.accessCode) {
            const email = String(credentials.email ?? "").trim();
            const code = String(credentials.accessCode).trim();
            if (!email) return null;

            const access = await validateGalleryCredentials(email, code);
            if (!access) return null;

            let user = await prisma.user.findUnique({
              where: { email: access.participant.email },
            });

            if (!user) {
              user = await prisma.user.create({
                data: {
                  email: access.participant.email,
                  name: access.participant.parentName,
                  role: "CUSTOMER",
                },
              });
            }

            return {
              id: user.id,
              email: user.email,
              name: user.name,
              role: user.role,
            };
          }

          const email = credentials?.email as string | undefined;
          const password = credentials?.password as string | undefined;
          if (!email || !password) return null;

          const user = await prisma.user.findUnique({ where: { email } });
          if (!user?.passwordHash) return null;

          const valid = await bcrypt.compare(password, user.passwordHash);
          if (!valid) return null;

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          };
        } catch (error) {
          console.error("[auth] authorize failed:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isAdmin = nextUrl.pathname.startsWith("/admin");
      if (!isAdmin) return true;
      if (!auth?.user) return false;
      const role = auth.user.role as UserRole;
      return role === "ADMIN" || role === "PHOTOGRAPHER" || role === "EDITOR";
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id!;
        token.role = (user as { role: UserRole }).role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
