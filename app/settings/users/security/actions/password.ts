'use server';
import { compare } from 'bcryptjs';
import { passwordLimiter } from '@/lib/rateLimit';
import { fetchHistory, isAdmin, validateRequired } from './userAuth';
import type { Result } from '../types';
import { requireSession } from '@/lib/requireSession';
import { Role } from '@prisma/client';

const checkPasswordRateLimit = async (email: string) => {
  const { success } = await passwordLimiter.limit(email);
  return success;
};

export const validatePassword = async (
  email: string,
  password: string
): Promise<Result> => {
  await requireSession([Role.ADMIN]);
  const error = validateRequired({ email, password });
  if (error) return error;
  try {
    if (!(await checkPasswordRateLimit(email)))
      return {
        success: false,
        message: 'Já houve um pagamento. Tente novamente em 40 segundos'
      };
    const history = await fetchHistory(email);
    if (!isAdmin(history))
      return { success: false, message: 'Você não pode realizar essa ação' };
    if (!history?.password)
      return { success: false, message: 'Senha inválida' };
    if (!(await compare(password, history.password)))
      return { success: false, message: 'Senha inválida' };
    return { success: true };
  } catch {
    return { success: false, message: 'Internal server error' };
  }
};
