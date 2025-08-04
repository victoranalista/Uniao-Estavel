'use server';

import { prisma } from '@/lib/prisma';
import { requireSession } from '@/lib/requireSession';
import { Role } from '@prisma/client';
import { DeclarationWithRelations, PrismaDeclarationWithRelations } from '../types';

const mapCompleteParticipantData = (participant: PrismaDeclarationWithRelations['participants'][0], isFirst: boolean, declarationTypeRegistry: string) => ({
  id: participant.id,
  name: participant.person.identity?.fullName || '',
  cpf: participant.person.identity?.taxId || '',
  rg: participant.person.documents?.rg || '',
  birthDate: participant.person.identity?.birthDate || new Date(),
  nationality: participant.person.identity?.nationality || '',
  occupation: participant.person.professional?.profession || '',
  maritalStatus: participant.person.civilStatuses[0]?.status || '',
  fatherName: participant.person.family?.fatherName || '',
  motherName: participant.person.family?.motherName || '',
  birthPlaceState: participant.person.addresses[0]?.state || '',
  birthPlaceCity: participant.person.identity?.birthPlace || '',
  address: `${participant.person.addresses[0]?.street || ''} ${participant.person.addresses[0]?.number || ''}`.trim(),
  email: participant.person.contact?.email || '',
  phone: participant.person.contact?.phone || '',
  registryOffice: participant.person.registry?.registryOffice || '',
  registryBook: participant.person.registry?.registryBook || '',
  registryPage: participant.person.registry?.registryPage || '',
  registryTerm: participant.person.registry?.registryTerm || '',
  typeRegistry: declarationTypeRegistry,
  isFirstPerson: isFirst
});

const transformToDeclarationWithRelations = (declaration: PrismaDeclarationWithRelations): DeclarationWithRelations => ({
  id: declaration.id,
  declarationDate: declaration.declarationDate,
  city: declaration.city,
  state: declaration.state,
  unionStartDate: declaration.unionStartDate,
  propertyRegime: declaration.propertyRegime,
  createdAt: declaration.createdAt,
  registryInfo: declaration.registryInfo ? {
    registrarName: declaration.registryInfo.registrarName
  } : null,
  prenuptial: declaration.prenuptial,
  participants: declaration.participants.map((p, index) => 
    mapCompleteParticipantData(p, index === 0, declaration.registryInfo?.typeRegistry || '')
  )
});

export const getDeclarationByIdAction = async (declarationId: string): Promise<DeclarationWithRelations | null> => {
  await requireSession([Role.ADMIN, Role.USER]);
  const declaration = await prisma.declaration.findFirst({
    where: { id: declarationId, archivedAt: null },
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
              documents: true,
              family: true,
              professional: true,
              registry: true,
              contact: true
            }
          }
        }
      }
    }
  }) as PrismaDeclarationWithRelations | null;
  return declaration ? transformToDeclarationWithRelations(declaration) : null;
};