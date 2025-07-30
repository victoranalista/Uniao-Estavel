"use client";

import { useState, useTransition, useCallback } from 'react';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Search } from 'lucide-react';
import { toast } from "sonner";
import { DeclarationForm } from "@/components/DeclarationForm";
import { DeclarationSearch } from "@/components/DeclarationSearch";
import { getDeclaration, updateDeclaration } from "@/app/actions/declarations";
import { DeclarationData, SearchDeclarationResult, PropertyRegime, SearchResult } from "@/types/declarations";

interface HistoryEntry {
  id: string;
  type: 'UPDATE' | 'SECOND_COPY';
  description: string;
  averbation?: string;
  updatedBy: string;
  updatedAt: string;
}

const formatDeclarationForForm = (data: DeclarationData): DeclarationData => ({
  ...data,
  date: new Date(data.date).toISOString().split('T')[0],
  unionStartDate: new Date(data.unionStartDate).toISOString().split('T')[0],
  pactDate: data.pactDate ? new Date(data.pactDate).toISOString().split('T')[0] : undefined,
  firstPerson: {
    ...data.firstPerson,
    birthDate: new Date(data.firstPerson.birthDate).toISOString().split('T')[0],
    divorceDate: data.firstPerson.divorceDate 
      ? new Date(data.firstPerson.divorceDate).toISOString().split('T')[0] 
      : undefined
  },
  secondPerson: {
    ...data.secondPerson,
    birthDate: new Date(data.secondPerson.birthDate).toISOString().split('T')[0],
    divorceDate: data.secondPerson.divorceDate 
      ? new Date(data.secondPerson.divorceDate).toISOString().split('T')[0] 
      : undefined
  }
});

const HistorySection = ({ historyEntries }: { historyEntries: HistoryEntry[] }) => (
  <Card className="p-6 mb-8">
    <h2 className="text-xl font-semibold mb-4">Histórico de Alterações</h2>
    <div className="space-y-4">
      {historyEntries.length > 0 ? (
        historyEntries.map((entry) => (
          <div key={entry.id} className="border-l-4 pl-4">
            <p className="font-semibold">
              {entry.type === 'UPDATE' ? 'Atualização' : 'Segunda Via'}
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

const SearchByIdSection = ({ 
  searchTerm, 
  onSearchChange, 
  onSearch, 
  isLoading 
}: {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onSearch: () => void;
  isLoading: boolean;
}) => (
  <div>
    <label className="block text-sm font-medium mb-1">
      Buscar por ID da Declaração
    </label>
    <Input
      type="text"
      placeholder="Digite o ID da declaração"
      value={searchTerm}
      onChange={(e) => onSearchChange(e.target.value)}
    />
    <Button
      onClick={onSearch}
      disabled={isLoading || !searchTerm}
      className="w-full mt-2"
    >
      {isLoading ? "Buscando..." : (
        <>
          <Search className="w-4 h-4 mr-2" />
          Buscar por ID
        </>
      )}
    </Button>
  </div>
);

const AverbationSection = ({ 
  averbationText, 
  onAverbationChange 
}: {
  averbationText: string;
  onAverbationChange: (value: string) => void;
}) => (
  <Card className="p-6 mb-8">
    <h2 className="text-xl font-semibold mb-4">Atualizar Registro</h2>
    <div className="mb-6">
      <label className="block text-sm font-medium mb-2">
        Averbação
      </label>
      <Textarea
        placeholder="Digite o texto da averbação..."
        value={averbationText}
        onChange={(e) => onAverbationChange(e.target.value)}
        className="min-h-[100px]"
      />
    </div>
  </Card>
);

export default function Update() {
  const [searchTerm, setSearchTerm] = useState('');
  const [declarationData, setDeclarationData] = useState<DeclarationData | null>(null);
  const [averbationText, setAverbationText] = useState('');
  const [isLoading, startTransition] = useTransition();

  const searchDeclarationById = useCallback(async (id: string) => {
    if (!id) {
      toast.error('Digite um ID para buscar');
      return;
    }

    startTransition(async () => {
      try {
        const result = await getDeclaration(id);
        
        if (result.success && result.data) {
          const formattedData = formatDeclarationForForm(result.data as any);
          setDeclarationData(formattedData);
          toast.success('Declaração encontrada');
        } else {
          toast.error(result.error || 'Declaração não encontrada');
          setDeclarationData(null);
        }
      } catch (error) {
        console.error('Search error:', error);
        toast.error('Erro ao buscar declaração');
        setDeclarationData(null);
      }
    });
  }, []);

  const handleDeclarationSelection = useCallback((selected: SearchDeclarationResult) => {
    const convertedData: DeclarationData = {
      id: selected.id,
      date: new Date().toISOString().split('T')[0],
      city: 'Brasília',
      state: 'DF',
      unionStartDate: selected.unionStartDate,
      propertyRegime: 'COMUNHAO_PARCIAL' as PropertyRegime,
      registrarName: '',
      firstPerson: selected.firstPerson,
      secondPerson: selected.secondPerson,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    const formattedData = formatDeclarationForForm(convertedData);
    setDeclarationData(formattedData);
  }, []);

  const handleUpdateSuccess = useCallback(() => {
    toast.success('Registro atualizado com sucesso');
    setAverbationText('');
    if (declarationData) {
      searchDeclarationById(declarationData.id);
    }
  }, [declarationData, searchDeclarationById]);

  const handleSearchExecution = useCallback(() => {
    searchDeclarationById(searchTerm);
  }, [searchTerm, searchDeclarationById]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black to-gray-900">
      <div className="max-w-7xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-8">
          Atualização de Registro
        </h1>

        <Card className="p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Buscar Declaração</h2>
          <div className="space-y-4">
            <DeclarationSearch onDeclarationSelect={handleDeclarationSelection} />
            <div className="text-center">ou</div>
            <SearchByIdSection
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              onSearch={handleSearchExecution}
              isLoading={isLoading}
            />
          </div>
        </Card>

        {declarationData && (
          <>
            <HistorySection historyEntries={declarationData.history || []} />
            <AverbationSection 
              averbationText={averbationText}
              onAverbationChange={setAverbationText}
            />
            <DeclarationForm 
              declarationId={declarationData.id}
              initialData={declarationData}
              onSuccess={handleUpdateSuccess}
            />
          </>
        )}
      </div>
    </div>
  );
}
