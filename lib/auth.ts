import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import type { UserRole } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      role: UserRole;
    };
  }

  interface User {
    role: UserRole;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);

export function isStaffRole(role: UserRole): boolean {
  return role === "ADMIN" || role === "PHOTOGRAPHER" || role === "EDITOR";
}
