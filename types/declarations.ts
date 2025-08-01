import { PrismaClient } from '@prisma/client';

export type PrismaTransaction = Parameters<Parameters<PrismaClient['$transaction']>[0]>[0];

export type PropertyRegime = 
  | 'COMUNHAO_PARCIAL' 
  | 'SEPARACAO_TOTAL' 
  | 'PARTICIPACAO_FINAL' 
  | 'COMUNHAO_UNIVERSAL';

export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  pdfContent?: string;
  filename?: string;
}

export interface PersonInput {
  name: string;
  nationality: string;
  civilStatus: string;
  birthDate: string;
  birthPlaceState: string;
  birthPlaceCity: string;
  profession: string;
  rg: string;
  taxpayerId: string;
  address: string;
  email: string;
  phone: string;
  fatherName: string;
  motherName: string;
  registryOffice: string;
  registryBook: string;
  registryPage: string;
  registryTerm: string;
  typeRegistry?: string;
  divorceDate?: string;
  newName?: string;
}

export interface PdfPersonData extends PersonInput {
  cpf: string;
  birthPlace: string;
  birthPlaceState: string;
  birthPlaceCity: string;
  taxpayerId: string;
  typeRegistry: string;
}

export interface SearchFormData {
  protocolNumber: string;
  taxpayerId: string;
}

export interface RegistrationSearchParams {
  protocolNumber?: string;
  firstPersonName?: string;
  secondPersonName?: string;
  bookNumber?: string;
  pageNumber?: number;
  termNumber?: number;
  taxpayerId?: string;
}

export interface DeclarationInput {
  date: string;
  city: string;
  state: string;
  stamp: string;
  firstPerson: PersonInput;
  secondPerson: PersonInput;
  unionStartDate: string;
  propertyRegime: PropertyRegime;
  registrarName?: string;
  pactDate?: string;
  pactOffice?: string;
  pactBook?: string;
  pactPage?: string;
  pactTerm?: string;
}

export interface PdfData {
  date: string;
  originalDate?: string;
  city: string;
  state: string;
  stamp: string;
  firstPerson: PdfPersonData;
  secondPerson: PdfPersonData;
  unionStartDate: string;
  propertyRegime: PropertyRegime;
  registrarName?: string;
  pactDate?: string;
  pactOffice?: string;
  pactBook?: string;
  pactPage?: string;
  pactTerm?: string;
  averbations?: { text: string; date: string; updatedBy: string }[];
  isUpdate?: boolean;
}

export interface UpdateData {
  id: string;
  data: Partial<DeclarationInput>;
}

export interface SearchFilters {
  protocolNumber?: string;
  taxpayerId?: string;
  firstPersonName?: string;
  secondPersonName?: string;
}

export type HistoryEntryType = 'UPDATE' | 'SECOND_COPY' | 'AVERBATION';

export interface DeclarationHistoryEntry {
  id: string;
  type: HistoryEntryType;
  description: string;
  averbation?: string;
  updatedBy: string;
  updatedAt: string;
}

export interface DeclarationData {
  id: string;
  createdAt: string;
  updatedAt: string;
  declarationDate: string;
  date: string;
  city: string;
  state: string;
  unionStartDate: string;
  propertyRegime: string;
  firstPerson: PersonInput;
  secondPerson: PersonInput;
  history?: DeclarationHistoryEntry[];
  pactDate?: string;
  registryInfo?: {
    registryOffice: string;
    typeRegistry: string;
    registrarName: string;
  };
  prenuptial?: {
    pactDate?: string;
    pactOffice?: string;
    pactBook?: string;
    pactPage?: string;
    pactTerm?: string;
  };
}

export interface SearchDeclarationResult {
  id: string;
  firstPersonName: string;
  secondPersonName: string;
  declarationDate: string;
  city: string;
  state: string;
}