export interface PersonData {
  name: string;
  nationality: string;
  civilStatus: string;
  typeRegistry: string;
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
  divorceDate?: string;
  newName?: string;
}

export interface DeclarationData {
  id: string;
  date: string;
  city: string;
  state: string;
  unionStartDate: string;
  propertyRegime: PropertyRegime;
  registrarName: string;
  stamp?: string;
  pactDate?: string;
  pactOffice?: string;
  pactBook?: string;
  pactPage?: string;
  pactTerm?: string;
  firstPerson: PersonData;
  secondPerson: PersonData;
  createdAt: string;
  updatedAt: string;
  history?: DeclarationHistoryEntry[];
}

export interface SearchDeclarationResult {
  id: string;
  unionStartDate: string;
  firstPerson: PersonData;
  secondPerson: PersonData;
}

export interface DeclarationHistoryEntry {
  id: string;
  type: 'UPDATE' | 'SECOND_COPY';
  description: string;
  averbation?: string;
  updatedBy: string;
  updatedAt: string;
}

export interface ClientData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  declaration?: {
    unionStartDate: string;
    firstPerson: PersonData;
    secondPerson: PersonData;
  };
}

export interface SearchResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export type PropertyRegime = 
  | 'COMUNHAO_PARCIAL' 
  | 'SEPARACAO_TOTAL' 
  | 'PARTICIPACAO_FINAL' 
  | 'COMUNHAO_UNIVERSAL';

export interface RegistrationSearchParams {
  protocolNumber?: string;
  firstPersonName?: string;
  secondPersonName?: string;
  bookNumber?: string;
  pageNumber?: number;
  termNumber?: number;
}

export interface RegistrationData {
  id: string;
  protocolNumber: string;
  firstPersonName: string;
  secondPersonName: string;
  unionDate: string;
  bookNumber: string;
  pageNumber: number;
  termNumber: number;
}