'use server';
import { cleanTaxpayerId, isValidTaxpayerId, handleActionError } from '@/lib/validators';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { Role, ActivationStatus } from '@prisma/client';

interface UserData {
  name: string;
  email: string;
  taxpayerId: string;
  role: Role;
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

const checkUserAvailability = async (email: string, taxpayerId: string, excludeId: number) => {
  const cleanId = cleanTaxpayerId(taxpayerId);
  const [existingEmail, existingTaxpayerId] = await Promise.all([
    prisma.userHistory.findFirst({
      where: { 
        email: email.toLowerCase(),
        status: ActivationStatus.ACTIVE,
        archivedAt: null,
        userId: { not: excludeId }
      },
      select: { id: true }
    }),
    prisma.user.findFirst({
      where: { 
        taxpayerId: cleanId,
        status: ActivationStatus.ACTIVE,
        archivedAt: null,
        id: { not: excludeId }
      },
      select: { id: true }
    })
  ]);
  if (existingEmail) return 'Email já está em uso';
  if (existingTaxpayerId) return 'CPF já está em uso';
  return null;
};

const createNewUserVersion = async (userId: number, data: UserData) => {
  const latestVersion = await prisma.userHistory.findFirst({
    where: { userId, archivedAt: null },
    orderBy: { version: 'desc' },
    select: { version: true }
  });
  const newVersion = (latestVersion?.version || 0) + 1;
  await prisma.userHistory.create({
    data: {
      userId,
      version: newVersion,
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      role: data.role,
      status: ActivationStatus.ACTIVE
    }
  });
};

export const updateUser = async (id: string, data: UserData): Promise<ActionResult> => {
  const session = await auth();
  if (!session?.user) {
    return { success: false, message: 'Sessão inválida' };
  }
  const validation = validateUserData(data);
  if (validation) {
    return { success: false, message: validation };
  }
  const userId = parseInt(id);
  if (isNaN(userId)) {
    return { success: false, message: 'ID de usuário inválido' };
  }
  try {
    const availabilityError = await checkUserAvailability(data.email, data.taxpayerId, userId);
    if (availabilityError) {
      return { success: false, message: availabilityError };
    }
    await createNewUserVersion(userId, data);
    await prisma.user.update({
      where: { id: userId },
      data: { 
        taxpayerId: cleanTaxpayerId(data.taxpayerId),
        updatedAt: new Date()
      }
    });
    return { success: true, message: 'Usuário atualizado com sucesso' };
  } catch (error) {
    return handleActionError(error);
  }
};
