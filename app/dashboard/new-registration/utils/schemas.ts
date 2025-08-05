import { z } from 'zod';
import { validatetaxpayerId } from '@/lib/validators';

const cleanCpfForValidation = (value: string): boolean => {
  const cleanCpf = value.replace(/\D/g, '');
  return validatetaxpayerId(cleanCpf);
};

const personSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  nationality: z.string().min(1, 'Nacionalidade é obrigatória'),
  civilStatus: z.string().min(1, 'Estado civil é obrigatório'),
  birthDate: z.string().min(1, 'Data de nascimento é obrigatória'),
  birthPlaceState: z.string().min(1, 'Estado de nascimento é obrigatório'),
  birthPlaceCity: z.string().min(1, 'Cidade de nascimento é obrigatória'),
  profession: z.string().min(1, 'Profissão é obrigatória'),
  rg: z.string().min(1, 'RG é obrigatório'),
  taxpayerId: z.string()
    .min(1, 'CPF é obrigatório')
    .refine((value) => {
      const cleanCpf = value.replace(/\D/g, '');
      return cleanCpf.length === 11;
    }, 'CPF deve ter 11 dígitos')
    .refine(cleanCpfForValidation, 'CPF inválido'),
  address: z.string().min(1, 'Endereço é obrigatório'),
  email: z.email('Email inválido'),
  phone: z.string().min(1, 'Telefone é obrigatório'),
  fatherName: z.string().min(1, 'Nome do pai é obrigatório'),
  motherName: z.string().min(1, 'Nome da mãe é obrigatório'),
  registryOffice: z.string().min(1, 'Cartório é obrigatório'),
  registryBook: z.string().min(1, 'Livro é obrigatório'),
  registryPage: z.string().min(1, 'Folha é obrigatória'),
  registryTerm: z.string().min(1, 'Termo é obrigatório'),
  typeRegistry: z.string().min(1, 'Tipo de registro é obrigatório'),
  divorceDate: z.string().optional(),
  newName: z.string().optional(),
});

export const declarationFormSchema = z.object({
  date: z.string().min(1, 'Data é obrigatória'),
  city: z.string().min(1, 'Cidade é obrigatória'),
  state: z.string().min(1, 'Estado é obrigatório'),
  unionStartDate: z.string().min(1, 'Data de início da união é obrigatória'),
  propertyRegime: z.enum(['COMUNHAO_PARCIAL', 'SEPARACAO_TOTAL', 'PARTICIPACAO_FINAL', 'COMUNHAO_UNIVERSAL']),
  registrarName: z.string().min(1, 'Nome do registrador é obrigatório'),
  stamp: z.string().optional(),
  pactDate: z.string().optional(),
  pactOffice: z.string().optional(),
  pactBook: z.string().optional(),
  pactPage: z.string().optional(),
  pactTerm: z.string().optional(),
  firstPerson: personSchema,
  secondPerson: personSchema,
});

export type PersonData = z.infer<typeof personSchema>;
export type DeclarationFormData = z.infer<typeof declarationFormSchema>;