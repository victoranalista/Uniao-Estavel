import { DeclarationFormData } from '../../new-registration/types';

export interface UpdateFormData extends DeclarationFormData {
  averbation?: string;
}

export interface UpdateActionResult {
  success: boolean;
  error?: string;
  data?: {
    pdfContent?: string;
    filename?: string;
    declarationId?: string;
  };
}

export interface DeclarationWithRelations {
  id: string;
  declarationDate: Date;
  city: string;
  state: string;
  unionStartDate: Date;
  propertyRegime: string;
  termNumber: string | null;
  bookNumber: string | null;
  registryInfo: {
    registrarName: string;
  } | null;
  prenuptial: {
    pactDate: Date | null;
    pactOffice: string | null;
    pactBook: string | null;
    pactPage: string | null;
    pactTerm: string | null;
  } | null;
  participants: Array<{
    person: {
      identity: {
        fullName: string;
        nationality: string;
        birthDate: Date;
        birthPlace: string;
        taxId: string;
      } | null;
      civilStatuses: Array<{
        status: string;
      }>;
      addresses: Array<{
        street: string;
        number: string;
        complement: string | null;
        neighborhood: string;
        city: string;
        state: string;
      }>;
      contact: {
        email: string;
        phone: string;
      } | null;
      documents: {
        rg: string;
      } | null;
      family: {
        fatherName: string;
        motherName: string;
      } | null;
      professional: {
        profession: string;
      } | null;
      registry: {
        registryOffice: string;
        registryBook: string;
        registryPage: string;
        registryTerm: string;
      } | null;
    };
  }>;
}

export interface UpdateFormProps {
  declarationId: string;
  onSuccess?: () => void;
}

export interface SearchDeclarationParams {
  searchTerm: string;
  searchType: 'name' | 'cpf' | 'term';
}

export interface SearchResult {
  id: string;
  termNumber: string;
  bookNumber: string;
  firstPersonName: string;
  secondPersonName: string;
  unionDate: string;
}