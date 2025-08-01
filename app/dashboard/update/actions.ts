'use server';

import { Role } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { requireSession } from '@/lib/requireSession';
import { generatePdfAction } from '@/lib/pdf-generator';
import type { ActionResult } from '@/types/declarations';

export const searchUpdateCandidatesAction = async (searchTerm: string) => {
  try {
    const session = await requireSession([Role.ADMIN, Role.USER]);
    if (!searchTerm.trim()) return createErrorResponse('Termo de busca obrigatório');
    const cleanTerm = searchTerm.trim();
    const isNumeric = /^\d+$/.test(cleanTerm.replace(/\D/g, ''));
    const searchConditions = buildSearchConditions(cleanTerm, isNumeric);
    const declarations = await findDeclarationsWithConditions(searchConditions);
    return createSuccessWithDataResponse(declarations);
  } catch {
    return createErrorResponse('Erro na busca');
  }
};

export const addAverbationAction = async (declarationId: string, averbationText: string) => {
  try {
    const session = await requireSession([Role.ADMIN, Role.USER]);
    if (!averbationText.trim()) return createErrorResponse('Texto da averbação obrigatório');
    await createAverbationHistory(declarationId, averbationText, session);
    const updatedDeclaration = await getUpdatedDeclarationData(declarationId);
    return createSuccessWithDataResponse(updatedDeclaration);
  } catch {
    return createErrorResponse('Erro ao adicionar averbação');
  }
};

export const getUpdatedDeclarationAction = async (declarationId: string) => {
  try {
    await requireSession([Role.ADMIN, Role.USER]);
    const declaration = await getUpdatedDeclarationData(declarationId);
    if (!declaration) return createErrorResponse('Declaração não encontrada');
    return createSuccessWithDataResponse(declaration);
  } catch {
    return createErrorResponse('Erro ao buscar declaração');
  }
};

export const updateDeclarationDataAction = async (
  declarationId: string,
  updateData: {
    city?: string;
    state?: string;
    unionStartDate?: string;
    propertyRegime?: string;
    firstPerson?: {
      name?: string;
      cpf?: string;
      nationality?: string;
      civilStatus?: string;
      birthDate?: string;
      birthPlace?: string;
      profession?: string;
      rg?: string;
      address?: string;
      email?: string;
      phone?: string;
      fatherName?: string;
      motherName?: string;
    };
    secondPerson?: {
      name?: string;
      cpf?: string;
      nationality?: string;
      civilStatus?: string;
      birthDate?: string;
      birthPlace?: string;
      profession?: string;
      rg?: string;
      address?: string;
      email?: string;
      phone?: string;
      fatherName?: string;
      motherName?: string;
    };
    registrarName?: string;
    pactDate?: string;
    pactOffice?: string;
    pactBook?: string;
    pactPage?: string;
    pactTerm?: string;
  }
) => {
  try {
    const session = await requireSession([Role.ADMIN, Role.USER]);
    const changes = await processDeclarationUpdates(declarationId, updateData, session);
    return createSuccessWithChangesResponse(changes);
  } catch {
    return createErrorResponse('Erro ao atualizar dados da declaração');
  }
};

export const downloadPdfAction = async (declarationId: string): Promise<ActionResult<{ pdfContent: string; filename: string }>> => {
  try {
    await requireSession([Role.ADMIN, Role.USER]);
    const declaration = await getDeclarationWithRelations(declarationId);
    if (!declaration) return createErrorResponse('Declaração não encontrada');
    const pdfData = buildPdfDataFromDeclaration(declaration);
    const pdfResult = await generatePdfAction(pdfData);
    if (!pdfResult.success) return createErrorResponse('Erro ao gerar PDF');
    return createPdfSuccessResponse(pdfResult);
  } catch {
    return createErrorResponse('Erro ao baixar PDF');
  }
};

const buildSearchConditions = (cleanTerm: string, isNumeric: boolean) => {
  return isNumeric 
    ? [{ participants: { some: { person: { identity: { taxId: { contains: cleanTerm.replace(/\D/g, '') } } } } } }]
    : [
        { participants: { some: { person: { identity: { fullName: { contains: cleanTerm, mode: 'insensitive' as const } } } } } },
        { participants: { some: { person: { identity: { fullName: { contains: cleanTerm.split(' ')[0], mode: 'insensitive' as const } } } } } }
      ];
};

const findDeclarationsWithConditions = async (searchConditions: Array<object>) => {
  return await prisma.declaration.findMany({
    where: { OR: searchConditions, deletedAt: null },
    include: buildCompleteDeclarationIncludes(),
    take: 10
  });
};

const createAverbationHistory = async (declarationId: string, averbationText: string, session: any) => {
  await prisma.declarationHistory.create({
    data: {
      declarationId,
      description: averbationText.trim(),
      type: 'AVERBATION',
      updatedBy: session.user?.email || 'Sistema'
    }
  });
};

const getUpdatedDeclarationData = async (declarationId: string) => {
  return await prisma.declaration.findUnique({
    where: { id: declarationId, deletedAt: null },
    include: buildCompleteDeclarationIncludes()
  });
};

const buildCompleteDeclarationIncludes = () => ({
  participants: {
    include: {
      person: {
        include: {
          identity: true,
          civilStatuses: { where: { deletedAt: null } },
          addresses: { where: { deletedAt: null } },
          contact: true,
          documents: true,
          family: true,
          professional: true,
          registry: true
        }
      }
    }
  },
  registryInfo: true,
  prenuptial: true,
  history: { 
    where: { deletedAt: null }, 
    orderBy: { updatedAt: 'desc' as const } 
  }
});

const createSuccessWithDataResponse = (data: any) => ({
  success: true,
  data
});

export const generatePdfWithAverbationsAction = async (declarationId: string) => {
  try {
    await requireSession([Role.ADMIN, Role.USER]);
    const declaration = await findDeclaration(declarationId);
    if (!declaration) return createErrorResponse('Declaração não encontrada');
    const validatedData = validateDeclarationData(declaration);
    if (!validatedData.success) return validatedData;
    const pdfData = buildCompletePdfData(declaration);
    return await generatePdfWithData(pdfData);
  } catch {
    return createErrorResponse('Erro ao gerar PDF');
  }
};

const findDeclaration = async (declarationId: string) => {
  return await prisma.declaration.findUnique({
    where: { id: declarationId, deletedAt: null },
    include: buildDeclarationIncludes()
  });
};

const buildDeclarationIncludes = () => ({
  participants: {
    include: {
      person: {
        include: {
          identity: true,
          civilStatuses: { where: { deletedAt: null } },
          addresses: { where: { deletedAt: null } },
          contact: true,
          documents: true,
          family: true,
          professional: true,
          registry: true
        }
      }
    }
  },
  registryInfo: true,
  prenuptial: true,
  history: { where: { deletedAt: null }, orderBy: { updatedAt: 'desc' as const } }
});

const validateDeclarationData = (declaration: unknown) => {
  const typedDeclaration = declaration as any;
  const [firstPerson, secondPerson] = typedDeclaration.participants;
  if (!firstPerson?.person || !secondPerson?.person) {
    return createErrorResponse('Dados incompletos');
  }
  return { success: true };
};

const buildCompletePdfData = (declaration: unknown) => {
  const typedDeclaration = declaration as any;
  const [firstPerson, secondPerson] = typedDeclaration.participants;
  return {
    city: typedDeclaration.city,
    state: typedDeclaration.state,
    firstPerson: buildPersonPdfData(firstPerson),
    secondPerson: buildPersonPdfData(secondPerson),
    unionStartDate: formatDateForPdf(typedDeclaration.unionStartDate),
    propertyRegime: typedDeclaration.propertyRegime,
    registrarName: getRegistrarName(typedDeclaration),
    ...buildPrenuptialData(typedDeclaration),
    averbations: buildAverbationsData(typedDeclaration)
  };
};

const buildPersonPdfData = (person: unknown) => {
  const typedPerson = person as any;
  return {
    name: typedPerson.person.identity?.fullName || '',
    cpf: typedPerson.person.identity?.taxId || '',
    nationality: typedPerson.person.identity?.nationality || '',
    civilStatus: getCivilStatus(typedPerson.person),
    birthDate: formatDateForPdf(typedPerson.person.identity?.birthDate),
    birthPlace: typedPerson.person.identity?.birthPlace || '',
    profession: typedPerson.person.professional?.profession || '',
    rg: typedPerson.person.documents?.rg || '',
    address: buildPersonAddress(typedPerson.person.addresses),
    email: typedPerson.person.contact?.email || '',
    phone: typedPerson.person.contact?.phone || '',
    fatherName: typedPerson.person.family?.fatherName || '',
    motherName: typedPerson.person.family?.motherName || '',
    registryOffice: typedPerson.person.registry?.registryOffice || '',
    registryBook: typedPerson.person.registry?.registryBook || '',
    registryPage: typedPerson.person.registry?.registryPage || '',
    registryTerm: typedPerson.person.registry?.registryTerm || '',
    typeRegistry: 'NASCIMENTO'
  };
};

const formatDateForPdf = (date: unknown) => {
  if (!date) return '';
  return new Date(date as string).toISOString().split('T')[0];
};

const getCivilStatus = (person: unknown) => {
  const typedPerson = person as any;
  return typedPerson.civilStatuses?.[0]?.status || '';
};

const buildPersonAddress = (addresses: unknown) => {
  const typedAddresses = addresses as any[];
  if (!typedAddresses[0]) return '';
  const addr = typedAddresses[0];
  return `${addr.street}, ${addr.number}, ${addr.neighborhood}, ${addr.city}, ${addr.state}`;
};

const getRegistrarName = (declaration: unknown) => {
  const typedDeclaration = declaration as any;
  return typedDeclaration.registryInfo?.registrarName || '';
};

const buildPrenuptialData = (declaration: unknown) => {
  const typedDeclaration = declaration as any;
  return {
    pactDate: formatDateForPdf(typedDeclaration.prenuptial?.pactDate),
    pactOffice: typedDeclaration.prenuptial?.pactOffice || undefined,
    pactBook: typedDeclaration.prenuptial?.pactBook || undefined,
    pactPage: typedDeclaration.prenuptial?.pactPage || undefined,
    pactTerm: typedDeclaration.prenuptial?.pactTerm || undefined
  };
};

const buildAverbationsData = (declaration: unknown) => {
  const typedDeclaration = declaration as any;
  return typedDeclaration.history
    .filter((h: any) => h.type === 'AVERBATION' || h.type === 'UPDATE')
    .map((h: any) => ({
      description: h.description,
      date: h.updatedAt,
      updatedBy: h.updatedBy
    }));
};

const generatePdfWithData = async (pdfData: unknown) => {
  const result = await generatePdfAction(pdfData);
  if (!result.success) {
    return createErrorResponse('error' in result ? result.error : 'Erro na geração');
  }
  if ('pdfContent' in result && 'filename' in result) {
    return createSuccessResponse(result.pdfContent, result.filename);
  }
  return createErrorResponse('Erro na geração');
};

const createErrorResponse = (error: string) => ({ 
  success: false, 
  error 
});

const createSuccessResponse = (pdfContent: string, filename: string) => ({ 
  success: true, 
  data: { pdfContent, filename } 
});

const processDeclarationUpdates = async (declarationId: string, updateData: any, session: any) => {
  const changes: string[] = [];
  await prisma.$transaction(async (tx) => {
    const declaration = await findDeclarationForUpdate(tx, declarationId);
    if (!declaration) throw new Error('Declaração não encontrada');
    await updateBasicDeclarationData(tx, declarationId, updateData, declaration, changes);
    await updateRegistryData(tx, declarationId, updateData, declaration, changes);
    await updatePersonsData(tx, declaration, updateData, changes);
    if (changes.length > 0) await createUpdateHistory(tx, declarationId, changes, session);
  });
  return changes;
};

const findDeclarationForUpdate = async (tx: any, declarationId: string) => {
  return await tx.declaration.findUnique({
    where: { id: declarationId },
    include: buildCompleteDeclarationIncludes()
  });
};

const updateBasicDeclarationData = async (tx: any, declarationId: string, updateData: any, declaration: any, changes: string[]) => {
  const updates: any = {};
  if (updateData.city && updateData.city !== declaration.city) {
    updates.city = updateData.city;
    changes.push(`Cidade alterada de "${declaration.city}" para "${updateData.city}"`);
  }
  if (updateData.state && updateData.state !== declaration.state) {
    updates.state = updateData.state;
    changes.push(`Estado alterado de "${declaration.state}" para "${updateData.state}"`);
  }
  if (updateData.unionStartDate && updateData.unionStartDate !== declaration.unionStartDate.toISOString().split('T')[0]) {
    updates.unionStartDate = new Date(updateData.unionStartDate);
    changes.push(`Data da união alterada para "${updateData.unionStartDate}"`);
  }
  if (updateData.propertyRegime && updateData.propertyRegime !== declaration.propertyRegime) {
    updates.propertyRegime = updateData.propertyRegime;
    changes.push(`Regime de bens alterado para "${updateData.propertyRegime}"`);
  }
  if (Object.keys(updates).length > 0) {
    await tx.declaration.update({ where: { id: declarationId }, data: updates });
  }
};

const updateRegistryData = async (tx: any, declarationId: string, updateData: any, declaration: any, changes: string[]) => {
  if (!updateData.registrarName || updateData.registrarName === declaration.registryInfo?.registrarName) return;
  const registryExists = await tx.declarationRegistry.findUnique({ where: { declarationId } });
  if (registryExists) {
    await tx.declarationRegistry.update({
      where: { declarationId },
      data: { registrarName: updateData.registrarName }
    });
  } else {
    await tx.declarationRegistry.create({
      data: { 
        declarationId, 
        registrarName: updateData.registrarName,
        registryOffice: 'Cartório Colorado',
        typeRegistry: 'UNIAO_ESTAVEL'
      }
    });
  }
  changes.push(`Nome do registrador alterado para "${updateData.registrarName}"`);
};

const updatePersonsData = async (tx: any, declaration: any, updateData: any, changes: string[]) => {
  const [firstPerson, secondPerson] = declaration.participants;
  if (updateData.firstPerson && firstPerson?.person) {
    await updateSinglePersonData(tx, firstPerson.person, updateData.firstPerson, 'primeira pessoa', changes);
  }
  if (updateData.secondPerson && secondPerson?.person) {
    await updateSinglePersonData(tx, secondPerson.person, updateData.secondPerson, 'segunda pessoa', changes);
  }
};

const updateSinglePersonData = async (tx: any, person: any, updates: any, personLabel: string, changes: string[]) => {
  await updatePersonIdentity(tx, person, updates, personLabel, changes);
  await updatePersonContact(tx, person, updates, personLabel, changes);
  await updatePersonFamily(tx, person, updates, personLabel, changes);
  await updatePersonProfessional(tx, person, updates, personLabel, changes);
  await updatePersonDocuments(tx, person, updates, personLabel, changes);
  await updatePersonCivilStatus(tx, person, updates, personLabel, changes);
};

const updatePersonIdentity = async (tx: any, person: any, updates: any, personLabel: string, changes: string[]) => {
  const identityUpdates: any = {};
  if (updates.name && updates.name !== person.identity?.fullName) {
    identityUpdates.fullName = updates.name;
    changes.push(`Nome da ${personLabel} alterado para "${updates.name}"`);
  }
  if (updates.cpf && updates.cpf !== person.identity?.taxId) {
    identityUpdates.taxId = updates.cpf;
    changes.push(`CPF da ${personLabel} alterado`);
  }
  if (updates.nationality && updates.nationality !== person.identity?.nationality) {
    identityUpdates.nationality = updates.nationality;
    changes.push(`Nacionalidade da ${personLabel} alterada para "${updates.nationality}"`);
  }
  if (updates.birthDate && updates.birthDate !== person.identity?.birthDate?.toISOString().split('T')[0]) {
    identityUpdates.birthDate = new Date(updates.birthDate);
    changes.push(`Data de nascimento da ${personLabel} alterada para "${updates.birthDate}"`);
  }
  if (updates.birthPlace && updates.birthPlace !== person.identity?.birthPlace) {
    identityUpdates.birthPlace = updates.birthPlace;
    changes.push(`Local de nascimento da ${personLabel} alterado para "${updates.birthPlace}"`);
  }
  if (Object.keys(identityUpdates).length > 0) {
    await tx.personIdentity.update({ where: { personId: person.id }, data: identityUpdates });
  }
};

const updatePersonContact = async (tx: any, person: any, updates: any, personLabel: string, changes: string[]) => {
  const contactUpdates: any = {};
  if (updates.email && updates.email !== person.contact?.email) {
    contactUpdates.email = updates.email;
    changes.push(`Email da ${personLabel} alterado para "${updates.email}"`);
  }
  if (updates.phone && updates.phone !== person.contact?.phone) {
    contactUpdates.phone = updates.phone;
    changes.push(`Telefone da ${personLabel} alterado para "${updates.phone}"`);
  }
  if (Object.keys(contactUpdates).length > 0) {
    const contactExists = await tx.personContact.findUnique({ where: { personId: person.id } });
    if (contactExists) {
      await tx.personContact.update({ where: { personId: person.id }, data: contactUpdates });
    } else {
      await tx.personContact.create({ 
        data: { 
          personId: person.id, 
          email: updates.email || '',
          phone: updates.phone || ''
        }
      });
    }
  }
};

const updatePersonFamily = async (tx: any, person: any, updates: any, personLabel: string, changes: string[]) => {
  const familyUpdates: any = {};
  if (updates.fatherName && updates.fatherName !== person.family?.fatherName) {
    familyUpdates.fatherName = updates.fatherName;
    changes.push(`Nome do pai da ${personLabel} alterado para "${updates.fatherName}"`);
  }
  if (updates.motherName && updates.motherName !== person.family?.motherName) {
    familyUpdates.motherName = updates.motherName;
    changes.push(`Nome da mãe da ${personLabel} alterado para "${updates.motherName}"`);
  }
  if (Object.keys(familyUpdates).length > 0) {
    const familyExists = await tx.personFamily.findUnique({ where: { personId: person.id } });
    if (familyExists) {
      await tx.personFamily.update({ where: { personId: person.id }, data: familyUpdates });
    } else {
      await tx.personFamily.create({ 
        data: { 
          personId: person.id, 
          fatherName: updates.fatherName || '',
          motherName: updates.motherName || ''
        }
      });
    }
  }
};

const updatePersonProfessional = async (tx: any, person: any, updates: any, personLabel: string, changes: string[]) => {
  if (!updates.profession || updates.profession === person.professional?.profession) return;
  const professionalExists = await tx.personProfessionalData.findUnique({ where: { personId: person.id } });
  if (professionalExists) {
    await tx.personProfessionalData.update({ 
      where: { personId: person.id }, 
      data: { profession: updates.profession }
    });
  } else {
    await tx.personProfessionalData.create({ 
      data: { personId: person.id, profession: updates.profession }
    });
  }
  changes.push(`Profissão da ${personLabel} alterada para "${updates.profession}"`);
};

const updatePersonDocuments = async (tx: any, person: any, updates: any, personLabel: string, changes: string[]) => {
  if (!updates.rg || updates.rg === person.documents?.rg) return;
  const documentExists = await tx.personDocument.findUnique({ where: { personId: person.id } });
  if (documentExists) {
    await tx.personDocument.update({ where: { personId: person.id }, data: { rg: updates.rg } });
  } else {
    await tx.personDocument.create({ data: { personId: person.id, rg: updates.rg } });
  }
  changes.push(`RG da ${personLabel} alterado para "${updates.rg}"`);
};

const updatePersonCivilStatus = async (tx: any, person: any, updates: any, personLabel: string, changes: string[]) => {
  if (!updates.civilStatus || updates.civilStatus === person.civilStatuses?.[0]?.status) return;
  const existingStatus = await tx.personCivilStatus.findFirst({
    where: { personId: person.id, deletedAt: null }
  });
  if (existingStatus) {
    await tx.personCivilStatus.update({
      where: { id: existingStatus.id },
      data: { status: updates.civilStatus }
    });
  } else {
    await tx.personCivilStatus.create({
      data: { personId: person.id, status: updates.civilStatus }
    });
  }
  changes.push(`Estado civil da ${personLabel} alterado para "${updates.civilStatus}"`);
};

const createUpdateHistory = async (tx: any, declarationId: string, changes: string[], session: any) => {
  await tx.declarationHistory.create({
    data: {
      declarationId,
      description: `Dados atualizados: ${changes.join('; ')}`,
      type: 'UPDATE',
      updatedBy: session.user?.email || 'Sistema'
    }
  });
};

const createSuccessWithChangesResponse = (changes: string[]) => ({
  success: true,
  changes
});

const getDeclarationWithRelations = async (declarationId: string) => {
  return await prisma.declaration.findUnique({
    where: { id: declarationId },
    include: buildCompleteDeclarationIncludes()
  });
};

const buildPdfDataFromDeclaration = (declaration: any) => {
  const [firstParticipant, secondParticipant] = declaration.participants;
  return {
    city: declaration.city,
    state: declaration.state,
    stamp: declaration.stamp || '',
    firstPerson: buildPersonPdfData(firstParticipant?.person),
    secondPerson: buildPersonPdfData(secondParticipant?.person),
    unionStartDate: declaration.unionStartDate.toISOString().split('T')[0],
    propertyRegime: declaration.propertyRegime,
    registrarName: declaration.registryInfo?.registrarName || 'Registrador',
    pactDate: declaration.prenuptial?.pactDate?.toISOString().split('T')[0],
    pactOffice: declaration.prenuptial?.pactOffice,
    pactBook: declaration.prenuptial?.pactBook,
    pactPage: declaration.prenuptial?.pactPage,
    pactTerm: declaration.prenuptial?.pactTerm,
    averbations: buildAverbationsFromHistory(declaration.history)
  };
};

const buildAverbationsFromHistory = (history: any[]) => {
  return history
    ?.filter(h => h.type === 'AVERBATION' && h.averbation)
    ?.map(h => ({
      description: h.averbation,
      date: h.updatedAt,
      updatedBy: h.updatedBy
    })) || [];
};

const createPdfSuccessResponse = (pdfResult: any) => ({
  success: true,
  data: {
    pdfContent: pdfResult.pdfContent,
    filename: pdfResult.filename
  }
});
