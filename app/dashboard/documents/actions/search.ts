'use server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { SearchParams, SearchResult, DeclarationSearchResult } from '../types';
import { cleanTaxpayerId, validateSearchParams } from '../utils';

export const searchDeclarationsAction = async (params: SearchParams): Promise<SearchResult> => {
  try {
    if (!validateSearchParams(params)) 
      return { success: false, error: 'Parâmetros de busca inválidos' };
    const whereConditions = buildWhereConditions(params);
    const declarations = await fetchDeclarations(whereConditions);
    const mappedDeclarations = mapDeclarationsToResult(declarations);
    return { success: true, data: mappedDeclarations };
  } catch {
    return { success: false, error: 'Erro interno do servidor' };
  }
};

const buildWhereConditions = (params: SearchParams): Prisma.DeclarationWhereInput => {
  const conditions: Prisma.DeclarationWhereInput = { deletedAt: null };
  if (params.name)
    conditions.participants = {
      some: {
        person: {
          identity: {
            fullName: { contains: params.name, mode: 'insensitive' }
          }
        }
      }
    };
  if (params.taxpayerId) 
    conditions.participants = {
      some: {
        person: {
          identity: {
            taxId: cleanTaxpayerId(params.taxpayerId)
          }
        }
      }
    };
  return conditions;
};

const fetchDeclarations = async (whereConditions: any) => {
  return await prisma.declaration.findMany({
    where: whereConditions,
    include: {
      registryInfo: true,
      participants: {
        include: {
          person: {
            include: {
              identity: true
            }
          }
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
};

const mapDeclarationsToResult = (declarations: any[]): DeclarationSearchResult[] => {
  return declarations.map(declaration => ({
    id: declaration.id,
    protocolNumber: `UE-${declaration.id.slice(-6).toUpperCase()}`,
    declarationDate: declaration.declarationDate.toISOString(),
    unionStartDate: declaration.unionStartDate.toISOString(),
    propertyRegime: declaration.propertyRegime,
    registryInfo: {
      registrarName: declaration.registryInfo?.registrarName || '',
      typeRegistry: declaration.registryInfo?.typeRegistry || ''
    },
    participants: declaration.participants.map((participant: any) => ({
      person: {
        identity: {
          fullName: participant.person.identity?.fullName || '',
          taxId: participant.person.identity?.taxId || ''
        }
      }
    }))
  }));
};