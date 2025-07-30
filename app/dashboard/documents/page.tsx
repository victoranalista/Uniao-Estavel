"use client";

import { useState, useTransition, useCallback } from 'react';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from 'lucide-react';
import { toast } from "sonner";
import { DeclarationData } from "@/types/declarations";

interface SearchFormData {
  protocolNumber: string;
  taxpayerId: string;
}

const SearchField = ({ 
  label, 
  placeholder, 
  value, 
  onChange, 
  type = "text" 
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) => (
  <div>
    <label className="block text-sm font-medium mb-1">
      {label}
    </label>
    <Input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);

const DeclarationDisplayCard = ({ declarationData }: { declarationData: DeclarationData }) => {
  const formatDate = (dateString: string) => 
    new Date(dateString).toLocaleDateString('pt-BR');

  return (
    <Card className="p-6 mb-8">
      <h2 className="text-xl font-semibold mb-4">Declaração Encontrada</h2>
      <div className="space-y-2">
        <p>
          <strong>Declarantes:</strong> {declarationData.firstPerson.name} e {declarationData.secondPerson.name}
        </p>
        <p>
          <strong>Data da União:</strong> {formatDate(declarationData.unionStartDate)}
        </p>
        <p>
          <strong>Data de Registro:</strong> {formatDate(declarationData.createdAt)}
        </p>
        <p>
          <strong>Regime de Bens:</strong> {getPropertyRegimeLabel(declarationData.propertyRegime)}
        </p>
      </div>
    </Card>
  );
};

const getPropertyRegimeLabel = (regime: string): string => {
  const regimeLabels: Record<string, string> = {
    'COMUNHAO_PARCIAL': 'Comunhão Parcial de Bens',
    'SEPARACAO_TOTAL': 'Separação Total de Bens',
    'PARTICIPACAO_FINAL': 'Participação Final nos Aquestos',
    'COMUNHAO_UNIVERSAL': 'Comunhão Universal de Bens',
  };
  return regimeLabels[regime] || regime;
};

export default function Documents() {
  const [searchFormData, setSearchFormData] = useState<SearchFormData>({
    protocolNumber: '',
    taxpayerId: ''
  });
  const [foundDeclaration, setFoundDeclaration] = useState<DeclarationData | null>(null);
  const [isSearching, startTransition] = useTransition();

  const updateSearchField = useCallback(<K extends keyof SearchFormData>(
    field: K,
    value: SearchFormData[K]
  ) => {
    setSearchFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const executeDeclarationSearch = useCallback(async () => {
    const { protocolNumber, taxpayerId } = searchFormData;
    const searchTerm = protocolNumber || taxpayerId;

    if (!searchTerm) {
      toast.error('Digite um taxpayerId ou protocolo para buscar');
      return;
    }

    startTransition(async () => {
      try {
        const response = await fetch(`/api/registrations?search=${encodeURIComponent(searchTerm)}`);
        
        if (!response.ok) {
          throw new Error('Erro ao buscar declaração');
        }
        
        const data: DeclarationData[] = await response.json();
        
        if (data.length === 0) {
          toast.error('Nenhuma declaração encontrada');
          setFoundDeclaration(null);
          return;
        }

        setFoundDeclaration(data[0]);
        toast.success('Declaração encontrada');
      } catch (error) {
        console.error('Search error:', error);
        toast.error('Erro ao buscar declaração');
        setFoundDeclaration(null);
      }
    });
  }, [searchFormData]);

  const generatePDFDocument = useCallback(async () => {
    if (!foundDeclaration) {
      toast.error('Nenhuma declaração selecionada');
      return;
    }

    try {
      const pdfResponse = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(foundDeclaration),
      });

      if (!pdfResponse.ok) {
        throw new Error('Erro ao gerar PDF');
      }

      const result = await pdfResponse.json();
      
      if (result.success && result.pdfContent) {
        const byteCharacters = atob(result.pdfContent);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/pdf' });
        
        const url = window.URL.createObjectURL(blob);
        const downloadLink = document.createElement('a');
        downloadLink.href = url;
        downloadLink.download = result.filename || `segunda-via-declaracao-${foundDeclaration.id}.pdf`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        downloadLink.remove();
        window.URL.revokeObjectURL(url);

        toast.success('PDF gerado com sucesso');
      } else {
        throw new Error(result.error || 'Erro ao processar PDF');
      }
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.error('Erro ao gerar PDF');
    }
  }, [foundDeclaration]);

  const hasSearchCriteria = searchFormData.protocolNumber || searchFormData.taxpayerId;

  return (
    <div className="min-h-screen bg-gradient-to-br from-black to-gray-900">
      <div className="max-w-7xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-white mb-8">
          Segunda Via de Documentos
        </h1>

        <Card className="p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Buscar Documento</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <SearchField
              label="Número de Protocolo"
              placeholder="Digite o número do protocolo"
              value={searchFormData.protocolNumber}
              onChange={(value) => updateSearchField('protocolNumber', value)}
            />
            <SearchField
              label="taxpayerId do Declarante"
              placeholder="Digite o taxpayerId (com ou sem pontuação)"
              value={searchFormData.taxpayerId}
              onChange={(value) => updateSearchField('taxpayerId', value)}
            />
          </div>
          
          <Button
            onClick={executeDeclarationSearch}
            disabled={isSearching || !hasSearchCriteria}
            className="w-full"
          >
            {isSearching ? "Buscando..." : (
              <>
                <Search className="w-4 h-4 mr-2" />
                Buscar Documento
              </>
            )}
          </Button>
        </Card>

        {foundDeclaration && (
          <>
            <DeclarationDisplayCard declarationData={foundDeclaration} />
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Gerar Segunda Via</h2>
              <p className="mb-4">
                Clique no botão abaixo para gerar e baixar a segunda via da declaração em PDF.
              </p>
              <Button
                onClick={generatePDFDocument}
                className="w-full"
              >
                Gerar PDF da Segunda Via
              </Button>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}