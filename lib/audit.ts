import { prisma } from '@/lib/prisma';
import { AuditOperation } from '@prisma/client';

interface AuditData {
  tableName: string;
  recordId: string;
  operation: AuditOperation;
  fieldName?: string;
  oldValue?: string;
  newValue?: string;
  userId?: string;
  userName?: string;
  metadata?: Record<string, unknown>;
}

export const createAuditLog = async (data: AuditData) => {
  await prisma.auditLog.create({
    data: {
      tableName: data.tableName,
      recordId: data.recordId,
      operation: data.operation,
      fieldName: data.fieldName,
      oldValue: data.oldValue ? JSON.stringify(data.oldValue) : null,
      newValue: data.newValue ? JSON.stringify(data.newValue) : null,
      userId: data.userId,
      userName: data.userName,
      metadata: data.metadata ? JSON.stringify(data.metadata) : undefined,
    },
  });
};

export const auditFieldChanges = async (
  tableName: string,
  recordId: string,
  oldData: Record<string, unknown>,
  newData: Record<string, unknown>,
  userId?: string,
  userName?: string
) => {
  const changes = Object.keys(newData).filter(key => oldData[key] !== newData[key]);
  const auditPromises = changes.map(field => createAuditLog({
    tableName,
    recordId,
    operation: AuditOperation.UPDATE,
    fieldName: field,
    oldValue: String(oldData[field] ?? ''),
    newValue: String(newData[field] ?? ''),
    userId,
    userName,
  }));
  await Promise.all(auditPromises);
};

export const archiveRecord = async (
  tableName: string,
  recordId: string,
  userId?: string,
  userName?: string
) => {
  await createAuditLog({
    tableName,
    recordId,
    operation: AuditOperation.ARCHIVE,
    userId,
    userName,
  });
};

export const getAuditHistory = async (tableName: string, recordId: string) => {
  return await prisma.auditLog.findMany({
    where: { tableName, recordId },
    orderBy: { timestamp: 'desc' },
  });
};