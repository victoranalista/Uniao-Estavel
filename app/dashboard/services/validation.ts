'use server';

import { z } from 'zod';
import { validatetaxpayerId } from '@/utils/validators';
import { PropertyRegime, PersonInput, DeclarationInput, PdfData, PdfPersonData } from '@/types/declarations';

const personSchema = z.object({
  name: z.string().min(2),
  nationality: z.string(),
  civilStatus: z.string(),
  birthDate: z.string(),
  birthPlaceState: z.string(),
  birthPlaceCity: z.string(),
  profession: z.string(),
  rg: z.string(),
  taxpayerId: z.string().refine(validatetaxpayerId),
  address: z.string(),
  email: z.string().email(),
  phone: z.string(),
  fatherName: z.string(),
  motherName: z.string(),
  registryOffice: z.string(),
  registryBook: z.string(),
  registryPage: z.string(),
  registryTerm: z.string(),
  divorceDate: z.string().optional(),
  newName: z.string().optional(),
});

const declarationSchema = z.object({
  date: z.string(),
  city: z.string(),
  state: z.string(),
  unionStartDate: z.string(),
  propertyRegime: z.enum(['COMUNHAO_PARCIAL', 'SEPARACAO_TOTAL', 'PARTICIPACAO_FINAL', 'COMUNHAO_UNIVERSAL']),
  registrarName: z.string(),
  stamp: z.string().optional(),
  pactDate: z.string().optional(),
  pactOffice: z.string().optional(),
  pactBook: z.string().optional(),
  pactPage: z.string().optional(),
  pactTerm: z.string().optional(),
  firstPerson: personSchema,
  secondPerson: personSchema,
});

export const validateDeclarationData = (data: unknown) => declarationSchema.parse(data);

export const validatePersonData = personSchema;

export const convertFormDataToObject = (formData: FormData): Record<string, unknown> => {
  const rawData: Record<string, unknown> = {};
  formData.forEach((value, key) => {
    if (key.includes('.')) {
      const keys = key.split('.');
      let current = rawData;
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]] as Record<string, unknown>;
      }
      current[keys[keys.length - 1]] = value;
    } else {
      rawData[key] = value;
    }
  });
  return rawData;
};

export const combineBirthPlace = (state: string, city: string): string => `${city}, ${state}`;

export const validateUniqueDeclarants = (firstPerson: PersonInput, secondPerson: PersonInput) => {
  if (firstPerson.taxpayerId === secondPerson.taxpayerId)
    throw new Error('Os declarantes não podem ter o mesmo CPF');
};

export const mapPersonToPdf = (person: z.infer<typeof personSchema>): PdfPersonData => ({
  name: person.name,
  cpf: person.taxpayerId,
  nationality: person.nationality,
  civilStatus: person.civilStatus,
  birthDate: person.birthDate,
  birthPlace: combineBirthPlace(person.birthPlaceState, person.birthPlaceCity),
  profession: person.profession,
  rg: person.rg,
  address: person.address,
  email: person.email,
  phone: person.phone,
  fatherName: person.fatherName,
  motherName: person.motherName,
  registryOffice: person.registryOffice,
  registryBook: person.registryBook,
  registryPage: person.registryPage,
  registryTerm: person.registryTerm,
  typeRegistry: 'NASCIMENTO',
  divorceDate: person.divorceDate,
  newName: person.newName,
  birthPlaceState: '',
  birthPlaceCity: '',
  taxpayerId: ''
});

export const mapDeclarationToPdf = (data: DeclarationInput): PdfData => ({
  originalDate: data.date,
  city: data.city,
  state: data.state,
  stamp: data.stamp,
  firstPerson: mapPersonToPdf(data.firstPerson),
  secondPerson: mapPersonToPdf(data.secondPerson),
  unionStartDate: data.unionStartDate,
  propertyRegime: data.propertyRegime,
  registrarName: data.registrarName,
  pactDate: data.pactDate,
  pactOffice: data.pactOffice,
  pactBook: data.pactBook,
  pactPage: data.pactPage,
  pactTerm: data.pactTerm,
  date: ''
});

type DatabaseDeclaration = {
  date: string;
  city: string;
  state: string;
  unionStartDate: string;
  propertyRegime: PropertyRegime;
  registrarName?: string;
  stamp?: string;
  registryInfo?: { registrarName: string };
  prenuptial?: {
    pactDate?: string;
    pactOffice?: string;
    pactBook?: string;
    pactPage?: string;
    pactTerm?: string;
  };
  participants?: PersonInput[];
  firstPerson?: PersonInput;
  secondPerson?: PersonInput;
};

export const mapDatabaseToDeclarationInput = (dbData: DatabaseDeclaration): DeclarationInput => ({
  date: dbData.date,
  city: dbData.city,
  state: dbData.state,
  unionStartDate: dbData.unionStartDate,
  propertyRegime: dbData.propertyRegime,
  registrarName: dbData.registryInfo?.registrarName || dbData.registrarName || '',
  stamp: dbData.stamp || '',
  pactDate: dbData.prenuptial?.pactDate,
  pactOffice: dbData.prenuptial?.pactOffice,
  pactBook: dbData.prenuptial?.pactBook,
  pactPage: dbData.prenuptial?.pactPage,
  pactTerm: dbData.prenuptial?.pactTerm,
  firstPerson: dbData.firstPerson || dbData.participants?.[0] || {} as PersonInput,
  secondPerson: dbData.secondPerson || dbData.participants?.[1] || {} as PersonInput,
});