"use client";

import { useTransition } from 'react';
import { DeclarationCard } from './DeclarationCard';
import { generateSecondCopyAction } from '../actions/generate-pdf';
import { DeclarationSearchResult } from '../types';
import { toast } from "sonner";

interface ResultsListProps {
  results: DeclarationSearchResult[];
}

export const ResultsList = ({ results }: ResultsListProps) => {
  const [isGenerating, startTransition] = useTransition();

  const handleGeneratePdf = (declarationId: string) => {
    startTransition(async () => {
      const result = await generateSecondCopyAction(declarationId);
      if (result.success && result.data) {
        downloadPdfFile(result.data.pdfContent, result.data.filename);
        toast.success('PDF gerado com sucesso');
      } else {
        toast.error(result.error || 'Erro ao gerar PDF');
      }
    });
  };

  const downloadPdfFile = (pdfContent: string, filename: string) => {
    const byteCharacters = atob(pdfContent);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  if (results.length === 0) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">
        Resultados da Busca ({results.length})
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {results.map((declaration) => (
          <DeclarationCard
            key={declaration.id}
            declaration={declaration}
            onSelect={handleGeneratePdf}
          />
        ))}
      </div>
      {isGenerating && (
        <div className="text-center text-muted-foreground">
          Gerando PDF...
        </div>
      )}
    </div>
  );
};