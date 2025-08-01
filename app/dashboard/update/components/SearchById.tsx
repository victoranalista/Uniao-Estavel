'use client';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from 'lucide-react';

type SearchByIdProps = {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onSearch: () => void;
  isLoading: boolean;
};

export const SearchById = ({
  searchTerm,
  onSearchChange,
  onSearch,
  isLoading
}: SearchByIdProps) => (
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