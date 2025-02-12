"use client";

import { useState, useEffect } from 'react';
import { Command } from "cmdk";
import { Search } from 'lucide-react';

interface Person {
  name: string;
  nationality: string;
  civilStatus: string;
  birthDate: string;
  birthPlace: string;
  profession: string;
  rg: string;
  cpf: string;
  address: string;
  email: string;
  phone: string;
  fatherName: string;
  motherName: string;
  registryOffice: string;
  registryBook: string;
  registryPage: string;
  registryTerm: string;
}

interface Declaration {
  id: string;
  unionStartDate: string;
  firstPerson: Person;
  secondPerson: Person;
}

interface DeclarationSearchProps {
  onDeclarationSelect: (declaration: Declaration) => void;
}

export function DeclarationSearch({ onDeclarationSelect }: DeclarationSearchProps) {
  const [search, setSearch] = useState('');
  const [declarations, setDeclarations] = useState<Declaration[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchDeclarations = async () => {
      if (!search) {
        setDeclarations([]);
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(`/api/declarations?search=${encodeURIComponent(search)}`);
        if (!response.ok) throw new Error('Failed to fetch declarations');
        const data = await response.json();
        setDeclarations(data);
      } catch (error) {
        console.error('Error fetching declarations:', error);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(fetchDeclarations, 300);
    return () => clearTimeout(debounce);
  }, [search]);

  return (
    <div className="relative">
      <Command className="relative rounded-lg border shadow-md">
        <div className="flex items-center border-b px-3">
          <Search className="h-4 w-4 shrink-0 opacity-50" />
          <Command.Input
            value={search}
            onValueChange={setSearch}
            className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="Buscar declaração..."
          />
        </div>
        {search && (
          <Command.List className="max-h-[300px] overflow-y-auto p-2">
            {loading ? (
              <Command.Loading>Buscando declarações...</Command.Loading>
            ) : declarations.length > 0 ? (
              declarations.map(declaration => (
                <Command.Item
                  key={declaration.id}
                  value={`${declaration.firstPerson.name} e ${declaration.secondPerson.name}`}
                  onSelect={() => onDeclarationSelect(declaration)}
                  className="flex items-center px-2 py-1.5 text-sm rounded-sm cursor-pointer hover:bg-accent"
                >
                  <div className="flex flex-col">
                    <span className="font-medium">
                      {declaration.firstPerson.name} e {declaration.secondPerson.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      União desde: {new Date(declaration.unionStartDate).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </Command.Item>
              ))
            ) : (
              <Command.Empty>Nenhuma declaração encontrada</Command.Empty>
            )}
          </Command.List>
        )}
      </Command>
    </div>
  );
}