'use server';
import { prisma } from '@/lib/prisma';
import { generateSecondCopyPdfAction } from '@/lib/pdf-generator';
import { PdfGenerationResult, DeclarationWithFullRelations, PersonWithRelations, AddressData } from '../types';
import { requireSession } from '@/lib/requireSession';
import { Role } from '@prisma/client';

export const generateSecondCopyAction = async (declarationId: string): Promise<PdfGenerationResult> => {
  try {
    await requireSession([Role.ADMIN, Role.USER]);
    const declaration = await fetchDeclarationWithBookInfo(declarationId);
    if (!declaration) return { success: false, error: 'Declaração não encontrada' };
    if (!declaration.termNumber || !declaration.bookNumber) return { success: false, error: 'Declaração não possui termo registrado' };

    const mappedData = mapDeclarationToPdfData(declaration);
    const pdfResult = await generateSecondCopyPdfAction(mappedData, declaration.bookNumber, declaration.termNumber);
    
    if (!pdfResult.success) {
      return { success: false, error: 'error' in pdfResult ? pdfResult.error : 'Erro ao gerar segunda via do PDF' };
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
    
    return { success: false, error: 'Erro ao processar PDF gerado' };
  } catch (error) {
    console.error('Generate Second Copy Error:', error);
    return { success: false, error: 'Erro interno do servidor' };
  }
};

const fetchDeclarationWithBookInfo = async (id: string): Promise<DeclarationWithFullRelations | null> => {
  await requireSession([Role.ADMIN, Role.USER]);
  return await prisma.declaration.findFirst({
    where: { id },
    include: {
      registryInfo: true,
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
              registry: true
            }
          }
        }
      }
    }
  });
};

const mapDeclarationToPdfData = (declaration: DeclarationWithFullRelations) => {
  const [firstParticipant, secondParticipant] = declaration.participants;
  return {
    city: declaration.city,
    state: declaration.state,
    unionStartDate: formatDateForPdf(declaration.unionStartDate),
    propertyRegime: declaration.propertyRegime,
    registrarName: declaration.registryInfo?.registrarName || '',
    firstPerson: mapPersonToPdfFormat(firstParticipant.person),
    secondPerson: mapPersonToPdfFormat(secondParticipant.person)
  };
};

const mapPersonToPdfFormat = (person: PersonWithRelations) => {
  const address = person.addresses?.[0];
  const birthPlace = person.identity?.birthPlace || (address ? `${address.city}, ${address.state}` : '');
  const fullAddress = buildFullAddress(address);
  return {
    name: person.identity?.fullName || '',
    taxpayerId: person.identity?.taxId || '',
    nationality: person.identity?.nationality || '',
    civilStatus: person.civilStatuses?.[0]?.status || '',
    birthDate: formatDateForPdf(person.identity?.birthDate || null),
    birthPlace,
    profession: person.professional?.profession || '',
    rg: person.documents?.rg || '',
    address: fullAddress,
    email: person.contact?.email || '',
    phone: person.contact?.phone || '',
    fatherName: person.family?.fatherName || '',
    motherName: person.family?.motherName || '',
    registryOffice: person.registry?.registryOffice || '',
    registryBook: person.registry?.registryBook || '',
    registryPage: person.registry?.registryPage || '',
    registryTerm: person.registry?.registryTerm || '',
    typeRegistry: 'NASCIMENTO'
  };
};

const formatDateForPdf = (date: Date | string | null) => {
  if (!date) return '';
  const dateObj = date instanceof Date ? date : new Date(date);
  return dateObj.toISOString().split('T')[0];
};

const buildFullAddress = (address?: AddressData) => {
  if (!address) return '';
  const parts = [
    address.street,
    address.number,
    address.complement,
    address.neighborhood,
    address.city,
    address.state
  ].filter(Boolean);
  return parts.join(', ');
};