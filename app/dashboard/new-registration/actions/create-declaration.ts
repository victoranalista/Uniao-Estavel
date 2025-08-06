'use server';
import { isValidTaxpayerId } from '@/lib/validators';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { generatePdfAction } from '@/lib/pdf-generator';
import { getNextBookNumbers } from '@/utils/bookControl';

interface PersonData {
  name: string;
  nationality: string;
  civilStatus: string;
  birthDate: string;
  birthPlaceState: string;
  birthPlaceCity: string;
  profession: string;
  rg: string;
  taxpayerId: string;
  address: string;
  email: string;
  phone: string;
  fatherName: string;
  motherName: string;
  registryOffice: string;
  registryBook: string;
  registryPage: string;
  registryTerm: string;
  typeRegistry: string;
  divorceDate?: string;
  newName?: string;
}

interface DeclarationFormData {
  date: string;
  city: string;
  state: string;
  unionStartDate: string;
  propertyRegime: string;
  registrarName: string;
  stamp?: string;
  pactDate?: string;
  pactOffice?: string;
  pactBook?: string;
  pactPage?: string;
  pactTerm?: string;
  firstPerson: PersonData;
  secondPerson: PersonData;
}

interface CreateResult {
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

const validateRequiredFields = (data: DeclarationFormData): string | null => {
  if (!data.firstPerson.name?.trim())
    return 'Nome do primeiro declarante é obrigatório';
  if (!data.firstPerson.taxpayerId?.trim())
    return 'CPF do primeiro declarante é obrigatório';
  if (!data.firstPerson.birthDate?.trim())
    return 'Data de nascimento do primeiro declarante é obrigatória';
  if (!data.secondPerson.name?.trim())
    return 'Nome do segundo declarante é obrigatório';
  if (!data.secondPerson.taxpayerId?.trim())
    return 'CPF do segundo declarante é obrigatório';
  if (!data.secondPerson.birthDate?.trim())
    return 'Data de nascimento do segundo declarante é obrigatória';
  if (!data.unionStartDate?.trim())
    return 'Data de início da união é obrigatória';
  return null;
};

const validateTaxpayerIds = (data: DeclarationFormData): string | null => {
  if (!isValidTaxpayerId(data.firstPerson.taxpayerId))
    return 'CPF do primeiro declarante inválido';
  if (!isValidTaxpayerId(data.secondPerson.taxpayerId))
    return 'CPF do segundo declarante inválido';
  return null;
};

const createBirthPlace = (person: PersonData): string =>
  `${person.birthPlaceCity}/${person.birthPlaceState}`;

const formatPdfData = (data: DeclarationFormData) => ({
  city: data.city,
  state: data.state,
  stamp: data.stamp,
  unionStartDate: data.unionStartDate,
  propertyRegime: data.propertyRegime,
  registrarName: data.registrarName,
  pactDate: data.pactDate,
  pactOffice: data.pactOffice,
  pactBook: data.pactBook,
  pactPage: data.pactPage,
  pactTerm: data.pactTerm,
  firstPerson: {
    ...data.firstPerson,
    birthPlace: createBirthPlace(data.firstPerson)
  },
  secondPerson: {
    ...data.secondPerson,
    birthPlace: createBirthPlace(data.secondPerson)
  }
});

const createDeclarationRecord = async (
  data: DeclarationFormData,
  bookNumbers: { book: string; term: string }
) => {
  return await prisma.declaration.create({
    data: {
      status: 'ACTIVE',
      declarationDate: new Date(data.date),
      unionStartDate: new Date(data.unionStartDate),
      propertyRegime: data.propertyRegime,
      city: data.city,
      state: data.state,
      termNumber: bookNumbers.term,
      bookNumber: bookNumbers.book,
      createdAt: new Date(),
      updatedAt: new Date(),
      registryInfo: {
        create: {
          typeRegistry: data.firstPerson.typeRegistry,
          registrarName: data.registrarName
        }
      },
      ...(data.pactDate && {
        prenuptial: {
          create: {
            pactDate: data.pactDate ? new Date(data.pactDate) : null,
            pactOffice: data.pactOffice,
            pactBook: data.pactBook,
            pactPage: data.pactPage,
            pactTerm: data.pactTerm
          }
        }
      })
    },
    select: { id: true }
  });
};

const handlePdfGeneration = async (
  pdfData: ReturnType<typeof formatPdfData>,
  bookNumbers: { book: string; term: string }
) => {
  const pdfResult = await generatePdfAction(pdfData, bookNumbers);
  if (!pdfResult.success) {
    const errorMessage =
      'error' in pdfResult ? pdfResult.error : 'Erro ao gerar PDF';
    return { success: false as const, error: errorMessage };
  }
  if ('pdfContent' in pdfResult && 'filename' in pdfResult)
    return {
      success: true as const,
      pdfContent: pdfResult.pdfContent,
      filename: pdfResult.filename
    };
  return { success: false as const, error: 'Dados do PDF incompletos' };
};

export const createDeclarationAction = async (
  data: DeclarationFormData
): Promise<CreateResult> => {
  const session = await auth();
  if (!session?.user) return { success: false, message: 'Sessão inválida' };
  const fieldValidation = validateRequiredFields(data);
  if (fieldValidation) return { success: false, message: fieldValidation };
  const taxpayerIdValidation = validateTaxpayerIds(data);
  if (taxpayerIdValidation)
    return { success: false, message: taxpayerIdValidation };
  try {
    const bookNumbers = await getNextBookNumbers();
    const pdfData = formatPdfData(data);
    const pdfResult = await handlePdfGeneration(pdfData, bookNumbers);
    if (!pdfResult.success) return { success: false, message: pdfResult.error };
    const declaration = await createDeclarationRecord(data, bookNumbers);
    return {
      success: true,
      data: {
        id: declaration.id,
        pdfContent: pdfResult.pdfContent,
        filename: pdfResult.filename,
        book: bookNumbers.book,
        term: bookNumbers.term
      }
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : 'Erro interno do servidor'
    };
  }
};
