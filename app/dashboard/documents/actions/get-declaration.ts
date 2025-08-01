'use server';

import { prisma } from '@/lib/prisma';
import { requireSession } from '@/lib/requireSession';
import { Role } from '@prisma/client';
import { ActionResult } from '@/types/declarations';
import { handleActionError } from '../../new-registration/actions/error-handler';
import { createExtendedDeclarationInclude } from '../../new-registration/utils/prisma-helpers';

export const getDeclarationAction = async (declarationId: string): Promise<ActionResult> => {
  try {
    await requireSession([Role.ADMIN, Role.USER]);
    if (!declarationId) {
      return { success: false, error: 'ID da declaração é obrigatório' };
    }
    const declaration = await prisma.declaration.findUnique({
      where: { id: declarationId },
      include: createExtendedDeclarationInclude(),
    });
    if (!declaration) {
      return { success: false, error: 'Declaração não encontrada' };
    }
    return { success: true, data: declaration };
  } catch (error) {
    return handleActionError(error as Error);
  }
};

export const getDeclarationsAction = async (): Promise<ActionResult> => {
  try {
    await requireSession([Role.ADMIN, Role.USER]);
    const declarations = await prisma.declaration.findMany({
      include: createExtendedDeclarationInclude(),
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    return { success: true, data: declarations };
  } catch (error) {
    return handleActionError(error as Error);
  }
};