import { UseFormReturn, FieldPath } from 'react-hook-form';
import { DeclarationFormData } from '../utils/schemas';

export interface Declaration {
  id: string;
  partner1Name: string;
  partner1TaxpayerId: string;
  partner1BirthDate: Date;
  partner2Name: string;
  partner2TaxpayerId: string;
  partner2BirthDate: Date;
  marriageDate: Date;
  propertyRegime: string;
  city: string;
  state: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface MaskedInputProps {
  mask: string;
  value?: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  className?: string;
}

export interface DeclarationActionResult {
  success: boolean;
  data?: { 
    id: string;
    pdfContent?: string;
    filename?: string;
    book?: string;
    term?: string;
  };
  message?: string;
}

export type { DeclarationFormData, PersonData } from '../utils/schemas';

export interface FormSubmissionProps {
  onSubmit?: (data: DeclarationFormData) => Promise<void>;
  initialData?: Partial<DeclarationFormData>;
  userName?: string;
}

export interface GenderState {
  gender: 'M' | 'F';
  toggleGender: () => void;
}

export interface PropertyRegimeOption {
  value: string;
  label: string;
}

export interface TextInputFieldProps {
  form: UseFormReturn<DeclarationFormData>;
  name: FieldPath<DeclarationFormData>;
  label: string;
  required?: boolean;
  mask?: string;
}

export interface DateInputFieldProps {
  form: UseFormReturn<DeclarationFormData>;
  name: FieldPath<DeclarationFormData>;
  label: string;
  required?: boolean;
}

export interface LocationSelectFieldProps {
  form: UseFormReturn<DeclarationFormData>;
  name: FieldPath<DeclarationFormData>;
  label: string;
  options: string[];
  isLoading: boolean;
  disabled?: boolean;
  placeholder: string;
}

export interface StateSelectFieldProps {
  form: UseFormReturn<DeclarationFormData>;
  name: FieldPath<DeclarationFormData>;
  label: string;
  states: string[];
  isLoading: boolean;
}

export interface CitySelectFieldProps {
  form: UseFormReturn<DeclarationFormData>;
  stateFieldName: FieldPath<DeclarationFormData>;
  cityFieldName: FieldPath<DeclarationFormData>;
  label: string;
  cities: string[];
  isLoading: boolean;
}

export interface PersonSectionProps {
  form: UseFormReturn<DeclarationFormData>;
  prefix: 'firstPerson' | 'secondPerson';
  title: string;
  icon: React.ReactNode;
  states: string[];
  cities: string[];
  isStatesLoading: boolean;
  isCitiesLoading: boolean;
}

export interface SelectFieldProps {
  form: UseFormReturn<DeclarationFormData>;
  name: FieldPath<DeclarationFormData>;
  label: string;
  options: readonly string[];
  placeholder?: string;
}

export interface GenderSelectFieldProps {
  form: UseFormReturn<DeclarationFormData>;
  prefix: 'firstPerson' | 'secondPerson';
  label: string;
  fieldType: 'nationality' | 'civilStatus';
}