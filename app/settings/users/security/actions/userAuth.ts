import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';

export const fetchHistory = async (email: string) => {
  if (!email) return null;
  try {
    return await prisma.userHistory.findFirst({
      where: { email, status: 'ACTIVE' },
      orderBy: { version: 'desc' },
      include: { user: true }
    });
  } catch {
    return null;
  }
};

export const isAdmin = (history: { role: Role } | null) =>
  !!history && history.role === Role.ADMIN;

export function validateRequired(fields: Record<string, string>) {
  for (const [key, value] of Object.entries(fields))
    if (!value?.trim())
      return { success: false, message: `${key} é obrigatório` };
  return null;
}
