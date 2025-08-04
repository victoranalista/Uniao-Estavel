'use server';
import { cleanTaxpayerId, isValidTaxpayerId } from '@/lib/validators';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

interface UpdateData {
  partner1Name: string;
  partner1TaxpayerId: string;
  partner1BirthDate: string;
  partner2Name: string;
  partner2TaxpayerId: string;
  partner2BirthDate: string;
  marriageDate: string;
  propertyRegime: string;
  city: string;
  state: string;
}

interface UpdateResult {
  success: boolean;
  message?: string;
}

const validateRequiredFields = (data: UpdateData): string | null => {
  const required = ['partner1Name', 'partner1TaxpayerId', 'partner2Name', 'partner2TaxpayerId'];
  for (const field of required) {
    if (!data[field as keyof UpdateData]?.trim()) {
      return `${field} é obrigatório`;
    }
  }
  return null;
};

const validateTaxpayerIds = (data: UpdateData): string | null => {
  if (!isValidTaxpayerId(data.partner1TaxpayerId)) {
    return 'CPF do primeiro parceiro inválido';
  }
  if (!isValidTaxpayerId(data.partner2TaxpayerId)) {
    return 'CPF do segundo parceiro inválido';
  }
  return null;
};

const prepareUpdateData = (data: UpdateData) => ({
  unionStartDate: new Date(data.marriageDate),
  propertyRegime: data.propertyRegime,
  city: data.city,
  state: data.state,
  updatedAt: new Date()
});

export const updateDeclaration = async (id: string, data: UpdateData): Promise<UpdateResult> => {
  const session = await auth();
  if (!session?.user) {
    return { success: false, message: 'Sessão inválida' };
  }
  const fieldValidation = validateRequiredFields(data);
  if (fieldValidation) {
    return { success: false, message: fieldValidation };
  }
  const taxpayerIdValidation = validateTaxpayerIds(data);
  if (taxpayerIdValidation) {
    return { success: false, message: taxpayerIdValidation };
  }
  try {
    const updateData = prepareUpdateData(data);
    await prisma.declaration.update({
      where: { id },
      data: updateData
    });
    return { success: true, message: 'Declaração atualizada com sucesso' };
  } catch {
    return { success: false, message: 'Erro interno do servidor' };
  }
};