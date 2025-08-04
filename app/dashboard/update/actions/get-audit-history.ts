'use server';

import { requireSession } from '@/lib/requireSession';
import { Role } from '@prisma/client';
import { getAuditHistory } from '@/lib/audit';

export const getAuditHistoryAction = async (declarationId: string) => {
  await requireSession([Role.ADMIN, Role.USER]);
  return await getAuditHistory('Declaration', declarationId);
};