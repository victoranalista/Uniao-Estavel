export * from '@/lib/utils';

export interface SearchFormData {
  name?: string;
  taxpayerId?: string;
}

export interface SearchResult {
  id: string;
  partner1Name: string;
  partner2Name: string;
  partner1TaxpayerId: string;
  partner2TaxpayerId: string;
  marriageDate: Date;
  createdAt: Date;
}