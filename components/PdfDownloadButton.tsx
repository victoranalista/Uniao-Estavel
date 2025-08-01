'use client';

import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { downloadPdfAction } from '@/app/dashboard/update/actions';

interface PdfDownloadButtonProps {
  declarationId: string;
  fileName?: string;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export const PdfDownloadButton = ({ 
  declarationId, 
  fileName = 'declaracao', 
  variant = 'default',
  size = 'default'
}: PdfDownloadButtonProps) => {
  const [isPending, startTransition] = useTransition();

  const handleDownload = () => {
    if (!declarationId) {
      toast.error('ID da declaração não fornecido');
      return;
    }
    startTransition(async () => {
      const result = await downloadPdfAction(declarationId);
      if (result.success && result.data) {
        downloadPdfFile(result.data.pdfContent, result.data.filename);
        toast.success('PDF baixado com sucesso');
      } else {
        toast.error(result.error || 'Erro ao baixar PDF');
      }
    });
  };

  return (
    <Button
      onClick={handleDownload}
      disabled={isPending}
      variant={variant}
      size={size}
    >
      {isPending ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Download className="mr-2 h-4 w-4" />
      )}
      {isPending ? 'Gerando...' : 'Baixar PDF'}
    </Button>
  );
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
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};