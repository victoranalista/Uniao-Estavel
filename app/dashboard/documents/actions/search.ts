'use server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { requireSession } from '@/lib/requireSession';
import { Role } from '@prisma/client';
import { SearchParams, SearchResult, DeclarationSearchResult, DeclarationWithFullRelations } from '../types';

const cleanCpfForSearch = (cpf: string): string => cpf.replace(/\D/g, '');

const formatCpfForDatabase = (cpf: string): string => {
  const cleanCpf = cleanCpfForSearch(cpf);
  return `${cleanCpf.slice(0, 3)}.${cleanCpf.slice(3, 6)}.${cleanCpf.slice(6, 9)}-${cleanCpf.slice(9, 11)}`;
};

const buildSearchConditions = (params: SearchParams): Prisma.DeclarationWhereInput => {
  const baseCondition: Prisma.DeclarationWhereInput = { };
  const orConditions: Prisma.DeclarationWhereInput[] = [];
  if (params.name && params.name.trim().length >= 2) {
    orConditions.push({
      participants: {
        some: {
          person: {
            identity: {
              fullName: {
                contains: params.name.trim(),
                mode: 'insensitive'
              }
            }
          }
        }
      }
    });
  }
  if (params.taxpayerId && params.taxpayerId.trim().length >= 3) {
    const cleanCpf = cleanCpfForSearch(params.taxpayerId);
    const formattedCpf = formatCpfForDatabase(params.taxpayerId);
    orConditions.push({
      participants: {
        some: {
          person: {
            identity: {
              OR: [
                { taxId: cleanCpf },
                { taxId: formattedCpf },
                { taxId: { contains: cleanCpf } },
                { taxId: { contains: params.taxpayerId.trim() } }
              ]
            }
          }
        }
      }
    });
  }
  if (orConditions.length === 0) return { id: 'never-match' };
  return {
    ...baseCondition,
    OR: orConditions
  };
};

const executeDeclarationSearch = async (whereConditions: Prisma.DeclarationWhereInput): Promise<DeclarationWithFullRelations[]> => {
  await requireSession([Role.ADMIN, Role.USER]);
  return await prisma.declaration.findMany({
    where: whereConditions,
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
    },
    orderBy: { createdAt: 'desc' },
    take: 20
  });
};

const transformToSearchResults = (declarations: DeclarationWithFullRelations[]): DeclarationSearchResult[] => {
  return declarations.map(declaration => ({
    id: declaration.id,
    protocolNumber: `UE-${declaration.id.slice(-6).toUpperCase()}`,
    declarationDate: declaration.declarationDate.toISOString(),
    unionStartDate: declaration.unionStartDate.toISOString(),
    propertyRegime: declaration.propertyRegime,
    registryInfo: {
      registrarName: declaration.registryInfo?.registrarName || 'Não informado',
      typeRegistry: declaration.registryInfo?.typeRegistry || 'Não informado'
    },
    participants: declaration.participants.map(participant => ({
      person: {
        identity: {
          fullName: participant.person.identity?.fullName || 'Nome não disponível',
          taxId: participant.person.identity?.taxId || 'CPF não disponível'
        }
      }
    }))
  }));
};

export const searchDeclarationsAction = async (params: SearchParams): Promise<SearchResult> => {
  try {
    await requireSession([Role.ADMIN, Role.USER]);
    if (!params.name && !params.taxpayerId) 
      return { success: false, error: 'Informe pelo menos um nome ou CPF para buscar' };
    const whereConditions = buildSearchConditions(params);
    const declarations = await executeDeclarationSearch(whereConditions);
    const searchResults = transformToSearchResults(declarations);
    return { success: true, data: searchResults };
  } catch (error) {
    return { success: false, error: 'Erro ao realizar busca. Tente novamente.' };
  }
};