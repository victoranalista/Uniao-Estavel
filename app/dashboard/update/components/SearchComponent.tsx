'use client';

import { useState, useTransition } from 'react';
import { Search, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { SearchResult } from '../types';
import { searchDeclarationsAction } from '../../documents/actions/search';

interface SearchComponentProps {
  onSelectDeclaration: (declarationId: string) => void;
}

type SearchType = 'name' | 'taxpayerId';

const validateSearchTerm = (searchTerm: string): boolean => {
  return searchTerm.trim().length >= 2;
};

const formatUnionDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('pt-BR');
};

const createSearchParams = (searchTerm: string, searchType: SearchType) => {
  return searchType === 'name' 
    ? { name: searchTerm.trim() }
    : { taxpayerId: searchTerm.trim() };
};

const showSearchToast = (resultsLength: number) => {
  if (resultsLength === 0) {
    toast.info('Nenhum registro encontrado');
    return;
  }
  toast.success(`${resultsLength} registro(s) encontrado(s)`);
};

export const SearchComponent = ({ onSelectDeclaration }: SearchComponentProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState<SearchType>('name');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, startTransition] = useTransition();

  const executeSearch = () => {
    if (!validateSearchTerm(searchTerm)) {
      toast.error('Digite pelo menos 2 caracteres para buscar');
      return;
    }
    startTransition(async () => {
      try {
        const searchParams = createSearchParams(searchTerm, searchType);
        const searchResults = await searchDeclarationsAction(searchParams);
        if (searchResults.success && searchResults.data) {
          setResults(searchResults.data);
          showSearchToast(searchResults.data.length);
        } else {
          setResults([]);
          toast.error(searchResults.error || 'Erro ao buscar registros');
        }
      } catch {
        setResults([]);
        toast.error('Erro ao buscar registros');
      }
    });
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      executeSearch();
    }
  };

  const getInputPlaceholder = () => {
    return searchType === 'name' 
      ? 'Digite o nome do declarante...' 
      : 'Digite o CPF (com ou sem pontuação)...';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <Search className="h-5 w-5" />
          Buscar Registro para Atualização
        </CardTitle>
        <CardDescription>
          Encontre o registro que deseja atualizar por nome ou CPF
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex gap-4">
          <div className="flex-1">
            <Input
              placeholder={getInputPlaceholder()}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>
          <Select value={searchType} onValueChange={(value: SearchType) => setSearchType(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Nome</SelectItem>
              <SelectItem value="taxpayerId">CPF</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={executeSearch} disabled={isSearching}>
            {isSearching ? 'Buscando...' : 'Buscar'}
          </Button>
        </div>
        {results.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-medium">Resultados encontrados:</h3>
            {results.map((result) => (
              <Card 
                key={result.id} 
                className="cursor-pointer hover:bg-accent/50 transition-colors"
                onClick={() => onSelectDeclaration(result.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        <span className="font-medium">
                          {result.participants[0]?.person.identity.fullName} & {result.participants[1]?.person.identity.fullName}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Data da União: {formatUnionDate(result.unionStartDate)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        CPFs: {result.participants[0]?.person.identity.taxId} • {result.participants[1]?.person.identity.taxId}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="outline">
                        {result.protocolNumber}
                      </Badge>
                      <Badge variant="secondary">
                        {result.propertyRegime}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};