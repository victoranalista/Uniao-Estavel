import { validatetaxpayerId } from '@/lib/validators';
export * from '@/lib/utils';

export const cleanTaxpayerId = (taxpayerId: string): string => 
  taxpayerId.replace(/\D/g, '');

export const formatTaxpayerId = (taxpayerId: string): string => {
  const cleanValue = cleanTaxpayerId(taxpayerId);
  return cleanValue.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};

export const isValidTaxpayerId = (taxpayerId: string): boolean => {
  const cleanId = cleanTaxpayerId(taxpayerId);
  return cleanId.length === 11 && validatetaxpayerId(cleanId);
};

export const validateTaxpayerIdLength = (taxpayerId: string) => {
  const cleanId = cleanTaxpayerId(taxpayerId);
  if (cleanId.length !== 11) {
    return {
      valid: false,
      message: 'CPF deve conter 11 dígitos numéricos'
    };
  }
  return { valid: true };
};

export const validateTaxpayerIdFormat = (taxpayerId: string) => {
  if (!isValidTaxpayerId(taxpayerId)) {
    return {
      valid: false,
      message: 'CPF inválido'
    };
  }
  return { valid: true };
};