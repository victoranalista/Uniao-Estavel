'use server';
import { validatetaxpayerId } from '@/lib/validators';
import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';
import { IAvailabilityResponse } from '../types';

function istaxpayerIdRequired(role: Role): boolean {
  return role === Role.ADMIN || role === Role.USER;
}

export async function checkTaxpayerIdAvailability(
  taxpayerId: string,
  role: Role | null
): Promise<IAvailabilityResponse> {
  const cleantaxpayerId = taxpayerId.replace(/\D/g, '');
  if (cleantaxpayerId.length !== 11)
    return {
      available: false,
      message: 'taxpayerId deve conter 11 dígitos numéricos'
    };
  if (!role || !istaxpayerIdRequired(role)) return { available: true };
  if (!validatetaxpayerId(cleantaxpayerId)) {
    return {
      available: false,
      message: 'taxpayerId inválido'
    };
  }

  const exists = await prisma.user.findFirst({
    where: { taxpayerId: cleantaxpayerId },
    select: { id: true }
  });

  return exists
    ? { available: false, message: 'taxpayerId já está em uso' }
    : { available: true };
}
