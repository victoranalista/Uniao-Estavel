'use server';
import { Role } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import checker from '../../versionChecker';
import { validationSchema } from '../../edit/[id]/validationSchema';
import bcrypt from 'bcryptjs';
import { requireSession } from '@/lib/requireSession';
import { UpdateUserDataInput } from '../../types';

export const updateUserDataAction = async (data: UpdateUserDataInput) => {
  try {
    await requireSession([Role.ADMIN]);
    const validBody = await validationSchema.parse(data);
    if (!validBody) return { success: false, message: 'Dados inválidos' };
    
    if (validBody.role !== Role.ADMIN && typeof validBody.password === 'string' && validBody.password.trim() !== '') {
      return { success: false, message: 'Apenas usuários ADMIN podem definir senhas' };
    }
    
    const { id: userHistoryId } = validBody;
    
    return await prisma.$transaction(async (tx) => {
      const check = await checker(tx, userHistoryId);
      if (!check) throw new Error('Usuário não encontrado');
      
      const currentUserHistory = await getCurrentUserHistory(tx, userHistoryId);
      if (!currentUserHistory) throw new Error('Histórico do usuário não encontrado');
      
      const isPasswordModified = await checkPasswordModification(validBody, currentUserHistory.password);
      const finalPassword = await determineFinalPassword(validBody, isPasswordModified, currentUserHistory.password);
      
      const hasDataChanged = checkDataChanges(check, validBody, isPasswordModified);
      if (!hasDataChanged) throw new Error('Nenhum dado foi modificado');
      
      await updateUserRecords(tx, userHistoryId, check.userId, validBody, finalPassword);
      
      return { success: true, message: 'Usuário atualizado com sucesso' };
    });
  } catch (error: unknown) {
    return handleActionError(error);
  }
};

const getCurrentUserHistory = async (tx: any, userHistoryId: number) => {
  return await tx.userHistory.findUnique({
    where: { id: userHistoryId },
    select: { password: true }
  });
};

const checkPasswordModification = async (validBody: any, currentPassword: string | null) => {
  if (validBody.role !== Role.ADMIN || !validBody.password || validBody.password.trim() === '') {
    return false;
  }
  
  if (!currentPassword) return true;
  
  return !(await bcrypt.compare(validBody.password, currentPassword));
};

const determineFinalPassword = async (validBody: any, isPasswordModified: boolean, currentPassword: string | null) => {
  if (validBody.role !== Role.ADMIN) return null;
  
  if (isPasswordModified && validBody.password) {
    return await bcrypt.hash(validBody.password, 12);
  }
  
  return currentPassword;
};

const checkDataChanges = (check: any, validBody: any, isPasswordModified: boolean) => {
  return (
    check.name !== validBody.name ||
    check.email !== validBody.email ||
    check.role !== validBody.role ||
    check.status !== validBody.status ||
    isPasswordModified ||
    (validBody.role !== Role.ADMIN)
  );
};

const updateUserRecords = async (tx: any, userHistoryId: number, userId: number, validBody: any, finalPassword: string | null) => {
  await Promise.all([
    tx.userHistory.update({
      where: { id: userHistoryId },
      data: {
        name: validBody.name,
        email: validBody.email,
        role: validBody.role,
        status: validBody.status,
        password: finalPassword
      }
    }),
    tx.user.update({
      where: { id: userId },
      data: { status: validBody.status }
    })
  ]);
};

const handleActionError = (error: unknown) => {
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const message = (error as { message: string }).message;
    const knownErrors = [
      'Nenhum dado foi modificado',
      'Usuário não encontrado', 
      'Histórico do usuário não encontrado'
    ];
    
    if (knownErrors.includes(message)) {
      return { success: false, message };
    }
  }
  
  return { success: false, message: 'Erro ao atualizar usuário' };
};
