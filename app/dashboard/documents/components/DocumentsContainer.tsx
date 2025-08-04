"use client";

import { useState } from 'react';
import { SearchForm } from './SearchForm';
import { ResultsList } from './ResultsList';
import { DeclarationSearchResult } from '../types';

export const DocumentsContainer = () => {
  const [searchResults, setSearchResults] = useState<DeclarationSearchResult[]>([]);

  const handleSearchResults = (results: DeclarationSearchResult[]) => {
    setSearchResults(results);
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">
          Segunda Via de Documentos
        </h1>
        <p className="text-muted-foreground mt-2">
          Busque e gere segunda via de declarações de união estável
        </p>
      </div>

      <SearchForm onResults={handleSearchResults} />
      
      <ResultsList results={searchResults} />
    </div>
  );
};