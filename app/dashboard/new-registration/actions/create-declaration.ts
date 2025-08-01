'use server';

import { revalidatePath } from 'next/cache';
import { requireSession } from '@/lib/requireSession';
import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';
import type { ActionResult, PrismaTransaction } from '@/types/declarations';
import { validateDeclarationData, validateUniqueDeclarants, PersonData, DeclarationData } from './schemas';
import { handleActionError } from './error-handler';
import { generatePdfAction } from '@/lib/pdf-generator';

const combineBirthPlace = (state: string, city: string) => `${city}, ${state}`;

const createPersonPrismaData = (personData: PersonData) => ({
  identity: {
    create: {
      fullName: personData.name,
      nationality: personData.nationality,
      birthDate: personData.birthDate,
      birthPlace: combineBirthPlace(personData.birthPlaceState, personData.birthPlaceCity),
      taxId: personData.taxpayerId,
    }
  },
  civilStatuses: {
    create: {
      status: personData.civilStatus,
    }
  },
  addresses: {
    create: {
      street: personData.address,
      number: "S/N",
      complement: null,
      neighborhood: "Centro",
      city: personData.birthPlaceCity,
      state: personData.birthPlaceState,
    }
  },
  contact: {
    create: {
      email: personData.email,
      phone: personData.phone,
    }
  },
  documents: {
    create: {
      rg: personData.rg,
    }
  },
  family: {
    create: {
      fatherName: personData.fatherName,
      motherName: personData.motherName,
    }
  },
  professional: {
    create: {
      profession: personData.profession,
    }
  },
  registry: {
    create: {
      registryOffice: personData.registryOffice,
      registryBook: personData.registryBook,
      registryPage: personData.registryPage,
      registryTerm: personData.registryTerm,
    }
  }
});

const findOrCreatePerson = async (tx: PrismaTransaction, personData: PersonData) => {
  const existingPerson = await tx.person.findFirst({
    where: { identity: { taxId: personData.taxpayerId } }
  });
  if (existingPerson) return existingPerson;
  return await tx.person.create({
    data: createPersonPrismaData(personData)
  });
};

const convertDeclarationToPdfData = (declaration: any, firstPerson: any, secondPerson: any, data: DeclarationData) => ({
  city: data.city,
  state: data.state,
  stamp: data.stamp,
  firstPerson: {
    name: firstPerson.identity.fullName,
    cpf: firstPerson.identity.taxId,
    nationality: firstPerson.identity.nationality,
    civilStatus: firstPerson.civilStatuses[0]?.status || 'solteiro',
    birthDate: firstPerson.identity.birthDate instanceof Date 
      ? firstPerson.identity.birthDate.toISOString().split('T')[0]
      : firstPerson.identity.birthDate,
    birthPlace: firstPerson.identity.birthPlace,
    profession: firstPerson.professional?.profession || '',
    rg: firstPerson.documents?.rg || '',
    address: firstPerson.addresses[0]?.street || '',
    email: firstPerson.contact?.email || '',
    phone: firstPerson.contact?.phone || '',
    fatherName: firstPerson.family?.fatherName || '',
    motherName: firstPerson.family?.motherName || '',
    registryOffice: firstPerson.registry?.registryOffice || '',
    registryBook: firstPerson.registry?.registryBook || '',
    registryPage: firstPerson.registry?.registryPage || '',
    registryTerm: firstPerson.registry?.registryTerm || '',
    typeRegistry: 'NASCIMENTO',
    divorceDate: data.firstPerson.divorceDate instanceof Date 
      ? data.firstPerson.divorceDate.toISOString().split('T')[0]
      : data.firstPerson.divorceDate,
    newName: data.firstPerson.newName,
  },
  secondPerson: {
    name: secondPerson.identity.fullName,
    cpf: secondPerson.identity.taxId,
    nationality: secondPerson.identity.nationality,
    civilStatus: secondPerson.civilStatuses[0]?.status || 'solteiro',
    birthDate: secondPerson.identity.birthDate instanceof Date 
      ? secondPerson.identity.birthDate.toISOString().split('T')[0]
      : secondPerson.identity.birthDate,
    birthPlace: secondPerson.identity.birthPlace,
    profession: secondPerson.professional?.profession || '',
    rg: secondPerson.documents?.rg || '',
    address: secondPerson.addresses[0]?.street || '',
    email: secondPerson.contact?.email || '',
    phone: secondPerson.contact?.phone || '',
    fatherName: secondPerson.family?.fatherName || '',
    motherName: secondPerson.family?.motherName || '',
    registryOffice: secondPerson.registry?.registryOffice || '',
    registryBook: secondPerson.registry?.registryBook || '',
    registryPage: secondPerson.registry?.registryPage || '',
    registryTerm: secondPerson.registry?.registryTerm || '',
    typeRegistry: 'NASCIMENTO',
    divorceDate: data.secondPerson.divorceDate instanceof Date 
      ? data.secondPerson.divorceDate.toISOString().split('T')[0]
      : data.secondPerson.divorceDate,
    newName: data.secondPerson.newName,
  },
  unionStartDate: data.unionStartDate instanceof Date 
    ? data.unionStartDate.toISOString().split('T')[0]
    : data.unionStartDate,
  propertyRegime: data.propertyRegime,
  registrarName: data.registrarName || 'Registrador',
  pactDate: data.pactDate instanceof Date 
    ? data.pactDate.toISOString().split('T')[0]
    : data.pactDate,
  pactOffice: data.pactOffice,
  pactBook: data.pactBook,
  pactPage: data.pactPage,
  pactTerm: data.pactTerm,
});

const generatePDFForDeclaration = async (declaration: any, firstPerson: any, secondPerson: any, data: DeclarationData) => {
  const pdfData = convertDeclarationToPdfData(declaration, firstPerson, secondPerson, data);
  const result = await generatePdfAction(pdfData);
  if (!result.success) {
    throw new Error('error' in result ? result.error : 'Erro ao gerar PDF');
  }
  return {
    pdfContent: 'pdfContent' in result ? result.pdfContent : '',
    filename: 'filename' in result ? result.filename : 'documento.pdf'
  };
};

const createDeclarationRecord = async (tx: PrismaTransaction, data: DeclarationData, firstPersonId: string, secondPersonId: string) => {
  return await tx.declaration.create({
    data: {
      declarationDate: data.date,
      city: data.city,
      state: data.state,
      unionStartDate: data.unionStartDate,
      propertyRegime: data.propertyRegime,
      registryInfo: {
        create: {
          registryOffice: data.registrarName || "Cartório",
          typeRegistry: "NASCIMENTO",
          registrarName: data.registrarName || "Registrador",
        }
      },
      prenuptial: data.pactDate ? {
        create: {
          pactDate: data.pactDate,
          pactOffice: data.pactOffice,
          pactBook: data.pactBook,
          pactPage: data.pactPage,
          pactTerm: data.pactTerm,
        }
      } : undefined,
      participants: {
        create: [
          { personId: firstPersonId },
          { personId: secondPersonId }
        ]
      }
    }
  });
};

const createDeclarationInDatabase = async (data: DeclarationData) => {
  return await prisma.$transaction(async (tx) => {
    const [firstPerson, secondPerson] = await Promise.all([
      findOrCreatePerson(tx, data.firstPerson),
      findOrCreatePerson(tx, data.secondPerson)
    ]);
    return await createDeclarationRecord(tx, data, firstPerson.id, secondPerson.id);
  }, {
    timeout: 30000
  });
};

const getFormValue = (formData: FormData, key: string) => {
  return formData.get(key)?.toString() || '';
};

const convertFormDataToDeclarationInput = (formData: FormData) => ({
  date: getFormValue(formData, 'date'),
  city: getFormValue(formData, 'city'),
  state: getFormValue(formData, 'state'),
  stamp: getFormValue(formData, 'stamp'),
  unionStartDate: getFormValue(formData, 'unionStartDate'),
  propertyRegime: getFormValue(formData, 'propertyRegime') as 'COMUNHAO_PARCIAL' | 'SEPARACAO_TOTAL' | 'PARTICIPACAO_FINAL' | 'COMUNHAO_UNIVERSAL',
  registrarName: getFormValue(formData, 'registrarName'),
  pactDate: getFormValue(formData, 'pactDate') || undefined,
  pactOffice: getFormValue(formData, 'pactOffice') || undefined,
  pactBook: getFormValue(formData, 'pactBook') || undefined,
  pactPage: getFormValue(formData, 'pactPage') || undefined,
  pactTerm: getFormValue(formData, 'pactTerm') || undefined,
  firstPerson: {
    name: getFormValue(formData, 'firstPersonName'),
    nationality: getFormValue(formData, 'firstPersonNationality'),
    civilStatus: getFormValue(formData, 'firstPersonCivilStatus'),
    birthDate: getFormValue(formData, 'firstPersonBirthDate'),
    birthPlaceState: getFormValue(formData, 'firstPersonBirthPlaceState'),
    birthPlaceCity: getFormValue(formData, 'firstPersonBirthPlaceCity'),
    profession: getFormValue(formData, 'firstPersonProfession'),
    rg: getFormValue(formData, 'firstPersonRg'),
    taxpayerId: getFormValue(formData, 'firstPersonTaxpayerId'),
    address: getFormValue(formData, 'firstPersonAddress'),
    email: getFormValue(formData, 'firstPersonEmail'),
    phone: getFormValue(formData, 'firstPersonPhone'),
    fatherName: getFormValue(formData, 'firstPersonFatherName'),
    motherName: getFormValue(formData, 'firstPersonMotherName'),
    registryOffice: getFormValue(formData, 'firstPersonRegistryOffice'),
    registryBook: getFormValue(formData, 'firstPersonRegistryBook'),
    registryPage: getFormValue(formData, 'firstPersonRegistryPage'),
    registryTerm: getFormValue(formData, 'firstPersonRegistryTerm'),
    divorceDate: getFormValue(formData, 'firstPersonDivorceDate') || undefined,
    newName: getFormValue(formData, 'firstPersonNewName') || undefined
  },
  secondPerson: {
    name: getFormValue(formData, 'secondPersonName'),
    nationality: getFormValue(formData, 'secondPersonNationality'),
    civilStatus: getFormValue(formData, 'secondPersonCivilStatus'),
    birthDate: getFormValue(formData, 'secondPersonBirthDate'),
    birthPlaceState: getFormValue(formData, 'secondPersonBirthPlaceState'),
    birthPlaceCity: getFormValue(formData, 'secondPersonBirthPlaceCity'),
    profession: getFormValue(formData, 'secondPersonProfession'),
    rg: getFormValue(formData, 'secondPersonRg'),
    taxpayerId: getFormValue(formData, 'secondPersonTaxpayerId'),
    address: getFormValue(formData, 'secondPersonAddress'),
    email: getFormValue(formData, 'secondPersonEmail'),
    phone: getFormValue(formData, 'secondPersonPhone'),
    fatherName: getFormValue(formData, 'secondPersonFatherName'),
    motherName: getFormValue(formData, 'secondPersonMotherName'),
    registryOffice: getFormValue(formData, 'secondPersonRegistryOffice'),
    registryBook: getFormValue(formData, 'secondPersonRegistryBook'),
    registryPage: getFormValue(formData, 'secondPersonRegistryPage'),
    registryTerm: getFormValue(formData, 'secondPersonRegistryTerm'),
    divorceDate: getFormValue(formData, 'secondPersonDivorceDate') || undefined,
    newName: getFormValue(formData, 'secondPersonNewName') || undefined
  }
});

const createDeclarationWithPDF = async (data: DeclarationData) => {
  return await prisma.$transaction(async (tx) => {
    const [firstPerson, secondPerson] = await Promise.all([
      findOrCreatePerson(tx, data.firstPerson),
      findOrCreatePerson(tx, data.secondPerson)
    ]);

    const firstPersonWithRelations = await tx.person.findUnique({
      where: { id: firstPerson.id },
      include: {
        identity: true,
        civilStatuses: true,
        addresses: true,
        contact: true,
        documents: true,
        family: true,
        professional: true,
        registry: true,
      }
    });

    const secondPersonWithRelations = await tx.person.findUnique({
      where: { id: secondPerson.id },
      include: {
        identity: true,
        civilStatuses: true,
        addresses: true,
        contact: true,
        documents: true,
        family: true,
        professional: true,
        registry: true,
      }
    });

    const declaration = await createDeclarationRecord(tx, data, firstPerson.id, secondPerson.id);
    const { pdfContent, filename } = await generatePDFForDeclaration(
      declaration, 
      firstPersonWithRelations, 
      secondPersonWithRelations, 
      data
    );

    return { declaration, pdfContent, filename };
  }, {
    timeout: 30000
  });
};

export const createDeclarationAction = async (formData: FormData): Promise<ActionResult<{ id: string; pdfContent: string; filename: string }>> => {
  try {
    await requireSession([Role.ADMIN, Role.USER]);
    const declarationInput = convertFormDataToDeclarationInput(formData);
    const data = validateDeclarationData(declarationInput);
    validateUniqueDeclarants(data.firstPerson, data.secondPerson);
    const { declaration, pdfContent, filename } = await createDeclarationWithPDF(data);
    revalidatePath('/dashboard');
    return { 
      success: true, 
      data: { 
        id: declaration.id, 
        pdfContent, 
        filename 
      } 
    };
  } catch (error) {
    const errorResult = handleActionError(error as Error);
    return { success: false, error: errorResult.error || 'Erro desconhecido' };
  }
};