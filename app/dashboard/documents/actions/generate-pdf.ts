'use server';

import { requireSession } from '@/lib/requireSession';
import { Role } from '@prisma/client';
import { generatePdfAction } from '@/lib/pdf-generator';
import { prisma } from '@/lib/prisma';
import type { ActionResult } from '@/types/declarations';

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

export const generateDeclarationPDFAction = async (declarationId: string): Promise<ActionResult<{ pdfContent: string; filename: string }>> => {
  try {
    await requireSession([Role.ADMIN, Role.USER]);
    if (!declarationId) return { success: false, error: 'ID da declaração é obrigatório' };
    
    const declaration = await prisma.declaration.findUnique({
      where: { id: declarationId },
      include: {
        registryInfo: true,
        prenuptial: true,
        participants: {
          include: {
            person: {
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
            }
          }
        }
      }
    });
    
    if (!declaration) return { success: false, error: 'Declaração não encontrada' };
    
    const pdfData = transformDeclarationToPdfData(declaration);
    const result = await generatePdfAction(pdfData);
    
    if (!result.success) return { success: false, error: 'Erro ao gerar PDF' };
    
    return {
      success: true,
      data: {
        pdfContent: result.pdfContent!,
        filename: result.filename!
      }
    };
  } catch (error) {
    return { success: false, error: 'Erro ao gerar PDF da declaração' };
  }
};