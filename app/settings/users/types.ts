import { Role, ActivationStatus } from '@prisma/client';

export type RoleLabel = 'Admin' | 'Usuário';
export type StatusLabel = 'Ativo' | 'Inativo';

export interface IUser {
  id: number;
  taxpayerId: string;
  name: string;
  email: string;
  role: RoleLabel;
  status: StatusLabel;
}

export interface UserFormValues {
  name: string;
  email: string;
  role: Role;
  status: ActivationStatus;
  taxpayerId?: string;
}

export interface Field {
  name: keyof UserFormValues;
  label: string;
  type: 'text' | 'email' | 'select';
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
}

export interface UsersTableClientProps {
  usersData: IUser[];
}

export interface EditFormValues {
  id: number;
  name: string;
  email: string;
  role: Role;
  status: ActivationStatus;
  taxpayerId?: string;
}

export interface FieldEdit {
  name: keyof EditFormValues;
  label: string;
  type: 'text' | 'email' | 'select' | 'hidden';
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
}

export interface UpdateUserDataInput {
  id: number;
  name: string;
  email: string;
  role: Role;
  status: ActivationStatus;
}

export interface IAvailabilityResponse {
  available: boolean;
  message?: string;
}

export interface BulkParams {
  userHistoryIds: number[];
}

export interface ICheckResult {
  id: number;
  version: number;
  userId: number;
  name: string;
  email: string;
  role: Role;
  status: ActivationStatus;
}
