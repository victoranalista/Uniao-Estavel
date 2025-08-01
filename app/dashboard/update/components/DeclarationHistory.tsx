'use client';

import { Card } from "@/components/ui/card";
import { DeclarationHistoryEntry } from '@/types/declarations';

type HistoryProps = {
  entries: DeclarationHistoryEntry[];
};

export const DeclarationHistory = ({ entries }: HistoryProps) => (
  <Card className="p-6 mb-8">
    <h2 className="text-xl font-semibold mb-4">Histórico de Alterações</h2>
    <div className="space-y-4">
      {entries.length > 0 ? (
        entries.map((entry) => (
          <div key={entry.id} className="border-l-4 pl-4">
            <p className="font-semibold">
              {entry.type === 'UPDATE' ? 'Atualização' : 
               entry.type === 'SECOND_COPY' ? 'Segunda Via' : 'Averbação'}
            </p>
            <p>{entry.description}</p>
            {entry.averbation && (
              <p>Averbação: {entry.averbation}</p>
            )}
            <p className="text-sm">
              Por: {entry.updatedBy} em {new Date(entry.updatedAt).toLocaleString('pt-BR')}
            </p>
          </div>
        ))
      ) : (
        <p>Nenhuma alteração registrada</p>
      )}
    </div>
  </Card>
);