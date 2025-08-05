import { z } from 'zod';
import { ActivationStatus, Role } from '@prisma/client';
import { EditFormValues } from '../../types';

const RoleEnum = [Role.ADMIN, Role.USER] as const;
const StatusEnum = [
  ActivationStatus.ACTIVE,
  ActivationStatus.INACTIVE
] as const;

export const validationSchema = z
  .object({
    id: z.number({
      error: (issue) =>
        issue.code === 'invalid_type' ? 'O ID deve ser um número' : undefined
    }),
    name: z.string({
      error: (issue) =>
        issue.code === 'invalid_type' ? 'O nome é obrigatório' : undefined
    }),
    email: z.email('Email inválido'),
    role: z.enum(RoleEnum, {
      error: () => 'Selecione uma permissão válida'
    }),
    status: z.enum(StatusEnum, {
      error: () => 'Selecione um status válido'
    })
  })
  .transform((data) => {
    const result: EditFormValues = {
      id: data.id,
      name: data.name,
      email: data.email,
      role: data.role,
      status: data.status
    };
    return result;
  });

export default validationSchema;
