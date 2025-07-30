'use server';

import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { requireSession } from '@/lib/requireSession';
import { Role } from '@prisma/client';

interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

interface SearchParams {
  search?: string;
  protocolNumber?: string;
  firstPersonName?: string;
  secondPersonName?: string;
  bookNumber?: string;
  pageNumber?: number;
  termNumber?: number;
}

const searchParametersSchema = z.object({
  search: z.string().optional(),
  protocolNumber: z.string().optional(),
  firstPersonName: z.string().optional(),
  secondPersonName: z.string().optional(),
  bookNumber: z.string().optional(),
  pageNumber: z.number().optional(),
  termNumber: z.number().optional(),
});

export async function searchRegistrations(searchParams: SearchParams): Promise<ActionResult> {
  try {
       await requireSession([Role.ADMIN, Role.USER])

    const validatedParams = searchParametersSchema.parse(searchParams);
    
    let whereConditions: any = {};

    if (validatedParams.search) {
      const searchTerm = validatedParams.search.toLowerCase();
      whereConditions = {
        OR: [
          { 
            participants: {
              some: {
                person: {
                  identity: { fullName: { contains: searchTerm, mode: 'insensitive' } }
                }
              }
            }
          },
          { 
            participants: {
              some: {
                person: {
                  identity: { taxId: { contains: searchTerm } }
                }
              }
            }
          },
          { id: { contains: searchTerm } }
        ]
      };
    } else {
      const andConditions: any[] = [];

      if (validatedParams.protocolNumber) {
        andConditions.push({ id: { contains: validatedParams.protocolNumber } });
      }

      if (validatedParams.firstPersonName) {
        andConditions.push({
          participants: {
            some: {
              person: {
                identity: { 
                  fullName: { contains: validatedParams.firstPersonName, mode: 'insensitive' } 
                }
              }
            }
          }
        });
      }

      if (validatedParams.secondPersonName) {
        andConditions.push({
          participants: {
            some: {
              person: {
                identity: { 
                  fullName: { contains: validatedParams.secondPersonName, mode: 'insensitive' } 
                }
              }
            }
          }
        });
      }

      if (validatedParams.bookNumber) {
        andConditions.push({
          participants: {
            some: {
              person: {
                registry: { registryBook: validatedParams.bookNumber }
              }
            }
          }
        });
      }

      if (validatedParams.pageNumber) {
        andConditions.push({
          participants: {
            some: {
              person: {
                registry: { registryPage: validatedParams.pageNumber.toString() }
              }
            }
          }
        });
      }

      if (validatedParams.termNumber) {
        andConditions.push({
          participants: {
            some: {
              person: {
                registry: { registryTerm: validatedParams.termNumber.toString() }
              }
            }
          }
        });
      }

      if (andConditions.length > 0) {
        whereConditions = { AND: andConditions };
      }
    }

    const declarations = await prisma.declaration.findMany({
      where: whereConditions,
      include: {
        participants: {
          include: {
            person: {
              include: {
                identity: true,
                registry: true,
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50,
    });

    const formattedResults = declarations.map(declaration => {
      const firstPerson = declaration.participants[0]?.person;
      const secondPerson = declaration.participants[1]?.person;
      
      return {
        id: declaration.id,
        protocolNumber: declaration.id,
        firstPersonName: firstPerson?.identity?.fullName || '',
        secondPersonName: secondPerson?.identity?.fullName || '',
        unionDate: declaration.unionStartDate.toISOString(),
        bookNumber: firstPerson?.registry?.registryBook || '',
        pageNumber: parseInt(firstPerson?.registry?.registryPage || '0'),
        termNumber: parseInt(firstPerson?.registry?.registryTerm || '0'),
        createdAt: declaration.createdAt.toISOString(),
      };
    });

    return { success: true, data: formattedResults };
  } catch (error) {
    console.error('Error searching registrations:', error);
    
    if (error instanceof z.ZodError) {
      return { success: false, error: 'Parâmetros de busca inválidos' };
    }
    
    return { success: false, error: 'Erro ao buscar registros' };
  }
}

export async function getRegistrationById(registrationId: string): Promise<ActionResult> {
  try {
      await requireSession([Role.ADMIN, Role.USER])

    const declaration = await prisma.declaration.findUnique({
      where: { id: registrationId },
      include: {
        registryInfo: true,
        prenuptial: true,
        history: {
          orderBy: { updatedAt: 'desc' }
        },
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
      },
    });

    if (!declaration) {
      return { success: false, error: 'Registro não encontrado' };
    }

    return { success: true, data: declaration };
  } catch (error) {
    console.error('Error fetching registration:', error);
    return { success: false, error: 'Erro ao buscar registro' };
  }
}