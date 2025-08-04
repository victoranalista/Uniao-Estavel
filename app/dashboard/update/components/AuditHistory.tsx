'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Clock, User, FileText, Database } from 'lucide-react';
import { AuditOperation } from '@prisma/client';
import { JsonValue } from '@prisma/client/runtime/library';

interface AuditLog {
  id: string;
  userId: string | null;
  tableName: string;
  recordId: string;
  operation: AuditOperation;
  fieldName: string | undefined;
  oldValue: string | null;
  newValue: string | null;
  userName: string | null;
  timestamp: Date;
  metadata: JsonValue;
}

interface AuditHistoryProps {
  recordId: string;
  tableName: string;
}

const getOperationColor = (operation: AuditOperation) => {
  switch (operation) {
    case 'CREATE':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'UPDATE':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getOperationIcon = (operation: AuditOperation) => {
  switch (operation) {
    case 'CREATE':
      return <FileText className="h-4 w-4" />;
    case 'UPDATE':
      return <Database className="h-4 w-4" />;
    default:
      return <Database className="h-4 w-4" />;
  }
};

const formatTimestamp = (timestamp: Date) => {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).format(new Date(timestamp));
};

const fetchAuditLogs = async (recordId: string, tableName: string) => {
  const response = await fetch(`/api/audit/${tableName}/${recordId}`);
  if (!response.ok) throw new Error('Falha ao carregar histórico');
  return response.json();
};

const transformAuditData = (data: any[]): AuditLog[] => {
  return data.map(item => ({
    ...item,
    fieldName: item.fieldName ?? undefined
  }));
};

export const AuditHistory = ({ recordId, tableName }: AuditHistoryProps) => {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAuditHistory = async () => {
      try {
        setIsLoading(true);
        const logs = await fetchAuditLogs(recordId, tableName);
        const transformedLogs = transformAuditData(logs);
        setAuditLogs(transformedLogs);
      } catch {
        setError('Erro ao carregar histórico de auditoria');
      } finally {
        setIsLoading(false);
      }
    };
    loadAuditHistory();
  }, [recordId, tableName]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Histórico de Auditoria
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">Carregando histórico...</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Histórico de Auditoria
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-red-600">{error}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Histórico de Auditoria
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96">
          <div className="space-y-4">
            {auditLogs.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                Nenhum histórico encontrado
              </div>
            ) : (
              auditLogs.map((log, index) => (
                <div key={log.id}>
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-full ${getOperationColor(log.operation)}`}>
                      {getOperationIcon(log.operation)}
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className={getOperationColor(log.operation)}>
                          {log.operation}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {formatTimestamp(log.timestamp)}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <User className="h-4 w-4" />
                          <span className="font-medium">
                            {log.userName || 'Sistema'}
                          </span>
                        </div>
                        {log.fieldName && (
                          <div className="text-sm">
                            <span className="font-medium">Campo:</span> {log.fieldName}
                          </div>
                        )}
                        {log.oldValue && (
                          <div className="text-sm">
                            <span className="font-medium">Valor anterior:</span> {log.oldValue}
                          </div>
                        )}
                        {log.newValue && (
                          <div className="text-sm">
                            <span className="font-medium">Novo valor:</span> {log.newValue}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  {index < auditLogs.length - 1 && <Separator className="mt-4" />}
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};