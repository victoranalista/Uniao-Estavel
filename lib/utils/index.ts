import { validatetaxpayerId } from '@/utils/validators';

export const MASKS = {
  CPF: '999.999.999-99',
  PHONE: '(99) 99999-9999'
} as const;

export const DEFAULTS = {
  CITY: 'Brasília',
  STATE: 'DF',
  PROPERTY_REGIME: 'COMUNHAO_PARCIAL'
} as const;

export const PROPERTY_REGIME_OPTIONS = [
  { value: 'COMUNHAO_PARCIAL', label: 'Comunhão Parcial de Bens' },
  { value: 'SEPARACAO_TOTAL', label: 'Separação Total de Bens' },
  { value: 'PARTICIPACAO_FINAL', label: 'Participação Final nos Aquestos' },
  { value: 'COMUNHAO_UNIVERSAL', label: 'Comunhão Universal de Bens' },
] as const;

export const cleanText = (text: string): string => text.replace(/\D/g, '');

export const applyMask = (value: string, mask: string): string => {
  if (!value) return '';
  const cleanValue = cleanText(value);
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

export const cleanTaxpayerId = (taxpayerId: string): string => cleanText(taxpayerId);

export const formatTaxpayerId = (taxpayerId: string): string => 
  applyMask(taxpayerId, MASKS.CPF);

export const formatPhoneNumber = (phone: string): string => 
  applyMask(phone, MASKS.PHONE);

export const isValidTaxpayerId = (taxpayerId: string): boolean => {
  const cleanId = cleanTaxpayerId(taxpayerId);
  return cleanId.length === 11 && validatetaxpayerId(cleanId);
};

export const getCurrentDateString = (): string => 
  new Date().toISOString().split('T')[0];

export const formatDate = (dateString: string): string => 
  new Date(dateString).toLocaleDateString('pt-BR');

export const formatPropertyRegime = (regime: string): string => {
  const regimeMap: Record<string, string> = {
    'COMUNHAO_PARCIAL': 'Comunhão Parcial de Bens',
    'SEPARACAO_TOTAL': 'Separação Total de Bens',
    'PARTICIPACAO_FINAL': 'Participação Final nos Aquestos',
    'COMUNHAO_UNIVERSAL': 'Comunhão Universal de Bens',
  };
  return regimeMap[regime] || regime;
};

export const validateSearchParams = (params: { name?: string; taxpayerId?: string }): boolean => {
  const hasName = params.name && params.name.trim().length >= 3;
  const hasTaxpayerId = params.taxpayerId && isValidTaxpayerId(params.taxpayerId);
  return !!(hasName || hasTaxpayerId);
};

export const downloadPdf = (pdfBase64: string, filename: string): void => {
  const byteCharacters = atob(pdfBase64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], { type: 'application/pdf' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

export const validateRequired = (fields: Record<string, string>) => {
  for (const [key, value] of Object.entries(fields)) {
    if (!value?.trim()) {
      return { success: false, message: `${key} é obrigatório` };
    }
  }
  return null;
};

export const createFormData = (data: Record<string, string>): FormData => {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (value) formData.append(key, value);
  });
  return formData;
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

export const handleActionError = (error: unknown): ErrorResponse => ({
  success: false,
  message: getErrorMessage(error)
});

export const handleValidationError = (field: string): ErrorResponse => ({
  success: false,
  message: `${field} é obrigatório`
});

export const handleUnauthorizedError = (): ErrorResponse => ({
  success: false,
  message: 'Acesso não autorizado'
});

export const handleNotFoundError = (resource: string): ErrorResponse => ({
  success: false,
  message: `${resource} não encontrado`
});