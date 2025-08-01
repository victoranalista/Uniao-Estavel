export interface ClientData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  declaration: MappedDeclaration;
}

export interface MappedDeclaration {
  unionStartDate: string;
  firstPerson: MappedPerson;
  secondPerson: MappedPerson;
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

export interface RegistrationData {
  id: string;
  protocolNumber: string;
  firstPersonName: string;
  secondPersonName: string;
  unionDate: string;
  bookNumber: string;
  pageNumber: string;
  termNumber: string;
}

export interface SearchResult<T = unknown> {
  total: number;
  data?: T;
}