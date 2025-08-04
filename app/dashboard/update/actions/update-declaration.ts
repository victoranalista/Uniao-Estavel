'use server';

import { prisma } from '@/lib/prisma';
import { generatePdfAction } from '@/lib/pdf-generator';
import { updateFormSchema } from '../utils/schemas';
import { UpdateActionResult, PersonFormData } from '../types';
import { requireSession } from '@/lib/requireSession';
import { Role, Prisma } from '@prisma/client';
import { auditFieldChanges, createAuditLog } from '@/lib/audit';
import { AuditOperation } from '@prisma/client';

type TransactionClient = Omit<typeof prisma, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>;

type DeclarationWithRelations = Prisma.DeclarationGetPayload<{
  include: {
    participants: {
      include: {
        person: true;
      };
    };
    registryInfo: true;
    prenuptial: true;
  };
}>;

type ParticipantWithRelations = DeclarationWithRelations['participants'][0];

const validateUpdateData = async (formData: FormData) => {
  const data = Object.fromEntries(formData.entries());
  return updateFormSchema.parseAsync({
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
    averbation: data.averbation || undefined,
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

const updatePersonData = async (
  tx: TransactionClient, 
  personId: string, 
  personData: PersonFormData, 
  userId?: string, 
  userName?: string
) => {
  const currentPerson = await tx.person.findUnique({
    where: { id: personId },
    include: {
      identity: true,
      civilStatuses: true,
      addresses: true,
      contact: true,
      documents: true,
      family: true,
      professional: true,
      registry: true,
    },
  });

  if (!currentPerson) return;

  if (currentPerson.identity) {
    const oldIdentity = currentPerson.identity;
    const newIdentity = {
      fullName: personData.name,
      nationality: personData.nationality,
      birthDate: new Date(personData.birthDate),
      birthPlace: `${personData.birthPlaceCity}, ${personData.birthPlaceState}`,
    };
    
    await auditFieldChanges('PersonIdentity', oldIdentity.id, oldIdentity, newIdentity, userId, userName);
    await tx.personIdentity.update({
      where: { id: oldIdentity.id },
      data: newIdentity,
    });
  }

  if (currentPerson.civilStatuses[0]) {
    const oldStatus = currentPerson.civilStatuses[0];
    const newStatus = { status: personData.civilStatus };
    
    await auditFieldChanges('PersonCivilStatus', oldStatus.id, oldStatus, newStatus, userId, userName);
    await tx.personCivilStatus.update({
      where: { id: oldStatus.id },
      data: newStatus,
    });
  }

  if (currentPerson.addresses[0]) {
    const oldAddress = currentPerson.addresses[0];
    const newAddress = {
      street: personData.address,
      city: personData.birthPlaceCity,
      state: personData.birthPlaceState,
    };
    
    await auditFieldChanges('PersonAddress', oldAddress.id, oldAddress, newAddress, userId, userName);
    await tx.personAddress.update({
      where: { id: oldAddress.id },
      data: newAddress,
    });
  }

  if (currentPerson.contact) {
    const oldContact = currentPerson.contact;
    const newContact = {
      email: personData.email,
      phone: personData.phone,
    };
    
    await auditFieldChanges('PersonContact', oldContact.id, oldContact, newContact, userId, userName);
    await tx.personContact.update({
      where: { id: oldContact.id },
      data: newContact,
    });
  }

  if (currentPerson.documents) {
    const oldDocument = currentPerson.documents;
    const newDocument = { rg: personData.rg };
    
    await auditFieldChanges('PersonDocument', oldDocument.id, oldDocument, newDocument, userId, userName);
    await tx.personDocument.update({
      where: { id: oldDocument.id },
      data: newDocument,
    });
  }

  if (currentPerson.family) {
    const oldFamily = currentPerson.family;
    const newFamily = {
      fatherName: personData.fatherName,
      motherName: personData.motherName,
    };
    
    await auditFieldChanges('PersonFamily', oldFamily.id, oldFamily, newFamily, userId, userName);
    await tx.personFamily.update({
      where: { id: oldFamily.id },
      data: newFamily,
    });
  }

  if (currentPerson.professional) {
    const oldProfessional = currentPerson.professional;
    const newProfessional = { profession: personData.profession };
    
    await auditFieldChanges('PersonProfessionalData', oldProfessional.id, oldProfessional, newProfessional, userId, userName);
    await tx.personProfessionalData.update({
      where: { id: oldProfessional.id },
      data: newProfessional,
    });
  }

  if (currentPerson.registry) {
    const oldRegistry = currentPerson.registry;
    const newRegistry = {
      registryOffice: personData.registryOffice,
      registryBook: personData.registryBook,
      registryPage: personData.registryPage,
      registryTerm: personData.registryTerm,
    };
    
    await auditFieldChanges('RegistryData', oldRegistry.id, oldRegistry, newRegistry, userId, userName);
    await tx.registryData.update({
      where: { id: oldRegistry.id },
      data: newRegistry,
    });
  }
};

const createUpdateHistory = async (declarationId: string, averbation?: string) => {
  if (!averbation) return;
  
  await prisma.declarationHistory.create({
    data: {
      declarationId,
      type: 'AVERBACAO',
      description: 'Averbação realizada',
      averbation,
      updatedBy: 'Sistema',
    },
  });
};

export const updateDeclarationAction = async (
  declarationId: string, 
  formData: FormData
): Promise<UpdateActionResult> => {
  try {
    const session = await requireSession([Role.ADMIN, Role.USER]);
    const validatedData = await validateUpdateData(formData);
    
    const result = await prisma.$transaction(async (tx) => {
      const declaration = await tx.declaration.findFirst({
        where: { id: declarationId, archivedAt: null },
        include: { 
          participants: { include: { person: true } },
          registryInfo: true,
          prenuptial: true
        }
      });
      
      if (!declaration) throw new Error('Declaração não encontrada');

      const oldDeclaration = {
        declarationDate: declaration.declarationDate,
        unionStartDate: declaration.unionStartDate,
        propertyRegime: declaration.propertyRegime,
      };
      
      const newDeclaration = {
        declarationDate: new Date(validatedData.date),
        unionStartDate: new Date(validatedData.unionStartDate),
        propertyRegime: validatedData.propertyRegime,
        updatedAt: new Date(),
      };

      await auditFieldChanges('Declaration', declarationId, oldDeclaration, newDeclaration, session.user?.id?.toString(), session.user?.name);
      
      await tx.declaration.update({
        where: { id: declarationId },
        data: newDeclaration,
      });

      if (declaration.registryInfo) {
        const oldRegistry = { registrarName: declaration.registryInfo.registrarName };
        const newRegistry = { registrarName: validatedData.registrarName };
        
        await auditFieldChanges('DeclarationRegistry', declaration.registryInfo.id, oldRegistry, newRegistry, session.user?.id?.toString(), session.user?.name);
        
        await tx.declarationRegistry.update({
          where: { declarationId },
          data: newRegistry,
        });
      }

      if (declaration.prenuptial) {
        const oldPrenuptial = {
          pactDate: declaration.prenuptial.pactDate,
          pactOffice: declaration.prenuptial.pactOffice,
          pactBook: declaration.prenuptial.pactBook,
          pactPage: declaration.prenuptial.pactPage,
          pactTerm: declaration.prenuptial.pactTerm,
        };
        
        const newPrenuptial = {
          pactDate: validatedData.pactDate ? new Date(validatedData.pactDate) : null,
          pactOffice: validatedData.pactOffice,
          pactBook: validatedData.pactBook,
          pactPage: validatedData.pactPage,
          pactTerm: validatedData.pactTerm,
        };

        await auditFieldChanges('PrenuptialAgreement', declaration.prenuptial.id, oldPrenuptial, newPrenuptial, session.user?.id?.toString(), session.user?.name);
        
        await tx.prenuptialAgreement.update({
          where: { declarationId },
          data: newPrenuptial,
        });
      }

      const sortedParticipants = declaration.participants.sort((a: ParticipantWithRelations, b: ParticipantWithRelations) => 
        a.createdAt.getTime() - b.createdAt.getTime()
      );

      if (sortedParticipants[0]) {
        await updatePersonData(tx, sortedParticipants[0].personId, validatedData.firstPerson, session.user?.id?.toString(), session.user?.name);
      }
      
      if (sortedParticipants[1]) {
        await updatePersonData(tx, sortedParticipants[1].personId, validatedData.secondPerson, session.user?.id?.toString(), session.user?.name);
      }

      if (validatedData.averbation) {
        await createAuditLog({
          tableName: 'Declaration',
          recordId: declarationId,
          operation: AuditOperation.UPDATE,
          fieldName: 'averbation',
          newValue: validatedData.averbation,
          userId: session.user?.id?.toString(),
          userName: session.user?.name,
        });
      }

      await createUpdateHistory(declarationId, validatedData.averbation);
      
      return declaration;
    });

    const pdfData = {
      ...validatedData,
      isUpdate: true,
      averbation: validatedData.averbation,
      termNumber: result.termNumber,
      bookNumber: result.bookNumber,
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
    };

    const pdfResult = await generatePdfAction(pdfData);
    if (!pdfResult.success) return { success: false, error: 'Erro ao gerar PDF atualizado' };

    return {
      success: true,
      data: {
        declarationId,
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