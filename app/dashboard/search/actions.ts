'use server';
import { cleanTaxpayerId, isValidTaxpayerId } from '@/lib/validators';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

interface SearchParams {
  name?: string;
  taxpayerId?: string;
}

interface SearchResult {
  success: boolean;
  data?: unknown[];
  message?: string;
}

const validateSearchInput = (params: SearchParams): boolean => {
  const hasValidName = params.name && params.name.trim().length >= 3;
  const hasValidTaxpayerId = params.taxpayerId && isValidTaxpayerId(params.taxpayerId);
  return !!(hasValidName || hasValidTaxpayerId);
};

const buildWhereClause = (params: SearchParams): Prisma.DeclarationWhereInput => {
  const conditions: Prisma.DeclarationWhereInput[] = [];
  if (params.name) {
    conditions.push({
      participants: {
        some: {
          person: {
            identity: {
              fullName: { contains: params.name, mode: 'insensitive' }
            }
          }
        }
      }
    });
  }
  if (params.taxpayerId) {
    const cleanId = cleanTaxpayerId(params.taxpayerId);
    conditions.push({
      participants: {
        some: {
          person: {
            identity: {
              taxId: cleanId
            }
          }
        }
      }
    });
  }
  return { AND: conditions };
};

const executeSearch = async (whereClause: Prisma.DeclarationWhereInput) => {
  return await prisma.declaration.findMany({
    where: whereClause,
    select: {
      id: true,
      unionStartDate: true,
      propertyRegime: true,
      city: true,
      state: true,
      createdAt: true,
      participants: {
        select: {
          person: {
            select: {
              identity: {
                select: {
                  fullName: true,
                  taxId: true
                }
              }
            }
          }
        }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: 50
  });
};

export const searchDeclarations = async (params: SearchParams): Promise<SearchResult> => {
  if (!validateSearchInput(params)) {
    return {
      success: false,
      message: 'Informe pelo menos um nome (mínimo 3 caracteres) ou CPF válido'
    };
  }
  try {
    const whereClause = buildWhereClause(params);
    const results = await executeSearch(whereClause);
    return {
      success: true,
      data: results
    };
  } catch {
    return {
      success: false,
      message: 'Erro interno do servidor'
    };
  }
};