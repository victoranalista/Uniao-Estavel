import { validatetaxpayerId } from '@/lib/validators';
export * from '@/lib/utils';

export const cleanTaxpayerId = (taxpayerId: string): string => 
  taxpayerId.replace(/\D/g, '');

export const isValidTaxpayerId = (taxpayerId: string): boolean => {
  const cleanId = cleanTaxpayerId(taxpayerId);
  return cleanId.length === 11 && validatetaxpayerId(cleanId);
};

export const formatTaxpayerId = (taxpayerId: string): string => 
  applyMask(taxpayerId, CPF_MASK);

export const formatPhoneNumber = (phone: string): string => 
  applyMask(phone, PHONE_MASK);

export const applyMask = (value: string, mask: string): string => {
  if (!value) return '';
  const cleanValue = value.replace(/\D/g, '');
  let maskedValue = '';
  let valueIndex = 0;
  for (let i = 0; i < mask.length && valueIndex < cleanValue.length; i++) {
    if (mask[i] === '9') {
      maskedValue += cleanValue[valueIndex];
      valueIndex++;
    } else {
      maskedValue += mask[i];
    }
  }
  return maskedValue;
};

export const CPF_MASK = '999.999.999-99';
export const PHONE_MASK = '(99) 99999-9999';