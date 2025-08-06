'use server';
import { Role } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import checker from '../../versionChecker';
import { validationSchema } from '../../edit/[id]/validationSchema';
import { requireSession } from '@/lib/requireSession';
import { UpdateUserDataInput } from '../../types';

export async function updateUserDataAction(data: UpdateUserDataInput) {
  try {
    await requireSession([Role.ADMIN]);
    const validBody = await validationSchema.parse(data);
    if (!validBody) return { success: false, message: 'Invalid data type' };

    const { id: userHistoryId } = validBody;
    try {
      await prisma.$transaction(async (tx) => {
        const check = await checker(tx, userHistoryId);
        if (!check) throw new Error('User not found');

        const dataModified =
          check.name !== validBody.name ||
          check.email !== validBody.email ||
          check.role !== validBody.role ||
          check.status !== validBody.status;

        if (!dataModified) throw new Error('No data was modified');

        const existingUserHistory = await tx.userHistory.findUnique({
          where: { id: userHistoryId }
        });
        if (!existingUserHistory)
          throw new Error('UserHistory record not found');

        const existingUser = await tx.user.findUnique({
          where: { id: check.userId }
        });
        if (!existingUser) throw new Error('User record not found');

        await Promise.all([
          tx.userHistory.update({
            where: { id: userHistoryId },
            data: {
              name: validBody.name,
              email: validBody.email,
              role: validBody.role,
              status: validBody.status
            }
          }),
          tx.user.update({
            where: { id: check.userId },
            data: {
              status: validBody.status
            }
          })
        ]);
      });
      return { success: true, message: 'User updated successfully' };
    } catch (error: unknown) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'message' in error &&
        typeof (error as { message: unknown }).message === 'string'
      ) {
        const msg = (error as { message: string }).message;
        if (
          msg === 'No data was modified' ||
          msg === 'User not found' ||
          msg === 'UserHistory record not found' ||
          msg === 'User record not found'
        ) {
          return { success: false, message: msg };
        }
        console.error('ERROR: Error updating user:', error);
        return { success: false, message: 'Error updating user' };
      }
      console.error('ERROR: Error updating user:', error);
      return { success: false, message: 'Error updating user' };
    }
  } catch (error: unknown) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'message' in error &&
      typeof (error as { message: unknown }).message === 'string'
    ) {
      return {
        success: false,
        message: (error as { message: string }).message
      };
    }
    return { success: false, message: 'Invalid data type' };
  }
}
