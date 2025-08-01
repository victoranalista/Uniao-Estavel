import { z } from 'zod';
import { validatetaxpayerId } from '@/utils/validators';

const personFormSchema = z.object({
  name: z.string().min(1, 'Nome obrigatório'),
  nationality: z.string().min(1, 'Nacionalidade obrigatória'),
  civilStatus: z.string().min(1, 'Estado civil obrigatório'),
  birthDate: z.string().min(1, 'Data de nascimento obrigatória'),
  birthPlaceState: z.string().min(1, 'Estado de nascimento obrigatório'),
  birthPlaceCity: z.string().min(1, 'Cidade de nascimento obrigatória'),
  profession: z.string().min(1, 'Profissão obrigatória'),
  rg: z.string().min(1, 'RG obrigatório'),
  taxpayerId: z.string().min(11, 'CPF deve ter pelo menos 11 dígitos').refine(validatetaxpayerId, 'CPF inválido'),
  address: z.string().min(1, 'Endereço obrigatório'),
  email: z.email('Email inválido'),
  phone: z.string().min(1, 'Telefone obrigatório'),
  fatherName: z.string().min(1, 'Nome do pai obrigatório'),
  motherName: z.string().min(1, 'Nome da mãe obrigatório'),
  registryOffice: z.string().min(1, 'Cartório obrigatório'),
  registryBook: z.string().min(1, 'Livro obrigatório'),
  registryPage: z.string().min(1, 'Página obrigatória'),
  registryTerm: z.string().min(1, 'Termo obrigatório'),
  divorceDate: z.string().optional(),
  newName: z.string().optional()
});

export const declarationFormSchema = z.object({
  date: z.string().min(1, 'Data obrigatória'),
  city: z.string().min(1, 'Cidade obrigatória'),
  state: z.string().min(1, 'Estado obrigatório'),
  unionStartDate: z.string().min(1, 'Data de início da união obrigatória'),
  propertyRegime: z.enum(['COMUNHAO_PARCIAL', 'SEPARACAO_TOTAL', 'PARTICIPACAO_FINAL', 'COMUNHAO_UNIVERSAL']),
  registrarName: z.string().min(1, 'Nome do registrador obrigatório'),
  stamp: z.string().optional(),
  pactDate: z.string().optional(),
  pactOffice: z.string().optional(),
  pactBook: z.string().optional(),
  pactPage: z.string().optional(),
  pactTerm: z.string().optional(),
  firstPerson: personFormSchema,
  secondPerson: personFormSchema,
});

const personApiSchema = z.object({
  name: z.string().min(1, 'Nome obrigatório'),
  nationality: z.string().min(1, 'Nacionalidade obrigatória'),
  civilStatus: z.string().min(1, 'Estado civil obrigatório'),
  birthDate: z.string().pipe(z.coerce.date()),
  birthPlaceState: z.string().min(1, 'Estado de nascimento obrigatório'),
  birthPlaceCity: z.string().min(1, 'Cidade de nascimento obrigatória'),
  profession: z.string().min(1, 'Profissão obrigatória'),
  rg: z.string().min(1, 'RG obrigatório'),
  taxpayerId: z.string().min(11, 'CPF deve ter pelo menos 11 dígitos').refine(validatetaxpayerId, 'CPF inválido'),
  address: z.string().min(1, 'Endereço obrigatório'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(1, 'Telefone obrigatório'),
  fatherName: z.string().min(1, 'Nome do pai obrigatório'),
  motherName: z.string().min(1, 'Nome da mãe obrigatório'),
  registryOffice: z.string().min(1, 'Cartório obrigatório'),
  registryBook: z.string().min(1, 'Livro obrigatório'),
  registryPage: z.string().min(1, 'Página obrigatória'),
  registryTerm: z.string().min(1, 'Termo obrigatório'),
  divorceDate: z.string().optional().transform(str => str ? new Date(str) : undefined),
  newName: z.string().optional()
});

export const declarationSchema = z.object({
  date: z.string().pipe(z.coerce.date()),
  city: z.string().min(1, 'Cidade obrigatória'),
  state: z.string().min(1, 'Estado obrigatório'),
  unionStartDate: z.string().pipe(z.coerce.date()),
  propertyRegime: z.enum(['COMUNHAO_PARCIAL', 'SEPARACAO_TOTAL', 'PARTICIPACAO_FINAL', 'COMUNHAO_UNIVERSAL']),
  registrarName: z.string().min(1, 'Nome do registrador obrigatório'),
  stamp: z.string().optional(),
  pactDate: z.string().optional().transform(str => str ? new Date(str) : undefined),
  pactOffice: z.string().optional(),
  pactBook: z.string().optional(),
  pactPage: z.string().optional(),
  pactTerm: z.string().optional(),
  firstPerson: personApiSchema,
  secondPerson: personApiSchema,
});

export type PersonFormData = z.infer<typeof personFormSchema>;
export type DeclarationFormData = z.infer<typeof declarationFormSchema>;
export type PersonData = z.infer<typeof personApiSchema>;
export type DeclarationData = z.infer<typeof declarationSchema>;

const areSameTaxpayerId = (first: PersonData, second: PersonData) => 
  first.taxpayerId === second.taxpayerId;

export const validatePersonData = (data: PersonFormData): PersonData => 
  personApiSchema.parse(data);

export const validateDeclarationData = (data: DeclarationFormData): DeclarationData => 
  declarationSchema.parse(data);

export const validateUniqueDeclarants = (firstPerson: PersonData, secondPerson: PersonData): void => {
  if (areSameTaxpayerId(firstPerson, secondPerson))
    throw new Error('Os declarantes não podem ter o mesmo CPF');
};