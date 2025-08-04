export * from '@/lib/utils';

export interface DeclarationFormData {
  partner1Name: string;
  partner1TaxpayerId: string;
  partner1BirthDate: string;
  partner2Name: string;
  partner2TaxpayerId: string;
  partner2BirthDate: string;
  marriageDate: string;
  propertyRegime: string;
  city: string;
  state: string;
}

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

export interface PropertyRegimeOption {
  value: string;
  label: string;
}