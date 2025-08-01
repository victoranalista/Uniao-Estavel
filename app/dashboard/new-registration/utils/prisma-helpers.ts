import { PrismaTransaction } from '@/types/declarations';

export const createPersonInclude = () => ({
  identity: true,
  contact: true,
  documents: true,
  family: true,
  professional: true,
  registry: true,
});

export const createDeclarationInclude = () => ({
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

export const createExtendedDeclarationInclude = () => ({
  ...createDeclarationInclude(),
  witnesses: true,
  drive: true,
  receipts: true,
  clientDocuments: true,
  documents: true,
});

export const createSearchWhereClause = (searchParams: {
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

export type { PrismaTransaction };