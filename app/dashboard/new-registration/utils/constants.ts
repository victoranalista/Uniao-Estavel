import { PropertyRegimeOption } from '../types';
export * from '@/lib/utils';

export const PROPERTY_REGIME_OPTIONS: readonly PropertyRegimeOption[] = [
  { value: 'COMUNHAO_PARCIAL', label: 'Comunhão Parcial de Bens' },
  { value: 'SEPARACAO_TOTAL', label: 'Separação Total de Bens' },
  { value: 'PARTICIPACAO_FINAL', label: 'Participação Final nos Aquestos' },
  { value: 'COMUNHAO_UNIVERSAL', label: 'Comunhão Universal de Bens' },
] as const;

export const CPF_MASK = '999.999.999-99';
export const PHONE_MASK = '(99) 99999-9999';

export const DEFAULT_CITY = 'Brasília';
export const DEFAULT_STATE = 'DF';
export const DEFAULT_PROPERTY_REGIME = 'COMUNHAO_PARCIAL';