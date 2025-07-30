'use server';

import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { requireSession } from '@/lib/requireSession';
import { Role } from '@prisma/client';
import { generatePdfAction } from './pdf';

interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  pdfContent?: string;
  filename?: string;
}

const personSchema = z.object({
  name: z.string().min(1, 'Nome obrigatório'),
  nationality: z.string().min(1, 'Nacionalidade obrigatória'),
  civilStatus: z.string().min(1, 'Estado civil obrigatório'),
  birthDate: z.string().transform(str => new Date(str)),
  birthPlaceState: z.string().min(1, 'Estado de nascimento obrigatório'),
  birthPlaceCity: z.string().min(1, 'Cidade de nascimento obrigatória'),
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
  stamp: z.string().optional(),
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

const combineBirthPlace = (state: string, city: string): string => `${city}, ${state}`;

const createPersonData = (personData: z.infer<typeof personSchema>, state: string) => ({
  identity: {
    create: {
      fullName: personData.name,
      nationality: personData.nationality,
      birthDate: personData.birthDate,
      birthPlace: combineBirthPlace(personData.birthPlaceState, personData.birthPlaceCity),
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
      city: personData.birthPlaceCity,
      state: personData.birthPlaceState,
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
      birthPlace: combineBirthPlace(personData.birthPlaceState, personData.birthPlaceCity),
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

const validateUniqueDeclarants = (firstPerson: z.infer<typeof personSchema>, secondPerson: z.infer<typeof personSchema>) => {
  if (firstPerson.taxpayerId === secondPerson.taxpayerId) {
    throw new Error('Os declarantes não podem ter o mesmo CPF');
  }
};

const findOrCreatePerson = async (tx: any, personData: z.infer<typeof personSchema>, state: string) => {
  const existingPerson = await tx.person.findFirst({
    where: { identity: { taxId: personData.taxpayerId } }
  });
  
  if (existingPerson) {
    return existingPerson;
  }
  
  return await tx.person.create({
    data: createPersonData(personData, state)
  });
};

const mapDeclarationToPdf = (data: z.infer<typeof declarationSchema>) => ({
  date: data.date.toISOString(),
  city: data.city,
  state: data.state,
  stamp: data.stamp,
  firstPerson: {
    name: data.firstPerson.name,
    cpf: data.firstPerson.taxpayerId,
    nationality: data.firstPerson.nationality,
    civilStatus: data.firstPerson.civilStatus,
    birthDate: data.firstPerson.birthDate.toISOString(),
    birthPlace: combineBirthPlace(data.firstPerson.birthPlaceState, data.firstPerson.birthPlaceCity),
    profession: data.firstPerson.profession,
    rg: data.firstPerson.rg,
    address: data.firstPerson.address,
    email: data.firstPerson.email,
    phone: data.firstPerson.phone,
    fatherName: data.firstPerson.fatherName,
    motherName: data.firstPerson.motherName,
    registryOffice: data.firstPerson.registryOffice,
    registryBook: data.firstPerson.registryBook,
    registryPage: data.firstPerson.registryPage,
    registryTerm: data.firstPerson.registryTerm,
    typeRegistry: 'NASCIMENTO',
    divorceDate: data.firstPerson.divorceDate?.toISOString(),
    newName: data.firstPerson.newName,
  },
  secondPerson: {
    name: data.secondPerson.name,
    cpf: data.secondPerson.taxpayerId,
    nationality: data.secondPerson.nationality,
    civilStatus: data.secondPerson.civilStatus,
    birthDate: data.secondPerson.birthDate.toISOString(),
    birthPlace: combineBirthPlace(data.secondPerson.birthPlaceState, data.secondPerson.birthPlaceCity),
    profession: data.secondPerson.profession,
    rg: data.secondPerson.rg,
    address: data.secondPerson.address,
    email: data.secondPerson.email,
    phone: data.secondPerson.phone,
    fatherName: data.secondPerson.fatherName,
    motherName: data.secondPerson.motherName,
    registryOffice: data.secondPerson.registryOffice,
    registryBook: data.secondPerson.registryBook,
    registryPage: data.secondPerson.registryPage,
    registryTerm: data.secondPerson.registryTerm,
    typeRegistry: 'NASCIMENTO',
    divorceDate: data.secondPerson.divorceDate?.toISOString(),
    newName: data.secondPerson.newName,
  },
  unionStartDate: data.unionStartDate.toISOString(),
  propertyRegime: data.propertyRegime as 'COMUNHAO_PARCIAL' | 'SEPARACAO_TOTAL' | 'PARTICIPACAO_FINAL' | 'COMUNHAO_UNIVERSAL',
  registrarName: data.registrarName,
  pactDate: data.pactDate?.toISOString(),
  pactOffice: data.pactOffice,
  pactBook: data.pactBook,
  pactPage: data.pactPage,
  pactTerm: data.pactTerm,
});

export const createDeclarationAction = async (formData: FormData): Promise<ActionResult> => {
  try {
    const session = await requireSession([Role.ADMIN, Role.USER]);
    const rawData = convertFormDataToObject(formData);
    const data = declarationSchema.parse(rawData);
    
    validateUniqueDeclarants(data.firstPerson, data.secondPerson);
    
    const declaration = await prisma.$transaction(async (tx) => {
      const [firstPerson, secondPerson] = await Promise.all([
        findOrCreatePerson(tx, data.firstPerson, data.state),
        findOrCreatePerson(tx, data.secondPerson, data.state)
      ]);
      
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
        }
      });
    }, {
      timeout: 30000
    });

    const pdfData = mapDeclarationToPdf(data);
    const pdfResult = await generatePdfAction(pdfData);
    
    revalidatePath('/dashboard');
    return { 
      success: true, 
      data: declaration,
      pdfContent: pdfResult.success ? pdfResult.pdfContent : undefined,
      filename: pdfResult.success ? pdfResult.filename : undefined
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0];
      return { 
        success: false, 
        error: `${firstError?.path.join('.')}: ${firstError?.message}` || 'Dados inválidos'
      };
    }
    
    if (error instanceof Error) {
      if (error.message.includes('mesmo CPF')) {
        return { success: false, error: error.message };
      }
      if (error.message.includes('Unique constraint failed')) {
        return { success: false, error: 'Já existe uma pessoa cadastrada com este CPF' };
      }
      if (error.message.includes('Transaction already closed') || error.message.includes('timeout')) {
        return { success: false, error: 'Operação demorou muito para ser processada. Tente novamente.' };
      }
    }
    
    return { success: false, error: 'Não consegui criar o registro' };
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
      
      await Promise.all([
        tx.person.update({
          where: { id: firstParticipant.personId },
          data: updatePersonData(data.firstPerson)
        }),
        tx.person.update({
          where: { id: secondParticipant.personId },
          data: updatePersonData(data.secondPerson)
        })
      ]);
      
      const [declaration] = await Promise.all([
        tx.declaration.update({
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
        }),
        tx.declarationHistory.create({
          data: {
            declarationId,
            type: 'UPDATE',
            description: 'Declaração atualizada via Server Action',
            updatedBy: session.user?.email || session.user?.name || 'Sistema',
          },
        })
      ]);
      
      return declaration;
    }, {
      timeout: 20000
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
    
    if (error instanceof Error && (error.message.includes('Transaction already closed') || error.message.includes('timeout'))) {
      return { success: false, error: 'Operação demorou muito para ser processada. Tente novamente.' };
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