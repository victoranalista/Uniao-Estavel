import { Prisma } from '@prisma/client';
import { ICheckResult } from './types';

const checker = async (
  prisma: Prisma.TransactionClient,
  userHistoryId: number
): Promise<ICheckResult | false> => {
  const userHistoryData = await prisma.userHistory.findFirst({
    where: { id: userHistoryId },
    include: {
      user: {
        select: {
          id: true,
          versions: {
            orderBy: { version: 'desc' },
            take: 1,
            select: { id: true }
          }
        }
      }
    }
  });
  if (
    !userHistoryData ||
    !userHistoryData.user ||
    !userHistoryData.user.versions[0] ||
    userHistoryData.user.versions[0].id !== userHistoryId
  )
    return false;
  return {
    id: userHistoryData.id,
    version: userHistoryData.version,
    userId: userHistoryData.user.id,
    name: userHistoryData.name,
    email: userHistoryData.email,
    role: userHistoryData.role,
    status: userHistoryData.status,
    password: userHistoryData.password
  };
};

export default checker;
