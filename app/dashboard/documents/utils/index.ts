import { validatetaxpayerId } from '@/lib/validators';

export const cleanTaxpayerId = (taxpayerId: string): string => 
  taxpayerId.replace(/\D/g, '');

export const isValidTaxpayerId = (taxpayerId: string): boolean => {
  const cleanId = cleanTaxpayerId(taxpayerId);
  return cleanId.length === 11 && validatetaxpayerId(cleanId);
};

export const formatPropertyRegime = (regime: string): string => {
  const regimeMap: Record<string, string> = {
    'COMUNHAO_PARCIAL': 'Comunhão Parcial de Bens',
    'SEPARACAO_TOTAL': 'Separação Total de Bens',
    'PARTICIPACAO_FINAL': 'Participação Final nos Aquestos',
    'COMUNHAO_UNIVERSAL': 'Comunhão Universal de Bens',
  };
  return regimeMap[regime] || regime;
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('pt-BR');
};

export const validateSearchParams = (params: { name?: string; taxpayerId?: string }): boolean => {
  const hasName = params.name && params.name.trim().length >= 3;
  const hasTaxpayerId = params.taxpayerId && isValidTaxpayerId(params.taxpayerId);
  return !!(hasName || hasTaxpayerId);
};