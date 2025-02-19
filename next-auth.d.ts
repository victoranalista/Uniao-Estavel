import NextAuth, { DefaultSession, User as NextAuthUser } from "next-auth";
import { prisma } from "@/lib/prisma";

declare module "next-auth" {
  interface User {
    id: string;
    name: string;
    email: string;
    role: "ADMIN" | "MANAGER" | "USER";  
  }

  interface Session {
    user: User & DefaultSession["user"];
  }

  interface JWT {
    role: "ADMIN" | "MANAGER" | "USER";  
  }
}
