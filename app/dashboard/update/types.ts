export interface SearchResult {
  id: string;
  protocolNumber: string;
  declarationDate: string;
  unionStartDate: string;
  propertyRegime: string;
  registryInfo: {
    registrarName: string;
    typeRegistry: string;
  };
  participants: Array<{
    person: {
      identity: {
        fullName: string;
        taxId: string;
      };
    };
  }>;
}

export interface PrismaDeclarationWithRelations {
  id: string;
  declarationDate: Date;
  city: string;
  state: string;
  unionStartDate: Date;
  propertyRegime: string;
  createdAt: Date;
  registryInfo: {
    id: string;
    registryOffice: string;
    typeRegistry: string;
    registrarName: string;
    createdAt: Date;
  } | null;
  prenuptial: {
    id: string;
    pactDate: Date | null;
    pactOffice: string | null;
    pactBook: string | null;
    pactPage: string | null;
    pactTerm: string | null;
  } | null;
  participants: Array<{
    id: string;
    declarationId: string;
    personId: string;
    person: {
      id: string;
      identity: {
        fullName: string;
        birthDate: Date;
        nationality: string;
        taxId: string;
        birthPlace: string;
      } | null;
      civilStatuses: Array<{
        status: string;
      }>;
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
      addresses: Array<{
        street: string;
        number: string;
        state: string;
      }>;
      contact: {
        email: string;
        phone: string;
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

export interface DeclarationWithRelations {
  id: string;
  declarationDate: Date;
  city: string;
  state: string;
  unionStartDate: Date;
  propertyRegime: string;
  createdAt: Date;
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
    id: string;
    name: string;
    cpf: string;
    rg: string;
    birthDate: Date;
    nationality: string;
    occupation: string;
    maritalStatus: string;
    fatherName: string;
    motherName: string;
    birthPlaceState: string;
    birthPlaceCity: string;
    address: string;
    email: string;
    phone: string;
    registryOffice: string;
    registryBook: string;
    registryPage: string;
    registryTerm: string;
    typeRegistry: string;
    isFirstPerson: boolean;
  }>;
}

export interface PersonFormData {
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
  typeRegistry: string;
  divorceDate?: string;
  newName?: string;
}

export interface UpdateFormData {
  date: string;
  city: string;
  state: string;
  unionStartDate: string;
  propertyRegime: 'COMUNHAO_PARCIAL' | 'SEPARACAO_TOTAL' | 'PARTICIPACAO_FINAL' | 'COMUNHAO_UNIVERSAL';
  registrarName: string;
  stamp?: string;
  pactDate?: string;
  pactOffice?: string;
  pactBook?: string;
  pactPage?: string;
  pactTerm?: string;
  averbation?: string;
  firstPerson: PersonFormData;
  secondPerson: PersonFormData;
}

export interface UpdateFormProps {
  declaration: DeclarationWithRelations;
  declarationId: string;
  initialData?: Partial<UpdateFormData>;
  onSuccess: () => void;
  onBack: () => void;
}

export interface SearchParams {
  name?: string;
  taxpayerId?: string;
}

export interface UpdateActionResult {
  success: boolean;
  error?: string;
  data?: {
    declarationId: string;
    pdfContent?: string;
    filename?: string;
  };
}