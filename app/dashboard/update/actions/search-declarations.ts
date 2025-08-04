'use server';

import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { searchFormSchema } from '../utils/schemas';
import type { SearchResult } from '../types';
import type { Prisma } from '@prisma/client';

type SearchActionResult =
  | { success: true; data: SearchResult[] }
  | { success: false, error: string };

const formatDate = (date: Date) => date.toISOString().split('T')[0];

const buildWhereClause = (searchType: string, searchTerm: string): Prisma.DeclarationWhereInput => {
  if (searchType === 'id') return {
    OR: [
      { termNumber: { contains: searchTerm, mode: 'insensitive' } },
      { bookNumber: { contains: searchTerm, mode: 'insensitive' } },
    ],
  };
  
  if (searchType === 'name') return {
    participants: {
      some: {
        person: {
          identity: {
            fullName: { contains: searchTerm, mode: 'insensitive' }
          }
        }
      }
    }
  };
  
  return {
    participants: {
      some: {
        person: {
          identity: {
            taxId: { contains: searchTerm, mode: 'insensitive' }
          }
        }
      }
    }
  };
};

const mapToSearchResult = (declaration: Prisma.DeclarationGetPayload<{
  include: {
    registryInfo: true;
    participants: {
      include: {
        person: {
          include: {
            identity: true;
          };
        };
      };
    };
  };
}>): SearchResult => ({
  id: declaration.id,
  protocolNumber: declaration.termNumber || '',
  declarationDate: formatDate(declaration.declarationDate),
  unionStartDate: formatDate(declaration.unionStartDate),
  propertyRegime: declaration.propertyRegime,
  registryInfo: {
    registrarName: declaration.registryInfo?.registrarName || '',
    typeRegistry: declaration.registryInfo?.typeRegistry || '',
  },
  participants: declaration.participants
    .filter(p => p.person.identity)
    .map(p => ({
      person: {
        identity: {
          fullName: p.person.identity!.fullName,
          taxId: p.person.identity!.taxId,
        },
      },
    })),
});

export const searchDeclarations = async (data: z.infer<typeof searchFormSchema>): Promise<SearchActionResult> => {
  try {
    const validatedData = searchFormSchema.parse(data);
    const whereClause = buildWhereClause(validatedData.searchType, validatedData.searchTerm);
    
    const declarations = await prisma.declaration.findMany({
      where: {
        ...whereClause,
        archivedAt: null,
      },
      include: {
        registryInfo: true,
        participants: {
          include: {
            person: {
              include: {
                identity: true,
              },
            },
          },
        },
      },
      orderBy: { declarationDate: 'desc' },
      take: 50,
    });

    const results = declarations.map(mapToSearchResult);
    return { success: true, data: results };
  } catch (error) {
    return { success: false, error: 'Erro ao buscar declarações' };
  }
};