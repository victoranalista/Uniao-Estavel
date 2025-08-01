'use server';

import { requireSession } from '@/lib/requireSession';
import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';
import { ActionResult } from '@/types/declarations';
import { z } from 'zod';
import { generatePdfAction } from '@/lib/pdf-generator';

type DeclarationWithRelations = {
  id: string;
  city: string;
  state: string;
  unionStartDate: Date;
  propertyRegime: string;
  registryInfo?: {
    registrarName?: string;
  } | null;
  prenuptial?: {
    pactDate?: Date;
    pactOffice?: string;
    pactBook?: string;
    pactPage?: string;
    pactTerm?: string;
  } | null;
  participants: Array<{
    person?: {
      identity?: {
        fullName?: string;
        taxId?: string;
        nationality?: string;
        birthDate?: Date;
        birthPlace?: string;
      } | null;
      civilStatuses?: Array<{
        status?: string;
      }>;
      professional?: {
        profession?: string;
      } | null;
      documents?: {
        rg?: string;
      } | null;
      addresses?: Array<{
        street?: string;
      }>;
      contact?: {
        email?: string;
        phone?: string;
      } | null;
      family?: {
        fatherName?: string;
        motherName?: string;
      } | null;
      registry?: {
        registryOffice?: string;
        registryBook?: string;
        registryPage?: string;
        registryTerm?: string;
      } | null;
    } | null;
  }>;
};

const searchParamsSchema = z.object({
  protocolNumber: z.string().optional(),
  firstPersonName: z.string().optional(),
  secondPersonName: z.string().optional(),
  bookNumber: z.string().optional(),
  pageNumber: z.number().optional(),
  termNumber: z.number().optional(),
  taxpayerId: z.string().optional(),
});

const documentSearchSchema = z.object({
  protocolNumber: z.string().optional(),
  taxpayerId: z.string().optional(),
});

const createPersonInclude = () => ({
  identity: true,
  contact: true,
  documents: true,
  family: true,
  professional: true,
  registry: true,
});

const createDeclarationInclude = () => ({
  registryInfo: true,
  prenuptial: true,
  history: { orderBy: { updatedAt: 'desc' as const } },
  participants: {
    include: {
      person: {
        include: createPersonInclude()
      }
    }
  }
});

const createSearchWhereClause = (searchParams: {
  protocolNumber?: string;
  taxpayerId?: string;
  firstPersonName?: string;
  secondPersonName?: string;
}) => {
  const conditions = [];
  if (searchParams.protocolNumber) {
    conditions.push({ id: { contains: searchParams.protocolNumber } });
  }
  if (searchParams.taxpayerId) {
    conditions.push({
      participants: {
        some: {
          person: {
            identity: { taxId: { contains: searchParams.taxpayerId } }
          }
        }
      }
    });
  }
  if (searchParams.firstPersonName || searchParams.secondPersonName) {
    conditions.push({
      participants: {
        some: {
          person: {
            identity: {
              fullName: {
                contains: searchParams.firstPersonName || searchParams.secondPersonName,
                mode: 'insensitive' as const
              }
            }
          }
        }
      }
    });
  }
  return conditions.length > 0 ? { OR: conditions } : {};
};

const hasValidSearchCriteria = (params: z.infer<typeof searchParamsSchema>) => {
  const searchTerm = params.protocolNumber || params.firstPersonName || 
    params.secondPersonName || params.bookNumber || params.taxpayerId || '';
  return searchTerm.length >= 2;
};

export const searchRegistrationsAction = async (searchParams: unknown): Promise<ActionResult> => {
  try {
    await requireSession([Role.ADMIN, Role.USER]);
    const validatedParams = searchParamsSchema.parse(searchParams);
    if (!hasValidSearchCriteria(validatedParams)) {
      return { success: true, data: [] };
    }
    const whereClause = createSearchWhereClause(validatedParams);
    const declarations = await prisma.declaration.findMany({
      where: whereClause,
      include: createDeclarationInclude(),
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
    return { success: true, data: declarations };
  } catch (error) {
    return { success: false, error: 'Erro ao buscar registros' };
  }
};

export const searchDocumentsAction = async (searchParams: unknown): Promise<ActionResult> => {
  try {
    await requireSession([Role.ADMIN, Role.USER]);
    const validatedParams = documentSearchSchema.parse(searchParams);
    if (!validatedParams.protocolNumber && !validatedParams.taxpayerId) {
      return { success: false, error: 'Informe um protocolo ou CPF para buscar' };
    }
    const whereClause = createSearchWhereClause(validatedParams);
    const declaration = await prisma.declaration.findFirst({
      where: whereClause,
      include: createDeclarationInclude(),
    });
    if (!declaration) {
      return { success: false, error: 'Declaração não encontrada' };
    }
    return { success: true, data: declaration };
  } catch (error) {
    return { success: false, error: 'Erro ao buscar documento' };
  }
};

export const getDeclarationByIdAction = async (id: string): Promise<ActionResult> => {
  try {
    await requireSession([Role.ADMIN, Role.USER]);
    if (!id) {
      return { success: false, error: 'ID da declaração é obrigatório' };
    }
    const declaration = await prisma.declaration.findUnique({
      where: { id },
      include: createDeclarationInclude(),
    });
    if (!declaration) {
      return { success: false, error: 'Declaração não encontrada' };
    }
    return { success: true, data: declaration };
  } catch (error) {
    return { success: false, error: 'Erro ao buscar declaração' };
  }
};

const formatDateForPdf = (date: Date | string): string => {
  if (!date) return '';
  const dateObj = date instanceof Date ? date : new Date(date);
  return dateObj.toISOString().split('T')[0];
};

const transformDeclarationToPdfData = (declaration: any) => ({
  city: declaration.city,
  state: declaration.state,
  stamp: 'N/A',
  firstPerson: {
    name: declaration.participants[0]?.person?.identity?.fullName || '',
    cpf: declaration.participants[0]?.person?.identity?.taxId || '',
    nationality: declaration.participants[0]?.person?.identity?.nationality || '',
    civilStatus: declaration.participants[0]?.person?.civilStatuses?.[0]?.status || '',
    birthDate: formatDateForPdf(declaration.participants[0]?.person?.identity?.birthDate || ''),
    birthPlace: declaration.participants[0]?.person?.identity?.birthPlace || '',
    profession: declaration.participants[0]?.person?.professional?.profession || '',
    rg: declaration.participants[0]?.person?.documents?.rg || '',
    address: declaration.participants[0]?.person?.addresses?.[0]?.street || '',
    email: declaration.participants[0]?.person?.contact?.email || '',
    phone: declaration.participants[0]?.person?.contact?.phone || '',
    fatherName: declaration.participants[0]?.person?.family?.fatherName || '',
    motherName: declaration.participants[0]?.person?.family?.motherName || '',
    registryOffice: declaration.participants[0]?.person?.registry?.registryOffice || '',
    registryBook: declaration.participants[0]?.person?.registry?.registryBook || '',
    registryPage: declaration.participants[0]?.person?.registry?.registryPage || '',
    registryTerm: declaration.participants[0]?.person?.registry?.registryTerm || '',
    typeRegistry: 'NASCIMENTO',
  },
  secondPerson: {
    name: declaration.participants[1]?.person?.identity?.fullName || '',
    cpf: declaration.participants[1]?.person?.identity?.taxId || '',
    nationality: declaration.participants[1]?.person?.identity?.nationality || '',
    civilStatus: declaration.participants[1]?.person?.civilStatuses?.[0]?.status || '',
    birthDate: formatDateForPdf(declaration.participants[1]?.person?.identity?.birthDate || ''),
    birthPlace: declaration.participants[1]?.person?.identity?.birthPlace || '',
    profession: declaration.participants[1]?.person?.professional?.profession || '',
    rg: declaration.participants[1]?.person?.documents?.rg || '',
    address: declaration.participants[1]?.person?.addresses?.[0]?.street || '',
    email: declaration.participants[1]?.person?.contact?.email || '',
    phone: declaration.participants[1]?.person?.contact?.phone || '',
    fatherName: declaration.participants[1]?.person?.family?.fatherName || '',
    motherName: declaration.participants[1]?.person?.family?.motherName || '',
    registryOffice: declaration.participants[1]?.person?.registry?.registryOffice || '',
    registryBook: declaration.participants[1]?.person?.registry?.registryBook || '',
    registryPage: declaration.participants[1]?.person?.registry?.registryPage || '',
    registryTerm: declaration.participants[1]?.person?.registry?.registryTerm || '',
    typeRegistry: 'NASCIMENTO',
  },
  unionStartDate: formatDateForPdf(declaration.unionStartDate),
  propertyRegime: declaration.propertyRegime,
  registrarName: declaration.registryInfo?.registrarName || 'Registrador Padrão',
  pactDate: declaration.prenuptial?.pactDate ? formatDateForPdf(declaration.prenuptial.pactDate) : undefined,
  pactOffice: declaration.prenuptial?.pactOffice || undefined,
  pactBook: declaration.prenuptial?.pactBook || undefined,
  pactPage: declaration.prenuptial?.pactPage || undefined,
  pactTerm: declaration.prenuptial?.pactTerm || undefined,
});

export const generateSecondCopyAction = async (declarationId: string): Promise<ActionResult<{ pdfContent: string; filename: string }>> => {
  try {
    await requireSession([Role.ADMIN, Role.USER]);
    if (!declarationId) return { success: false, error: 'ID da declaração é obrigatório' };
    const declaration = await prisma.declaration.findUnique({
      where: { id: declarationId },
      include: createDeclarationInclude(),
    });
    if (!declaration) return { success: false, error: 'Declaração não encontrada' };
    const pdfData = transformDeclarationToPdfData(declaration);
    const result = await generatePdfAction(pdfData);
    if (!result.success) return { success: false, error: 'Erro ao gerar PDF' };
    const filename = `segunda-via-declaracao-${declaration.id}.pdf`;
    return {
      success: true,
      data: {
        pdfContent: result.pdfContent ?? '',
        filename
      }
    };
  } catch (error) {
    return { success: false, error: 'Erro ao gerar segunda via' };
  }
};