import { z } from 'zod';
import type { ActionResult } from '@/types/declarations';

const getZodErrorMessage = (error: z.ZodError) => {
  const firstIssue = error.issues[0];
  return firstIssue ? `${firstIssue.path.join('.')}: ${firstIssue.message}` : 'Dados inválidos';
};

const isUniqueConstraintError = (message: string) => {
  return message.includes('Unique constraint failed');
};

const isTimeoutError = (message: string) => {
  return message.includes('Transaction already closed') || message.includes('timeout');
};

const isCpfDuplicateError = (message: string) => {
  return message.includes('mesmo CPF');
};

export const handleActionError = (error: Error): ActionResult => {
  if (error instanceof z.ZodError) {
    return { success: false, error: getZodErrorMessage(error) };
  }
  if (isCpfDuplicateError(error.message)) {
    return { success: false, error: error.message };
  }
  if (isUniqueConstraintError(error.message)) {
    return { success: false, error: 'Já existe uma pessoa cadastrada com este CPF' };
  }
  if (isTimeoutError(error.message)) {
    return { success: false, error: 'Operação demorou muito para ser processada. Tente novamente.' };
  }
  return { success: false, error: 'Não consegui criar o registro' };
};