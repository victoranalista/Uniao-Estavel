'use client';

import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useTransition } from 'react';
import { toast } from "sonner";
import { FileDown } from 'lucide-react';
import { addAverbationAction, generatePdfWithAverbationsAction } from '../actions/actions';

type AverbationSectionProps = {
  declarationId: string;
  averbationText: string;
  onAverbationChange: (value: string) => void;
  onSuccess: () => void;
};

export const AverbationSection = ({ 
  declarationId,
  averbationText, 
  onAverbationChange,
  onSuccess
}: AverbationSectionProps) => {
  const [isPending, startTransition] = useTransition();
  const [isGeneratingPdf, startPdfGeneration] = useTransition();

  const handleSubmit = () => {
    if (!averbationText.trim()) {
      toast.error('Digite o texto da averbação');
      return;
    }

    startTransition(async () => {
      const result = await addAverbationAction(declarationId, averbationText);
      
      if (result.success) {
        toast.success('Averbação adicionada com sucesso');
        onAverbationChange('');
        onSuccess();
      } else {
        toast.error(result.error || 'Erro ao adicionar averbação');
      }
    });
  };

  const handleGeneratePdf = () => {
    startPdfGeneration(async () => {
      const result = await generatePdfWithAverbationsAction(declarationId);
      
      if (result.success && result.data) {
        const { pdfContent, filename } = result.data;
        const byteCharacters = atob(pdfContent);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast.success('PDF gerado com sucesso');
      } else {
        toast.error(result.error || 'Erro ao gerar PDF');
      }
    });
  };

  return (
    <Card className="p-6 mb-8">
      <h2 className="text-xl font-semibold mb-4">Adicionar Averbação</h2>
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">
          Texto da Averbação
        </label>
        <Textarea
          placeholder="Digite o texto da averbação..."
          value={averbationText}
          onChange={(e) => onAverbationChange(e.target.value)}
          className="min-h-[100px]"
        />
      </div>
      <div className="flex gap-3">
        <Button 
          onClick={handleSubmit}
          disabled={isPending || !averbationText.trim()}
          className="flex-1"
        >
          {isPending ? 'Adicionando...' : 'Adicionar Averbação'}
        </Button>
        <Button 
          onClick={handleGeneratePdf}
          disabled={isGeneratingPdf}
          variant="outline"
          className="flex items-center gap-2"
        >
          <FileDown className="w-4 h-4" />
          {isGeneratingPdf ? 'Gerando...' : 'Gerar PDF'}
        </Button>
      </div>
    </Card>
  );
};