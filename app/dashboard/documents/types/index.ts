export interface SearchParams {
  name?: string;
  taxpayerId?: string;
}

export interface DeclarationSearchResult {
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

export interface PdfGenerationResult {
  success: boolean;
  data?: {
    pdfContent: string;
    filename: string;
  };
  error?: string;
}

export interface SearchResult {
  success: boolean;
  data?: DeclarationSearchResult[];
  error?: string;
}

export interface PersonData {
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

export interface DeclarationData {
  id: string;
  date: string;
  city: string;
  state: string;
  unionStartDate: string;
  propertyRegime: string;
  registrarName: string;
  stamp?: string;
  firstPerson: PersonData;
  secondPerson: PersonData;
}