'use server';
import { validatetaxpayerId } from '@/lib/validators';
import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';
import { IAvailabilityResponse } from '../types';

const isRoleRequiresTaxpayerId = (role: Role): boolean =>
  role === Role.ADMIN || role === Role.USER;

const validateLength = (cleanId: string): IAvailabilityResponse => {
  if (cleanId.length !== 11) {
    return {
      available: false,
      message: 'taxpayerId deve conter 11 dígitos numéricos'
    };
  }
  return { available: true };
};

const validateFormat = (cleanId: string): IAvailabilityResponse => {
  if (!validatetaxpayerId(cleanId)) {
    return {
      available: false,
      message: 'taxpayerId inválido'
    };
  }
  return { available: true };
};

const checkExistence = async (
  cleanId: string
): Promise<IAvailabilityResponse> => {
  const exists = await prisma.user.findFirst({
    where: {
      taxpayerId: cleanId
    },
    select: { id: true }
  });
  if (exists) {
    return {
      available: false,
      message: 'taxpayerId já está em uso'
    };
  }
  return { available: true };
};

export const checkTaxpayerIdAvailability = async (
  taxpayerId: string,
  role: Role
): Promise<IAvailabilityResponse> => {
  if (!isRoleRequiresTaxpayerId(role)) {
    return { available: true };
  }
  if (!taxpayerId) {
    return {
      available: false,
      message: 'taxpayerId é obrigatório'
    };
  }
  const cleanId = taxpayerId.replace(/\D/g, '');
  const lengthCheck = validateLength(cleanId);
  if (!lengthCheck.available) return lengthCheck;
  const formatCheck = validateFormat(cleanId);
  if (!formatCheck.available) return formatCheck;
  try {
    return await checkExistence(cleanId);
  } catch {
    return {
      available: false,
      message: 'Erro interno do servidor'
    };
  }
};
