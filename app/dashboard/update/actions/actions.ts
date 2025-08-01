'use server';

import { prisma } from '@/lib/prisma';
import { requireSession } from '@/lib/requireSession';
import { Role } from '@prisma/client';
import { ActionResult, DeclarationData, PersonInput, HistoryEntryType, SearchDeclarationResult } from '@/types/declarations';
import { generatePdfAction } from '@/lib//pdf-generator';

const validateId = (id: string) => {
  if (!id || typeof id !== 'string' || id.trim().length === 0) {
    return { isValid: false, error: 'ID é obrigatório' };
  }
  return { isValid: true };
};

const validateAverbation = (text: string) => {
  if (!text || typeof text !== 'string' || text.trim().length < 10) {
    return { isValid: false, error: 'Averbação deve ter pelo menos 10 caracteres' };
  }
  return { isValid: true };
};

const validateStamp = (stamp: string) => {
  if (!stamp || typeof stamp !== 'string' || stamp.trim().length < 3) {
    return { isValid: false, error: 'Selo deve ter pelo menos 3 caracteres' };
  }
  return { isValid: true };
};

const validateSearchTerm = (term: string) => {
  if (!term || typeof term !== 'string' || term.trim().length < 2) {
    return { isValid: false, error: 'Termo de busca deve ter pelo menos 2 caracteres' };
  }
  return { isValid: true };
};

const mapDeclarationToData = (declaration: Record<string, unknown>): DeclarationData => {
  const participants = declaration.participants as Array<Record<string, unknown>> | undefined;
  const firstParticipant = participants?.[0];
  const secondParticipant = participants?.[1];
  const history = declaration.history as Array<Record<string, unknown>> | undefined;
  const registryInfo = declaration.registryInfo as Record<string, unknown> | undefined;
  const prenuptial = declaration.prenuptial as Record<string, unknown> | undefined;
  
  return {
    id: declaration.id as string,
    createdAt: new Date(declaration.createdAt as string).toISOString(),
    updatedAt: new Date(declaration.updatedAt as string).toISOString(),
    declarationDate: new Date(declaration.declarationDate as string).toISOString(),
    date: new Date(declaration.declarationDate as string).toISOString().split('T')[0],
    city: declaration.city as string,
    state: declaration.state as string,
    unionStartDate: new Date(declaration.unionStartDate as string).toISOString(),
    propertyRegime: declaration.propertyRegime as string,
    firstPerson: mapPersonToInput(firstParticipant?.person),
    secondPerson: mapPersonToInput(secondParticipant?.person),
    history: history?.map((h) => ({
      id: h.id as string,
      type: h.type as HistoryEntryType,
      description: h.description as string,
      averbation: h.averbation as string,
      updatedBy: h.updatedBy as string,
      updatedAt: new Date(h.updatedAt as string).toISOString()
    })),
    pactDate: prenuptial?.pactDate ? new Date(prenuptial.pactDate as string).toISOString().split('T')[0] : undefined,
    registryInfo: registryInfo ? {
      registryOffice: registryInfo.registryOffice as string,
      typeRegistry: registryInfo.typeRegistry as string,
      registrarName: registryInfo.registrarName as string
    } : undefined,
    prenuptial: prenuptial ? {
      pactDate: prenuptial.pactDate ? new Date(prenuptial.pactDate as string).toISOString().split('T')[0] : undefined,
      pactOffice: prenuptial.pactOffice as string,
      pactBook: prenuptial.pactBook as string,
      pactPage: prenuptial.pactPage as string,
      pactTerm: prenuptial.pactTerm as string
    } : undefined
  };
};

const mapPersonToInput = (person: unknown): PersonInput => {
  if (!person || typeof person !== 'object') {
    return {
      name: 'Nome não informado',
      nationality: 'Brasileira',
      civilStatus: 'Solteiro(a)',
      birthDate: new Date().toISOString(),
      birthPlaceState: '',
      birthPlaceCity: '',
      profession: '',
      rg: '',
      taxpayerId: '',
      address: '',
      email: '',
      phone: '',
      fatherName: '',
      motherName: '',
      registryOffice: '',
      registryBook: '',
      registryPage: '',
      registryTerm: ''
    };
  }
  const personData = person as Record<string, unknown>;
  const identity = personData.identity as Record<string, unknown> | undefined;
  const civilStatuses = personData.civilStatuses as Array<Record<string, unknown>> | undefined;
  const addresses = personData.addresses as Array<Record<string, unknown>> | undefined;
  const professional = personData.professional as Record<string, unknown> | undefined;
  const documents = personData.documents as Record<string, unknown> | undefined;
  const contact = personData.contact as Record<string, unknown> | undefined;
  const family = personData.family as Record<string, unknown> | undefined;
  const registry = personData.registry as Record<string, unknown> | undefined;
  
  return {
    name: (identity?.fullName as string) || 'Nome não informado',
    nationality: (identity?.nationality as string) || 'Brasileira',
    civilStatus: (civilStatuses?.[0]?.status as string) || 'Solteiro(a)',
    birthDate: identity?.birthDate ? new Date(identity.birthDate as string).toISOString() : new Date().toISOString(),
    birthPlaceState: (addresses?.[0]?.state as string) || '',
    birthPlaceCity: (addresses?.[0]?.city as string) || '',
    profession: (professional?.profession as string) || '',
    rg: (documents?.rg as string) || '',
    taxpayerId: (identity?.taxId as string) || '',
    address: `${(addresses?.[0]?.street as string) || ''} ${(addresses?.[0]?.number as string) || ''}`.trim() || '',
    email: (contact?.email as string) || '',
    phone: (contact?.phone as string) || '',
    fatherName: (family?.fatherName as string) || '',
    motherName: (family?.motherName as string) || '',
    registryOffice: (registry?.registryOffice as string) || '',
    registryBook: (registry?.registryBook as string) || '',
    registryPage: (registry?.registryPage as string) || '',
    registryTerm: (registry?.registryTerm as string) || ''
  };
};

const mapDeclarationToSearchResult = (declaration: any): SearchDeclarationResult => {
  const firstParticipant = declaration.participants?.[0];
  const secondParticipant = declaration.participants?.[1];
  return {
    id: declaration.id,
    firstPersonName: firstParticipant?.person?.identity?.fullName || '',
    secondPersonName: secondParticipant?.person?.identity?.fullName || '',
    declarationDate: declaration.declarationDate.toISOString(),
    city: declaration.city,
    state: declaration.state
  };
};

export const getDeclarationByIdAction = async (id: string): Promise<ActionResult<DeclarationData>> => {
  try {
    await requireSession([Role.ADMIN, Role.USER]);
    const validationResult = validateId(id);
    if (!validationResult.isValid) {
      return { success: false, error: validationResult.error };
    }
    const declaration = await prisma.declaration.findUnique({
      where: { id },
      include: {
        participants: {
          include: {
            person: {
              include: {
                identity: true,
                contact: true,
                documents: true,
                family: true,
                professional: true,
                registry: true,
                addresses: true,
                civilStatuses: true
              }
            }
          }
        },
        history: true,
        registryInfo: true,
        prenuptial: true
      }
    });
    if (!declaration) {
      return { success: false, error: 'Declaração não encontrada' };
    }
    return { success: true, data: mapDeclarationToData(declaration) };
  } catch (error) {
    return { success: false, error: 'Erro ao buscar declaração' };
  }
};

export const addAverbationAction = async (
  declarationId: string, 
  averbationText: string
): Promise<ActionResult<void>> => {
  try {
    const session = await requireSession([Role.ADMIN, Role.USER]);
    const validationResult = validateAverbation(averbationText);
    if (!validationResult.isValid) {
      return { success: false, error: validationResult.error };
    }
    const declaration = await prisma.declaration.findUnique({ where: { id: declarationId } });
    if (!declaration) {
      return { success: false, error: 'Declaração não encontrada' };
    }
    await prisma.declarationHistory.create({
      data: {
        declarationId,
        type: 'AVERBATION',
        description: 'Averbação adicionada',
        averbation: averbationText,
        updatedBy: session.email || 'Sistema',
        updatedAt: new Date()
      }
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Erro ao adicionar averbação' };
  }
};

const transformDeclarationToPdfData = (declaration: DeclarationData) => ({
  date: declaration.date,
  city: declaration.city,
  state: declaration.state,
  stamp: '',
  firstPerson: {
    ...declaration.firstPerson,
    cpf: declaration.firstPerson.taxpayerId,
    birthPlace: `${declaration.firstPerson.birthPlaceCity}, ${declaration.firstPerson.birthPlaceState}`,
    typeRegistry: 'NASCIMENTO'
  },
  secondPerson: {
    ...declaration.secondPerson,
    cpf: declaration.secondPerson.taxpayerId,
    birthPlace: `${declaration.secondPerson.birthPlaceCity}, ${declaration.secondPerson.birthPlaceState}`,
    typeRegistry: 'NASCIMENTO'
  },
  unionStartDate: declaration.unionStartDate,
  propertyRegime: declaration.propertyRegime as 'COMUNHAO_PARCIAL' | 'SEPARACAO_TOTAL' | 'PARTICIPACAO_FINAL' | 'COMUNHAO_UNIVERSAL',
  registrarName: declaration.registryInfo?.registrarName || 'Sistema',
  pactDate: declaration.pactDate,
  pactOffice: declaration.prenuptial?.pactOffice,
  pactBook: declaration.prenuptial?.pactBook,
  pactPage: declaration.prenuptial?.pactPage,
  pactTerm: declaration.prenuptial?.pactTerm,
  averbations: declaration.history?.filter(h => h.type === 'AVERBATION').map(h => ({
    description: h.averbation || h.description,
    date: new Date(h.updatedAt),
    updatedBy: h.updatedBy
  })) || [],
  isUpdate: true
});

export const generatePdfWithAverbationsAction = async (
  declarationId: string
): Promise<ActionResult<{ pdfContent: string; filename: string }>> => {
  try {
    await requireSession([Role.ADMIN, Role.USER]);
    const declarationResult = await getDeclarationByIdAction(declarationId);
    if (!declarationResult.success || !declarationResult.data) {
      return { success: false, error: 'Declaração não encontrada' };
    }
    const pdfData = transformDeclarationToPdfData(declarationResult.data);
    const pdfResult = await generatePdfAction(pdfData);
    if (!pdfResult.success) {
      return { success: false, error: 'error' in pdfResult ? pdfResult.error : 'Erro ao gerar PDF' };
    }
    if ('pdfContent' in pdfResult && 'filename' in pdfResult) {
      return { 
        success: true, 
        data: { 
          pdfContent: pdfResult.pdfContent, 
          filename: pdfResult.filename 
        } 
      };
    }
    return { success: false, error: 'Erro ao gerar PDF' };
  } catch (error) {
    return { success: false, error: 'Erro ao gerar PDF' };
  }
};

export const updateDeclarationStampAction = async (
  declarationId: string, 
  stamp: string
): Promise<ActionResult> => {
  try {
    await requireSession([Role.ADMIN]);
    const validationResult = validateStamp(stamp);
    if (!validationResult.isValid) {
      return { success: false, error: validationResult.error };
    }
    const declaration = await prisma.declaration.findUnique({ where: { id: declarationId } });
    if (!declaration) {
      return { success: false, error: 'Declaração não encontrada' };
    }
    await prisma.declarationRegistry.upsert({
      where: { declarationId },
      update: { registrarName: stamp },
      create: {
        declarationId,
        registryOffice: 'Cartório Colorado',
        typeRegistry: 'Civil',
        registrarName: stamp
      }
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Erro ao atualizar carimbo' };
  }
};

export const searchUpdateCandidatesAction = async (searchTerm: string): Promise<ActionResult<DeclarationData[]>> => {
  try {
    await requireSession([Role.ADMIN, Role.USER]);
    const validationResult = validateSearchTerm(searchTerm);
    if (!validationResult.isValid) {
      return { success: false, error: validationResult.error };
    }
    const declarations = await prisma.declaration.findMany({
      where: {
        OR: [
          {
            participants: {
              some: {
                person: {
                  identity: {
                    taxId: { contains: searchTerm, mode: 'insensitive' }
                  }
                }
              }
            }
          },
          {
            participants: {
              some: {
                person: {
                  identity: {
                    fullName: { contains: searchTerm, mode: 'insensitive' }
                  }
                }
              }
            }
          }
        ]
      },
      include: {
        participants: {
          include: {
            person: {
              include: {
                identity: true,
                contact: true,
                documents: true,
                family: true,
                professional: true,
                registry: true,
                addresses: true,
                civilStatuses: true
              }
            }
          }
        },
        history: true,
        registryInfo: true,
        prenuptial: true
      },
      take: 20
    });
    const searchResults = declarations.map(mapDeclarationToData);
    return { success: true, data: searchResults };
  } catch (error) {
    return { success: false, error: 'Erro ao buscar declarações' };
  }
};
