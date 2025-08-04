'use server';
import { prisma } from '@/lib/prisma';
import { generatePdfAction } from '@/lib/pdf-generator';
import { declarationFormSchema } from '../utils/schemas';
import { DeclarationActionResult } from '../types';
import { requireSession } from '@/lib/requireSession';
import { Role } from '@prisma/client';
import { cleanTaxpayerId } from '../utils/constants';
import { getNextBookNumbers } from '@/utils/bookControl';

const validateFormData = async (formData: FormData) => {
  const data = Object.fromEntries(formData.entries());
  return declarationFormSchema.parseAsync({
    date: data.date,
    city: data.city,
    state: data.state,
    unionStartDate: data.unionStartDate,
    propertyRegime: data.propertyRegime,
    registrarName: data.registrarName,
    stamp: data.stamp || undefined,
    pactDate: data.pactDate || undefined,
    pactOffice: data.pactOffice || undefined,
    pactBook: data.pactBook || undefined,
    pactPage: data.pactPage || undefined,
    pactTerm: data.pactTerm || undefined,
    firstPerson: {
      name: data.firstPersonName,
      nationality: data.firstPersonNationality,
      civilStatus: data.firstPersonCivilStatus,
      birthDate: data.firstPersonBirthDate,
      birthPlaceState: data.firstPersonBirthPlaceState,
      birthPlaceCity: data.firstPersonBirthPlaceCity,
      profession: data.firstPersonProfession,
      rg: data.firstPersonRg,
      taxpayerId: data.firstPersonTaxpayerId,
      address: data.firstPersonAddress,
      email: data.firstPersonEmail,
      phone: data.firstPersonPhone,
      fatherName: data.firstPersonFatherName,
      motherName: data.firstPersonMotherName,
      registryOffice: data.firstPersonRegistryOffice,
      registryBook: data.firstPersonRegistryBook,
      registryPage: data.firstPersonRegistryPage,
      registryTerm: data.firstPersonRegistryTerm,
      typeRegistry: data.firstPersonTypeRegistry,
      divorceDate: data.firstPersonDivorceDate || undefined,
      newName: data.firstPersonNewName || undefined,
    },
    secondPerson: {
      name: data.secondPersonName,
      nationality: data.secondPersonNationality,
      civilStatus: data.secondPersonCivilStatus,
      birthDate: data.secondPersonBirthDate,
      birthPlaceState: data.secondPersonBirthPlaceState,
      birthPlaceCity: data.secondPersonBirthPlaceCity,
      profession: data.secondPersonProfession,
      rg: data.secondPersonRg,
      taxpayerId: data.secondPersonTaxpayerId,
      address: data.secondPersonAddress,
      email: data.secondPersonEmail,
      phone: data.secondPersonPhone,
      fatherName: data.secondPersonFatherName,
      motherName: data.secondPersonMotherName,
      registryOffice: data.secondPersonRegistryOffice,
      registryBook: data.secondPersonRegistryBook,
      registryPage: data.secondPersonRegistryPage,
      registryTerm: data.secondPersonRegistryTerm,
      typeRegistry: data.secondPersonTypeRegistry,
      divorceDate: data.secondPersonDivorceDate || undefined,
      newName: data.secondPersonNewName || undefined,
    },
  });
};

const findOrCreatePersonRecord = async (personData: any) => {
  const cleanedTaxId = cleanTaxpayerId(personData.taxpayerId);
  
  const existingPerson = await prisma.person.findFirst({
    where: {
      identity: { taxId: cleanedTaxId },
      deletedAt: null
    },
    include: {
      identity: true,
      civilStatuses: true,
      addresses: true,
      contact: true,
      documents: true,
      family: true,
      professional: true,
      registry: true
    }
  });

  if (existingPerson) return existingPerson;

  return prisma.person.create({
    data: {
      identity: {
        create: {
          fullName: personData.name,
          nationality: personData.nationality,
          birthDate: new Date(personData.birthDate),
          birthPlace: `${personData.birthPlaceCity}, ${personData.birthPlaceState}`,
          taxId: cleanedTaxId,
        },
      },
      civilStatuses: {
        create: {
          status: personData.civilStatus,
        },
      },
      addresses: {
        create: {
          street: personData.address,
          number: '',
          neighborhood: '',
          city: personData.birthPlaceCity,
          state: personData.birthPlaceState,
        },
      },
      contact: {
        create: {
          email: personData.email,
          phone: personData.phone,
        },
      },
      documents: {
        create: {
          rg: personData.rg,
        },
      },
      family: {
        create: {
          fatherName: personData.fatherName,
          motherName: personData.motherName,
        },
      },
      professional: {
        create: {
          profession: personData.profession,
        },
      },
      registry: {
        create: {
          registryOffice: personData.registryOffice,
          registryBook: personData.registryBook,
          registryPage: personData.registryPage,
          registryTerm: personData.registryTerm,
        },
      },
    },
  });
};

const createDeclarationRecord = async (validatedData: any, firstPersonId: string, secondPersonId: string) => {
  const { book, term } = await getNextBookNumbers();
  
  return prisma.declaration.create({
    data: {
      declarationDate: new Date(validatedData.date),
      city: validatedData.city,
      state: validatedData.state,
      unionStartDate: new Date(validatedData.unionStartDate),
      propertyRegime: validatedData.propertyRegime,
      termNumber: term,
      bookNumber: book,
      participants: {
        createMany: {
          data: [
            { personId: firstPersonId },
            { personId: secondPersonId },
          ],
        },
      },
      registryInfo: {
        create: {
          registryOffice: 'Cartório Colorado - 8º Ofício',
          typeRegistry: 'União Estável',
          registrarName: validatedData.registrarName,
        },
      },
      ...(validatedData.pactDate && {
        prenuptial: {
          create: {
            pactDate: validatedData.pactDate ? new Date(validatedData.pactDate) : null,
            pactOffice: validatedData.pactOffice,
            pactBook: validatedData.pactBook,
            pactPage: validatedData.pactPage,
            pactTerm: validatedData.pactTerm,
          },
        },
      }),
    },
  });
};

export const createDeclarationAction = async (formData: FormData): Promise<DeclarationActionResult> => {
  try {
    await requireSession([Role.ADMIN, Role.USER]);
    const validatedData = await validateFormData(formData);
    const result = await prisma.$transaction(async (tx) => {
      const firstPerson = await findOrCreatePersonRecord(validatedData.firstPerson);
      const secondPerson = await findOrCreatePersonRecord(validatedData.secondPerson);
      const declaration = await createDeclarationRecord(validatedData, firstPerson.id, secondPerson.id);
      return { declaration, firstPerson, secondPerson };
    });
    const pdfResult = await generatePdfAction({
      ...validatedData,
      firstPerson: {
        ...validatedData.firstPerson,
        birthPlace: `${validatedData.firstPerson.birthPlaceCity}, ${validatedData.firstPerson.birthPlaceState}`,
        taxpayerId: validatedData.firstPerson.taxpayerId,
      },
      secondPerson: {
        ...validatedData.secondPerson,
        birthPlace: `${validatedData.secondPerson.birthPlaceCity}, ${validatedData.secondPerson.birthPlaceState}`,
        taxpayerId: validatedData.secondPerson.taxpayerId,
      },
    });
    if (!pdfResult.success) {
      return { success: false, error: 'Erro ao gerar PDF' };
    }
    return {
      success: true,
      data: {
        declarationId: result.declaration.id,
        pdfContent: 'pdfContent' in pdfResult ? pdfResult.pdfContent : undefined,
        filename: 'filename' in pdfResult ? pdfResult.filename : undefined,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro interno do servidor',
    };
  }
};