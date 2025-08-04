"use client";

import { useState, useTransition } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search } from 'lucide-react';
import { SearchField } from './SearchField';
import { searchDeclarationsAction } from '../actions/search';
import { SearchParams, DeclarationSearchResult } from '../types';
import { toast } from "sonner";

interface SearchFormProps {
  onResults: (results: DeclarationSearchResult[]) => void;
}

export const SearchForm = ({ onResults }: SearchFormProps) => {
  const [searchParams, setSearchParams] = useState<SearchParams>({});
  const [isSearching, startTransition] = useTransition();

  const updateSearchParam = <K extends keyof SearchParams>(
    key: K,
    value: SearchParams[K]
  ) => {
    setSearchParams(prev => ({ ...prev, [key]: value }));
  };

  const handleSearch = () => {
    if (!searchParams.name && !searchParams.taxpayerId) {
      toast.error('Digite um nome ou CPF para buscar');
      return;
    }

    startTransition(async () => {
      const result = await searchDeclarationsAction(searchParams);
      if (result.success && result.data) {
        onResults(result.data);
        toast.success(`${result.data.length} registro(s) encontrado(s)`);
      } else {
        onResults([]);
        toast.error(result.error || 'Nenhum registro encontrado');
      }
    });
  };

  const hasSearchCriteria = !!(searchParams.name || searchParams.taxpayerId);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Buscar Declaração
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SearchField
            label="Nome do Declarante"
            placeholder="Digite o nome completo"
            value={searchParams.name || ''}
            onChange={(value) => updateSearchParam('name', value)}
          />
          <SearchField
            label="CPF do Declarante"
            placeholder="Digite o CPF (com ou sem pontuação)"
            value={searchParams.taxpayerId || ''}
            onChange={(value) => updateSearchParam('taxpayerId', value)}
          />
        </div>
        
        <Button
          onClick={handleSearch}
          disabled={isSearching || !hasSearchCriteria}
          className="w-full"
        >
          {isSearching ? "Buscando..." : (
            <>
              <Search className="w-4 h-4 mr-2" />
              Buscar Declarações
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};