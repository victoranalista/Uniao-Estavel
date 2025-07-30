'use server';

import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { requireSession } from '@/lib/requireSession';
import { Role } from '@prisma/client';

interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

const personSchema = z.object({
  name: z.string().min(1, 'Nome obrigatório'),
  nationality: z.string().min(1, 'Nacionalidade obrigatória'),
  civilStatus: z.string().min(1, 'Estado civil obrigatório'),
  birthDate: z.string().transform(str => new Date(str)),
  birthPlace: z.string().min(1, 'Local de nascimento obrigatório'),
  profession: z.string().min(1, 'Profissão obrigatória'),
  rg: z.string().min(1, 'RG obrigatório'),
  taxpayerId: z.string().min(11, 'CPF deve ter pelo menos 11 dígitos'),
  address: z.string().min(1, 'Endereço obrigatório'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(1, 'Telefone obrigatório'),
  fatherName: z.string().min(1, 'Nome do pai obrigatório'),
  motherName: z.string().min(1, 'Nome da mãe obrigatório'),
  registryOffice: z.string().min(1, 'Cartório obrigatório'),
  registryBook: z.string().min(1, 'Livro obrigatório'),
  registryPage: z.string().min(1, 'Página obrigatória'),
  registryTerm: z.string().min(1, 'Termo obrigatório'),
  divorceDate: z.string().optional().transform(str => str ? new Date(str) : undefined),
  newName: z.string().optional()
});

const declarationSchema = z.object({
  date: z.string().transform(str => new Date(str)),
  city: z.string().min(1, 'Cidade obrigatória'),
  state: z.string().min(1, 'Estado obrigatório'),
  unionStartDate: z.string().transform(str => new Date(str)),
  propertyRegime: z.string().min(1, 'Regime de bens obrigatório'),
  registrarName: z.string().min(1, 'Nome do cartorário obrigatório'),
  pactDate: z.string().optional().transform(str => str ? new Date(str) : undefined),
  pactOffice: z.string().optional(),
  pactBook: z.string().optional(),
  pactPage: z.string().optional(),
  pactTerm: z.string().optional(),
  firstPerson: personSchema,
  secondPerson: personSchema,
});

const convertFormDataToObject = (formData: FormData): Record<string, any> => {
  const rawData: Record<string, any> = {};
  formData.forEach((value, key) => {
    if (key.includes('.')) {
      const keys = key.split('.');
      let current = rawData;
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
    } else {
      rawData[key] = value;
    }
  });
  return rawData;
};

const createPersonData = (personData: z.infer<typeof personSchema>, state: string) => ({
  identity: {
    create: {
      fullName: personData.name,
      nationality: personData.nationality,
      birthDate: personData.birthDate,
      birthPlace: personData.birthPlace,
      taxId: personData.taxpayerId,
    }
  },
  civilStatuses: {
    create: {
      status: personData.civilStatus,
    }
  },
  addresses: {
    create: {
      street: personData.address,
      number: "S/N",
      neighborhood: "Centro",
      city: personData.birthPlace,
      state,
    }
  },
  contact: {
    create: {
      email: personData.email,
      phone: personData.phone,
    }
  },
  documents: {
    create: {
      rg: personData.rg,
    }
  },
  family: {
    create: {
      fatherName: personData.fatherName,
      motherName: personData.motherName,
    }
  },
  professional: {
    create: {
      profession: personData.profession,
    }
  },
  registry: {
    create: {
      registryOffice: personData.registryOffice,
      registryBook: personData.registryBook,
      registryPage: personData.registryPage,
      registryTerm: personData.registryTerm,
    }
  }
});

const updatePersonData = (personData: z.infer<typeof personSchema>) => ({
  identity: {
    update: {
      fullName: personData.name,
      nationality: personData.nationality,
      birthDate: personData.birthDate,
      birthPlace: personData.birthPlace,
      taxId: personData.taxpayerId,
    }
  },
  contact: {
    update: {
      email: personData.email,
      phone: personData.phone,
    }
  },
  documents: {
    update: {
      rg: personData.rg,
    }
  },
  family: {
    update: {
      fatherName: personData.fatherName,
      motherName: personData.motherName,
    }
  },
  professional: {
    update: {
      profession: personData.profession,
    }
  },
  registry: {
    update: {
      registryOffice: personData.registryOffice,
      registryBook: personData.registryBook,
      registryPage: personData.registryPage,
      registryTerm: personData.registryTerm,
    }
  }
});

export const createDeclarationAction = async (formData: FormData): Promise<ActionResult> => {
  try {
    const session = await requireSession([Role.ADMIN, Role.USER]);
    const rawData = convertFormDataToObject(formData);
    const data = declarationSchema.parse(rawData);
    const declaration = await prisma.$transaction(async (tx) => {
      const firstPerson = await tx.person.create({
        data: createPersonData(data.firstPerson, data.state)
      });
      const secondPerson = await tx.person.create({
        data: createPersonData(data.secondPerson, data.state)
      });
      return await tx.declaration.create({
        data: {
          declarationDate: data.date,
          city: data.city,
          state: data.state,
          unionStartDate: data.unionStartDate,
          propertyRegime: data.propertyRegime,
          registryInfo: {
            create: {
              registryOffice: data.firstPerson.registryOffice,
              typeRegistry: "NASCIMENTO",
              registrarName: data.registrarName,
            }
          },
          prenuptial: data.pactDate ? {
            create: {
              pactDate: data.pactDate,
              pactOffice: data.pactOffice,
              pactBook: data.pactBook,
              pactPage: data.pactPage,
              pactTerm: data.pactTerm,
            }
          } : undefined,
          participants: {
            create: [
              { personId: firstPerson.id },
              { personId: secondPerson.id }
            ]
          }
        },
        include: {
          registryInfo: true,
          prenuptial: true,
          participants: {
            include: {
              person: {
                include: {
                  identity: true,
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
    });
    revalidatePath('/dashboard');
    return { success: true, data: declaration };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0];
      return { 
        success: false, 
        error: `${firstError?.path.join('.')}: ${firstError?.message}` || 'Dados inválidos'
      };
    }
    return { success: false, error: 'Erro ao criar declaração' };
  }
};

export const updateDeclarationAction = async (
  declarationId: string, 
  formData: FormData
): Promise<ActionResult> => {
  try {
    const session = await requireSession([Role.ADMIN, Role.USER]);
    const rawData = convertFormDataToObject(formData);
    const data = declarationSchema.parse(rawData);
    const updatedDeclaration = await prisma.$transaction(async (tx) => {
      const existingDeclaration = await tx.declaration.findUnique({
        where: { id: declarationId },
        include: {
          participants: {
            include: {
              person: true
            }
          }
        }
      });
      if (!existingDeclaration) {
        throw new Error('Declaração não encontrada');
      }
      const [firstParticipant, secondParticipant] = existingDeclaration.participants;
      await tx.person.update({
        where: { id: firstParticipant.personId },
        data: updatePersonData(data.firstPerson)
      });
      await tx.person.update({
        where: { id: secondParticipant.personId },
        data: updatePersonData(data.secondPerson)
      });
      const declaration = await tx.declaration.update({
        where: { id: declarationId },
        data: {
          declarationDate: data.date,
          city: data.city,
          state: data.state,
          unionStartDate: data.unionStartDate,
          propertyRegime: data.propertyRegime,
          registryInfo: {
            update: {
              registryOffice: data.firstPerson.registryOffice,
              typeRegistry: "NASCIMENTO",
              registrarName: data.registrarName,
            }
          },
          prenuptial: data.pactDate ? {
            upsert: {
              create: {
                pactDate: data.pactDate,
                pactOffice: data.pactOffice,
                pactBook: data.pactBook,
                pactPage: data.pactPage,
                pactTerm: data.pactTerm,
              },
              update: {
                pactDate: data.pactDate,
                pactOffice: data.pactOffice,
                pactBook: data.pactBook,
                pactPage: data.pactPage,
                pactTerm: data.pactTerm,
              }
            }
          } : undefined,
        },
        include: {
          registryInfo: true,
          prenuptial: true,
          participants: {
            include: {
              person: {
                include: {
                  identity: true,
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
      await tx.declarationHistory.create({
        data: {
          declarationId,
          type: 'UPDATE',
          description: 'Declaração atualizada via Server Action',
          updatedBy: session.user?.email || session.user?.name || 'Sistema',
        },
      });
      return declaration;
    });
    revalidatePath('/dashboard');
    revalidatePath('/dashboard/update');
    revalidatePath(`/dashboard/registrations/${declarationId}`);
    return { success: true, data: updatedDeclaration };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0];
      return { 
        success: false, 
        error: `${firstError?.path.join('.')}: ${firstError?.message}` || 'Dados inválidos'
      };
    }
    return { success: false, error: 'Erro ao atualizar declaração' };
  }
};

export const getDeclarationAction = async (declarationId: string): Promise<ActionResult> => {
  try {
    await requireSession([Role.ADMIN, Role.USER]);
    const declaration = await prisma.declaration.findUnique({
      where: { id: declarationId },
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
      return { success: false, error: 'Declaração não encontrada' };
    }
    return { success: true, data: declaration };
  } catch (error) {
    return { success: false, error: 'Erro ao buscar declaração' };
  }
};

export const searchDeclarationsAction = async (searchTerm: string): Promise<ActionResult> => {
  try {
    await requireSession([Role.ADMIN, Role.USER]);
    if (!searchTerm || searchTerm.length < 2) {
      return { success: true, data: [] };
    }
    const declarations = await prisma.declaration.findMany({
      where: {
        participants: {
          some: {
            person: {
              OR: [
                { identity: { fullName: { contains: searchTerm, mode: 'insensitive' } } },
                { identity: { taxId: { contains: searchTerm } } },
              ]
            }
          }
        }
      },
      include: {
        participants: {
          include: {
            person: {
              include: {
                identity: true,
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
      orderBy: {
        createdAt: 'desc',
      },
      take: 20,
    });
    return { success: true, data: declarations };
  } catch (error) {
    return { success: false, error: 'Erro ao buscar declarações' };
  }
};