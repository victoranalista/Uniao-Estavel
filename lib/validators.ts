const validatetaxpayerId = (taxpayerId: string): boolean => {
  const cleanTaxId = taxpayerId.replace(/\D/g, '');
  if (cleanTaxId.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cleanTaxId)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanTaxId.charAt(i)) * (10 - i);
  }
  let digit = 11 - (sum % 11);
  if (digit >= 10) digit = 0;
  if (digit !== parseInt(cleanTaxId.charAt(9))) return false;
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanTaxId.charAt(i)) * (11 - i);
  }
  digit = 11 - (sum % 11);
  if (digit >= 10) digit = 0;
  return digit === parseInt(cleanTaxId.charAt(10));
};

const cleanTaxpayerId = (taxpayerId: string): string =>
  taxpayerId.replace(/\D/g, '');

const isValidTaxpayerId = (taxpayerId: string): boolean => {
  const cleanId = cleanTaxpayerId(taxpayerId);
  return cleanId.length === 11 && validatetaxpayerId(cleanId);
};

const isValidtaxpayerIdOrCnpj = (input: string): boolean => {
  const cleanInput = input.replace(/[^\d]/g, '');
  if (cleanInput.length === 11) return isValidTaxpayerId(cleanInput);
  else if (cleanInput.length === 14) return validateCnpj(cleanInput);
  return false;
};

const validateCnpj = (cnpj: string): boolean => {
  if (/^(\d)\1+$/.test(cnpj)) return false;
  let size = cnpj.length - 2;
  let numbers = cnpj.substring(0, size);
  let digits = cnpj.substring(size);
  let sum = 0;
  let pos = size - 7;
  for (let i = size; i >= 1; i--) sum += parseInt(numbers[size - i]) * pos--;
  if (pos < 2) pos = 9;
  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits[0])) return false;
  size += 1;
  numbers = cnpj.substring(0, size);
  sum = 0;
  pos = size - 7;
  for (let i = size; i >= 1; i--) sum += parseInt(numbers[size - i]) * pos--;
  if (pos < 2) pos = 9;
  result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  return result === parseInt(digits[1]);
};

interface ErrorResponse {
  success: false;
  message: string;
}

const getErrorMessage = (error: unknown): string => {
  if (typeof error === 'object' && error !== null && 'message' in error) {
    return (error as { message: string }).message;
  }
  return 'Erro interno do servidor';
};

const handleActionError = (error: unknown): ErrorResponse => ({
  success: false,
  message: getErrorMessage(error)
});

export * from '@/lib/utils';
export {
  validatetaxpayerId,
  cleanTaxpayerId,
  isValidTaxpayerId,
  isValidtaxpayerIdOrCnpj,
  validateCnpj,
  handleActionError
};
