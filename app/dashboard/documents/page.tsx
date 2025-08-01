"use client";

import { useState, useTransition, useCallback } from 'react';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from 'lucide-react';
import { toast } from "sonner";
import { searchDocumentsAction, generateSecondCopyAction } from "@/app/dashboard/search/actions/searchActions";
import type { SearchFormData, DeclarationData } from "@/types/declarations";

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

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('pt-BR');
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

const DeclarationDisplayCard = ({ declarationData }: { declarationData: DeclarationData }) => (
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

const downloadPdfFile = (pdfContent: string, filename: string) => {
  const byteCharacters = atob(pdfContent);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], { type: 'application/pdf' });
  const url = window.URL.createObjectURL(blob);
  const downloadLink = document.createElement('a');
  downloadLink.href = url;
  downloadLink.download = filename;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  downloadLink.remove();
  window.URL.revokeObjectURL(url);
};

const extractPersonFromParticipant = (participant: any) => ({
  name: participant?.person?.identity?.fullName || '',
  nationality: participant?.person?.identity?.nationality || '',
  civilStatus: participant?.person?.civilStatuses?.[0]?.status || '',
  birthDate: participant?.person?.identity?.birthDate || '',
  birthPlaceState: participant?.person?.addresses?.[0]?.state || '',
  birthPlaceCity: participant?.person?.addresses?.[0]?.city || '',
  profession: participant?.person?.professional?.profession || '',
  rg: participant?.person?.documents?.rg || '',
  taxpayerId: participant?.person?.identity?.taxId || '',
  address: participant?.person?.addresses?.[0]?.street || '',
  email: participant?.person?.contact?.email || '',
  phone: participant?.person?.contact?.phone || '',
  fatherName: participant?.person?.family?.fatherName || '',
  motherName: participant?.person?.family?.motherName || '',
  registryOffice: participant?.person?.registry?.registryOffice || '',
  registryBook: participant?.person?.registry?.registryBook || '',
  registryPage: participant?.person?.registry?.registryPage || '',
  registryTerm: participant?.person?.registry?.registryTerm || '',
});

const mapDeclarationFromResponse = (declaration: any): DeclarationData => ({
  id: declaration.id,
  createdAt: declaration.createdAt,
  updatedAt: declaration.updatedAt,
  declarationDate: declaration.declarationDate,
  city: declaration.city,
  state: declaration.state,
  unionStartDate: declaration.unionStartDate,
  propertyRegime: declaration.propertyRegime,
  firstPerson: extractPersonFromParticipant(declaration.participants?.[0]),
  secondPerson: extractPersonFromParticipant(declaration.participants?.[1]),
  registryInfo: declaration.registryInfo,
  prenuptial: declaration.prenuptial,
  date: '',
  pactDate: undefined
});

export default function Documents() {
  const [searchFormData, setSearchFormData] = useState<SearchFormData>({
    protocolNumber: '',
    taxpayerId: ''
  });
  const [foundDeclaration, setFoundDeclaration] = useState<DeclarationData | null>(null);
  const [isSearching, startSearchTransition] = useTransition();
  const [isGeneratingPdf, startPdfTransition] = useTransition();

  const updateSearchField = useCallback(<K extends keyof SearchFormData>(
    field: K,
    value: SearchFormData[K]
  ) => {
    setSearchFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const executeDeclarationSearch = useCallback(() => {
    const { protocolNumber, taxpayerId } = searchFormData;
    if (!protocolNumber && !taxpayerId) {
      toast.error('Digite um CPF ou protocolo para buscar');
      return;
    }
    startSearchTransition(async () => {
      const result = await searchDocumentsAction({ protocolNumber, taxpayerId });
      if (result.success && result.data) {
        const mappedDeclaration = mapDeclarationFromResponse(result.data);
        setFoundDeclaration(mappedDeclaration);
        toast.success('Declaração encontrada');
      } else {
        setFoundDeclaration(null);
        toast.error(result.error || 'Nenhuma declaração encontrada');
      }
    });
  }, [searchFormData]);

  const generatePDFDocument = useCallback(() => {
    if (!foundDeclaration) {
      toast.error('Nenhuma declaração selecionada');
      return;
    }
    startPdfTransition(async () => {
      const result = await generateSecondCopyAction(foundDeclaration.id);
      if (result.success && result.data?.pdfContent && result.data?.filename) {
        downloadPdfFile(result.data.pdfContent, result.data.filename);
        toast.success('PDF gerado com sucesso');
      } else {
        toast.error(result.error || 'Erro ao gerar PDF');
      }
    });
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
              label="CPF do Declarante"
              placeholder="Digite o CPF (com ou sem pontuação)"
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
                disabled={isGeneratingPdf}
                className="w-full"
              >
                {isGeneratingPdf ? "Gerando PDF..." : "Gerar PDF da Segunda Via"}
              </Button>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}