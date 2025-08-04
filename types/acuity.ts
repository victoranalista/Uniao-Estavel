export interface AcuityFormField {
  fieldID: string;
  value: string;
}

export interface AcuityForm {
  id: string;
  name: string;
  values: AcuityFormField[];
}

export interface AcuityClient {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  forms: AcuityForm[];
}

export interface AcuityPersonData {
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

export interface AcuityDeclarationData {
  unionStartDate: string;
  firstPerson: AcuityPersonData;
  secondPerson: AcuityPersonData;
}

export interface MappedClient {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  declaration: AcuityDeclarationData;
}

export interface AcuityApiResponse<T = unknown> {
  data?: T;
  error?: string;
  statusCode?: number;
}

export interface AcuityErrorDetails {
  message: string;
  statusCode: number;
  details?: string;
}