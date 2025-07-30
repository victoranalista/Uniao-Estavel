"use client";

import { useState, useEffect, useCallback } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { toast } from "sonner";
import { searchDeclarationsAction } from "@/app/actions/declarations";
import { SearchDeclarationResult } from "@/types/declarations";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

interface DeclarationSearchProps {
  onDeclarationSelect: (declaration: SearchDeclarationResult) => void;
}

const MINIMUM_SEARCH_LENGTH = 2;
const DEBOUNCE_DELAY = 300;

const formatDeclarationDisplay = (declaration: SearchDeclarationResult) => {
  const firstPersonName = declaration.firstPerson.name;
  const secondPersonName = declaration.secondPerson.name;
  const unionDate = new Date(declaration.unionStartDate).toLocaleDateString('pt-BR');
  return {
    title: `${firstPersonName} e ${secondPersonName}`,
    subtitle: `União iniciada em ${unionDate}`
  };
};

const fetchDeclarations = async (searchTerm: string) => {
  if (!searchTerm || searchTerm.length < MINIMUM_SEARCH_LENGTH) {
    return [];
  }
  const result = await searchDeclarationsAction(searchTerm);
  if (result.success && result.data) {
    return result.data as SearchDeclarationResult[];
  } else {
    toast.error(result.error || 'Erro ao buscar declarações');
    return [];
  }
};

const renderDeclarationItem = (
  declaration: SearchDeclarationResult,
  onSelect: (declaration: SearchDeclarationResult) => void
) => {
  const display = formatDeclarationDisplay(declaration);
  return (
    <div key={declaration.id}>
      <Button
        variant="ghost"
        className="w-full justify-start h-auto p-3"
        onClick={() => onSelect(declaration)}
      >
        <div className="flex flex-col items-start text-left">
          <span className="font-medium">{display.title}</span>
          <span className="text-sm text-muted-foreground">{display.subtitle}</span>
          <Badge variant="outline" className="mt-1">
            ID: {declaration.id}
          </Badge>
        </div>
      </Button>
      <Separator />
    </div>
  );
};

const renderSearchResults = (
  isLoading: boolean,
  results: SearchDeclarationResult[],
  onSelect: (declaration: SearchDeclarationResult) => void
) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-6">
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
        <span className="text-sm text-muted-foreground">Buscando declarações...</span>
      </div>
    );
  }
  if (results.length === 0) {
    return (
      <div className="text-center p-6">
        <span className="text-sm text-muted-foreground">Nenhuma declaração encontrada</span>
      </div>
    );
  }
  return (
    <ScrollArea className="max-h-[300px]">
      {results.map(declaration => renderDeclarationItem(declaration, onSelect))}
    </ScrollArea>
  );
};

export function DeclarationSearch({ onDeclarationSelect }: DeclarationSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [declarationResults, setDeclarationResults] = useState<SearchDeclarationResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const performSearch = useCallback(async (searchTerm: string) => {
    setIsLoading(true);
    try {
      const results = await fetchDeclarations(searchTerm);
      setDeclarationResults(results);
    } catch (error) {
      toast.error('Erro ao buscar declarações');
      setDeclarationResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);
  useEffect(() => {
    const debounceTimer = setTimeout(() => performSearch(searchQuery), DEBOUNCE_DELAY);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery, performSearch]);
  const shouldShowResults = searchQuery.length >= MINIMUM_SEARCH_LENGTH;
  return (
    <div className="w-full max-w-md mx-auto">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar declaração por nome..."
          className="pl-10"
        />
      </div>
      {shouldShowResults && (
        <Card className="mt-2">
          <CardContent className="p-0">
            {renderSearchResults(isLoading, declarationResults, onDeclarationSelect)}
          </CardContent>
        </Card>
      )}
    </div>
  );
}