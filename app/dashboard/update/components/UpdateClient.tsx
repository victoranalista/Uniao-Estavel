'use client';

import { useState, useTransition, useCallback } from 'react';
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { DeclarationForm } from "@/app/dashboard/new-registration/components/DeclarationForm";
import { DeclarationSearch } from "@/app/dashboard/search/components/DeclarationSearch";
import { getDeclarationByIdAction } from '../actions/actions';
import { DeclarationData, SearchDeclarationResult, PropertyRegime } from '@/types/declarations';
import { DeclarationHistory } from './DeclarationHistory';
import { SearchById } from './SearchById';
import { AverbationSection } from './AverbationSection';

const formatDeclarationForForm = (data: DeclarationData) => ({
  date: typeof data.date === 'string' ? data.date : new Date(data.date).toISOString().split('T')[0],
  city: data.city,
  state: data.state,
  unionStartDate: new Date(data.unionStartDate).toISOString().split('T')[0],
  propertyRegime: data.propertyRegime as PropertyRegime,
  pactDate: data.pactDate,
  registrarName: data.registryInfo?.registrarName || '',
  stamp: '',
  pactOffice: data.prenuptial?.pactOffice,
  pactBook: data.prenuptial?.pactBook,
  pactPage: data.prenuptial?.pactPage,
  pactTerm: data.prenuptial?.pactTerm,
  firstPerson: {
    ...data.firstPerson,
    typeRegistry: data.firstPerson.typeRegistry || 'NASCIMENTO',
    birthDate: new Date(data.firstPerson.birthDate).toISOString().split('T')[0],
    divorceDate: data.firstPerson.divorceDate 
      ? new Date(data.firstPerson.divorceDate).toISOString().split('T')[0] 
      : undefined
  },
  secondPerson: {
    ...data.secondPerson,
    typeRegistry: data.secondPerson.typeRegistry || 'NASCIMENTO',
    birthDate: new Date(data.secondPerson.birthDate).toISOString().split('T')[0],
    divorceDate: data.secondPerson.divorceDate 
      ? new Date(data.secondPerson.divorceDate).toISOString().split('T')[0] 
      : undefined
  }
});

export const UpdateClient = () => {
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
      const result = await getDeclarationByIdAction(id);
      
      if (result.success && result.data) {
        setDeclarationData(result.data);
        toast.success('Declaração encontrada');
      } else {
        toast.error(result.error || 'Declaração não encontrada');
        setDeclarationData(null);
      }
    });
  }, []);

  const handleDeclarationSelection = useCallback((selected: SearchDeclarationResult) => {
    searchDeclarationById(selected.id);
  }, [searchDeclarationById]);

  const handleUpdateSuccess = useCallback(() => {
    toast.success('Registro atualizado com sucesso');
    if (declarationData) {
      searchDeclarationById(declarationData.id);
    }
  }, [declarationData, searchDeclarationById]);

  const handleAverbationSuccess = useCallback(() => {
    if (declarationData) {
      searchDeclarationById(declarationData.id);
    }
  }, [declarationData, searchDeclarationById]);

  const handleSearchExecution = useCallback(() => {
    searchDeclarationById(searchTerm);
  }, [searchTerm, searchDeclarationById]);

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">
        Atualização de Registro
      </h1>

      <Card className="p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Buscar Declaração</h2>
        <div className="space-y-4">
          <DeclarationSearch onDeclarationSelect={handleDeclarationSelection} />
          <div className="text-center">ou</div>
          <SearchById
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onSearch={handleSearchExecution}
            isLoading={isLoading}
          />
        </div>
      </Card>

      {declarationData && (
        <>
          <DeclarationHistory entries={declarationData.history || []} />
          <AverbationSection 
            declarationId={declarationData.id}
            averbationText={averbationText}
            onAverbationChange={setAverbationText}
            onSuccess={handleAverbationSuccess}
          />
          <DeclarationForm 
            declarationId={declarationData.id}
            initialData={formatDeclarationForForm(declarationData)}
            onSuccess={handleUpdateSuccess}
          />
        </>
      )}
    </div>
  );
};