'use server';
import { revalidatePath } from 'next/cache';
import { requireSession } from '@/lib/requireSession';
import { Prisma, Role } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import type { ActionResult } from '@/types/declarations';
import { validateDeclarationData, type DeclarationData, type PersonData } from '../../new-registration/actions/schemas';
import { convertFormDataToDeclarationInput } from '../../new-registration/utils/utils';
import { handleActionError } from '../../new-registration/actions/error-handler';

const combineBirthPlace = (state: string, city: string): string => {
  if (!state && !city) return '';
  if (!state) return city;
  if (!city) return state;
  return `${city}, ${state}`;
};

const updatePersonData = (personData: PersonData) => ({
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

export const updateDeclarationAction = async (
  declarationId: string, 
  formData: FormData
): Promise<ActionResult<string>> => {
  try {
    const session = await requireSession([Role.ADMIN, Role.USER]);
    const declarationInput = convertFormDataToDeclarationInput(formData);
    if (!declarationInput.registrarName) {
      return { success: false, error: 'Nome do registrador é obrigatório.' };
    }
    const data = validateDeclarationData({ ...declarationInput, registrarName: declarationInput.registrarName });
    
    const updatedDeclaration = await prisma.$transaction(async (tx) => {
      const existingDeclaration = await tx.declaration.findUnique({
        where: { id: declarationId },
        include: {
          participants: {
            include: { person: true }
          }
        }
      });
      
      if (!existingDeclaration) throw new Error('Declaração não encontrada');
      
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
    return { success: true, data: updatedDeclaration.id };
  } catch (error) {
    const result = handleActionError(error as Error);
    return { success: false, error: result.error };
  }
};

export const updateDeclarationRecord = async (
  tx: Prisma.TransactionClient,
  declarationId: string,
  data: DeclarationData
) => {
  return await tx.declaration.update({
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
      prenuptial: data.pactDate
        ? {
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
          }
        : undefined,
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
};

export const updatePersonRecord = async (tx: any, personId: string, personData: PersonData) => {
  return await tx.person.update({
    where: { id: personId },
    data: updatePersonData(personData)
  });
};

export const createDeclarationHistory = async (tx: any, declarationId: string, updatedBy: string) => {
  return await tx.declarationHistory.create({
    data: {
      declarationId,
      type: 'UPDATE',
      description: 'Declaração atualizada via Server Action',
      updatedBy,
    },
  });
};