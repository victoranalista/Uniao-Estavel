import { validatetaxpayerId } from '@/lib/validators';
import { z } from 'zod';
import { Role, ActivationStatus } from '@prisma/client';
import { UserFormValues } from '../types';

const RoleEnum = [Role.ADMIN, Role.USER] as const;
const StatusEnum = [
  ActivationStatus.ACTIVE,
  ActivationStatus.INACTIVE
] as const;

export const validationSchema = z
  .object({
    name: z
      .string({
        error: (issue) =>
          issue.code === 'invalid_type' || issue.code === 'too_small'
            ? 'O nome é obrigatório'
            : undefined
      })
      .min(1, 'O nome é obrigatório'),
    email: z.email('Email inválido'),
    role: z.enum(RoleEnum, {
      error: () => 'Selecione uma permissão válida'
    }),
    status: z.enum(StatusEnum, {
      error: () => 'Selecione um status válido'
    }),
    taxpayerId: z.string().optional()
  })
  .check((ctx) => {
    const { role, taxpayerId } = ctx.value;
    if (role === Role.ADMIN || role === Role.USER) {
      if (!taxpayerId) {
        ctx.issues.push({
          code: 'custom',
          message: 'taxpayerId é obrigatório',
          path: ['taxpayerId'],
          input: taxpayerId
        });
      } else if (!/^[0-9]{11}$/.test(taxpayerId)) {
        ctx.issues.push({
          code: 'custom',
          message: 'taxpayerId deve conter 11 dígitos numéricos',
          path: ['taxpayerId'],
          input: taxpayerId
        });
      } else if (!validatetaxpayerId(taxpayerId)) {
        ctx.issues.push({
          code: 'custom',
          message: 'taxpayerId inválido',
          path: ['taxpayerId'],
          input: taxpayerId
        });
      }
    }
  })
  .transform((data) => {
    const result: UserFormValues = {
      name: data.name,
      email: data.email,
      role: data.role,
      status: data.status,
      taxpayerId:
        data.role === Role.ADMIN || data.role === Role.USER
          ? (data.taxpayerId ?? '')
          : ''
    };
    return result;
  });

export default validationSchema;
