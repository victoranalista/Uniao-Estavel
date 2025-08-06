import { Prisma } from '@prisma/client';

export interface UserVersionCheckResult {
  id: number;
  version: number;
  userId: number;
  name: string;
  email: string;
  role: string;
  status: string;
}

const checker = async (
  prisma: Prisma.TransactionClient,
  userHistoryId: number
): Promise<UserVersionCheckResult | false> => {
  const userHistoryData = await prisma.userHistory.findFirst({
    where: { id: userHistoryId },
    select: {
      id: true,
      version: true,
      name: true,
      email: true,
      role: true,
      status: true,
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
    !userHistoryData?.user?.versions[0] ||
    userHistoryData.user.versions[0].id !== userHistoryId
  ) {
    return false;
  }

  return {
    id: userHistoryData.id,
    version: userHistoryData.version,
    userId: userHistoryData.user.id,
    name: userHistoryData.name,
    email: userHistoryData.email,
    role: userHistoryData.role,
    status: userHistoryData.status
  };
};

export default checker;
