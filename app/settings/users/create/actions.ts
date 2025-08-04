'use server';
import { cleanTaxpayerId, isValidTaxpayerId, handleActionError } from '@/lib/validators';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { Role, ActivationStatus } from '@prisma/client';
import { hashSync } from 'bcryptjs';

interface UserData {
  name: string;
  email: string;
  taxpayerId: string;
  role: Role;
  password?: string;
}

interface ActionResult {
  success: boolean;
  message?: string;
}

const validateUserData = (data: UserData): string | null => {
  if (!data.name?.trim()) return 'Nome é obrigatório';
  if (!data.email?.trim()) return 'Email é obrigatório';
  if (!data.taxpayerId?.trim()) return 'CPF é obrigatório';
  if (!isValidTaxpayerId(data.taxpayerId)) return 'CPF inválido';
  return null;
};

const prepareUserData = (data: UserData) => ({
  taxpayerId: cleanTaxpayerId(data.taxpayerId),
  status: ActivationStatus.ACTIVE,
  versions: {
    create: {
      version: 1,
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      role: data.role,
      status: ActivationStatus.ACTIVE,
      ...(data.password && { password: hashSync(data.password, 12) })
    }
  }
});

const checkUserAvailability = async (email: string, taxpayerId: string, excludeId?: number) => {
  const cleanId = cleanTaxpayerId(taxpayerId);
  const [existingEmail, existingTaxpayerId] = await Promise.all([
    prisma.userHistory.findFirst({
      where: { 
        email: email.toLowerCase(),
        status: ActivationStatus.ACTIVE,
        archivedAt: null,
        ...(excludeId && { userId: { not: excludeId } })
      },
      select: { id: true }
    }),
    prisma.user.findFirst({
      where: { 
        taxpayerId: cleanId,
        status: ActivationStatus.ACTIVE,
        archivedAt: null,
        ...(excludeId && { id: { not: excludeId } })
      },
      select: { id: true }
    })
  ]);
  if (existingEmail) return 'Email já está em uso';
  if (existingTaxpayerId) return 'CPF já está em uso';
  return null;
};

export const createUser = async (data: UserData): Promise<ActionResult> => {
  const session = await auth();
  if (!session?.user) {
    return { success: false, message: 'Sessão inválida' };
  }
  const validation = validateUserData(data);
  if (validation) {
    return { success: false, message: validation };
  }
  if (!data.password) {
    return { success: false, message: 'Senha é obrigatória' };
  }
  try {
    const availabilityError = await checkUserAvailability(data.email, data.taxpayerId);
    if (availabilityError) {
      return { success: false, message: availabilityError };
    }
    const userData = prepareUserData(data);
    await prisma.user.create({ data: userData });
    return { success: true, message: 'Usuário criado com sucesso' };
  } catch (error) {
    return handleActionError(error);
  }
};
