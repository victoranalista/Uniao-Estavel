"use client";

import { useState, useTransition } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { toast } from "sonner";
import { searchAcuityClientsAction, getAcuityClientMappingAction } from "@/app/dashboard/search/actions/acuity";
import { ClientData } from "@/app/types/declarations";

interface ClientSearchProps {
  onClientSelect: (client: ClientData) => void;
}

export const ClientSearch = ({ onClientSelect }: ClientSearchProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<ClientData[]>([]);
  const [isSearching, startSearchTransition] = useTransition();
  const [isImporting, startImportTransition] = useTransition();

  const handleSearch = () => {
    if (!searchTerm.trim()) {
      toast.error('Digite um termo para buscar');
      return;
    }
    startSearchTransition(async () => {
      const result = await searchAcuityClientsAction(searchTerm);
      if (result.success) {
        setSearchResults(result.data as ClientData[] || []);
        if ((result.data as ClientData[])?.length === 0) {
          toast.info('Nenhum cliente encontrado');
        }
      } else {
        toast.error(result.error || 'Erro ao buscar clientes');
        setSearchResults([]);
      }
    });
  };

  const handleSelectClient = (client: ClientData) => {
    startImportTransition(async () => {
      const result = await getAcuityClientMappingAction(client.id);
      if (result.success) {
        onClientSelect(result.data as ClientData);
        toast.success('Cliente importado com sucesso');
      } else {
        toast.error(result.error || 'Erro ao importar cliente');
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Buscar no Acuity
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Digite nome ou email do cliente"
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button onClick={handleSearch} disabled={isSearching}>
            {isSearching ? 'Buscando...' : 'Buscar'}
          </Button>
        </div>
        
        {searchResults.length > 0 && (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {searchResults.map((client) => (
              <div
                key={client.id}
                className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                onClick={() => handleSelectClient(client)}
              >
                <div className="font-medium">{client.firstName} {client.lastName}</div>
                <div className="text-sm text-gray-600">{client.email}</div>
                <div className="text-sm text-gray-500">{client.phone}</div>
              </div>
            ))}
          </div>
        )}
        
        {isImporting && (
          <div className="text-center text-sm text-gray-600">
            Importando dados do cliente...
          </div>
        )}
      </CardContent>
    </Card>
  );
};
