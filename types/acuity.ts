export interface AcuityFormField {
    fieldID: string;
    value: string;
    name?: string;
    type?: string;
  }
  
  export interface AcuityForm {
    id: string;
    values: AcuityFormField[];
  }
  
  export interface AcuityClient {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    forms?: AcuityForm[];
  }
  
  export interface MappedPerson {
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
  }
  
  export interface MappedDeclaration {
    unionStartDate: string;
    firstPerson: MappedPerson;
    secondPerson: MappedPerson;
  }
  
  export interface MappedClient {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    declaration: MappedDeclaration;
  }
  
  export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }