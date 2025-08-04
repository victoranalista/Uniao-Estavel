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

export interface DeclarationFormData {
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
  firstPerson: PersonFormData;
  secondPerson: PersonFormData;
}

export type PropertyRegime = 
  | 'COMUNHAO_PARCIAL' 
  | 'SEPARACAO_TOTAL' 
  | 'PARTICIPACAO_FINAL' 
  | 'COMUNHAO_UNIVERSAL';

export interface PropertyRegimeOption {
  value: PropertyRegime;
  label: string;
}

export interface DeclarationActionResult {
  success: boolean;
  error?: string;
  data?: {
    pdfContent?: string;
    filename?: string;
    declarationId?: string;
  };
}

export interface FormSubmissionProps {
  declarationId?: string;
  onSuccess?: () => void;
}

export interface MaskedInputProps {
  mask: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  disabled?: boolean;
}

export interface GenderState {
  gender: 'M' | 'F';
  toggleGender: () => void;
}

export interface LocationData {
  states: string[];
  cities: string[];
  isLoading: boolean;
}

export interface ValidationError {
  field: string;
  message: string;
}