"use client";

import { useState, useEffect, useCallback } from 'react';
import { Command } from "cmdk";
import { Search } from 'lucide-react';
import { toast } from "sonner";
import { searchAcuityClients, getAcuityClientMapping } from "@/app/actions/acuity";
import { ClientData, SearchResult } from "@/types/declarations";

interface ClientSearchProps {
  onClientSelect: (client: ClientData) => void;
}

const MINIMUM_SEARCH_LENGTH = 3;
const DEBOUNCE_DELAY = 300;

export function ClientSearch({ onClientSelect }: ClientSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [clientResults, setClientResults] = useState<ClientData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchClientData = useCallback(async (searchTerm: string) => {
    if (!searchTerm || searchTerm.length < MINIMUM_SEARCH_LENGTH) {
      setClientResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const result: SearchResult<ClientData[]> = await searchAcuityClients(searchTerm);
      
      if (result.success && result.data) {
        setClientResults(result.data);
      } else {
        toast.error(result.error || 'Erro ao buscar clientes');
        setClientResults([]);
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
      toast.error('Erro ao buscar clientes do Acuity');
      setClientResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const debounceTimer = setTimeout(() => fetchClientData(searchQuery), DEBOUNCE_DELAY);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery, fetchClientData]);

  const handleClientSelection = useCallback(async (clientId: string) => {
    try {
      const result: SearchResult<ClientData> = await getAcuityClientMapping(clientId);
      
      if (result.success && result.data) {
        onClientSelect(result.data);
        toast.success('Dados do cliente importados com sucesso');
      } else {
        toast.error(result.error || 'Erro ao importar dados');
      }
    } catch (error) {
      console.error('Error fetching client details:', error);
      toast.error('Erro ao importar dados do cliente');
    }
  }, [onClientSelect]);

  const shouldShowResults = searchQuery.length >= MINIMUM_SEARCH_LENGTH;

  return (
    <div className="relative">
      <Command className="relative rounded-lg border shadow-md">
        <div className="flex items-center border-b px-3">
          <Search className="h-4 w-4 shrink-0 opacity-50" />
          <Command.Input
            value={searchQuery}
            onValueChange={setSearchQuery}
            className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="Digite o nome ou email do cliente..."
          />
        </div>
        
        {shouldShowResults && (
          <Command.List className="max-h-[300px] overflow-y-auto p-2">
            {isLoading ? (
              <Command.Loading>Buscando clientes...</Command.Loading>
            ) : clientResults.length > 0 ? (
              clientResults.map(client => (
                <Command.Item
                  key={client.id}
                  value={`${client.firstName} ${client.lastName}`}
                  onSelect={() => handleClientSelection(client.id)}
                  className="flex items-center px-2 py-1.5 text-sm rounded-sm cursor-pointer hover:bg-accent"
                >
                  <div className="flex flex-col">
                    <span className="font-medium">
                      {client.firstName} {client.lastName}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {client.email} • {client.phone}
                    </span>
                  </div>
                </Command.Item>
              ))
            ) : (
              <Command.Empty>Nenhum cliente encontrado</Command.Empty>
            )}
          </Command.List>
        )}
      </Command>
    </div>
  );
}