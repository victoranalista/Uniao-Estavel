export interface Registration {
  id: string;
  protocolNumber: string;
  bookNumber: string;
  pageNumber: number;
  termNumber: number;
  registrationDate: string;
  unionDate: string;
  firstPersonName: string;
  secondPersonName: string;
  status: 'active' | 'updated' | 'cancelled';
  declaration: string; 
  createdAt: string;
  updatedAt: string;
}

export interface RegistrationSearch {
  protocolNumber?: string;
  firstPersonName?: string;
  secondPersonName?: string;
  unionDate?: string;
  bookNumber?: string;
  pageNumber?: number;
  termNumber?: number;
}