export type PropertyRegime = 'COMUNHAO_PARCIAL' | 'SEPARACAO_TOTAL' | 'PARTICIPACAO_FINAL' | 'COMUNHAO_UNIVERSAL';

export interface Person {
  name: string;
  nationality: string;
  civilStatus: string;
  typeRegistry: string;
  RegistrationStatus: string;
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

export interface Declaration {
  date: string;
  city: string;
  state: string;
  firstPerson: Person;
  secondPerson: Person;
  unionStartDate: string;
  propertyRegime: PropertyRegime;
  pactDate?: string;
  pactOffice?: string;
  pactBook?: string;
  pactPage?: string;
  pactTerm?: string;
  registrarName: string;
}