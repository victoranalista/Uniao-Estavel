"use client";

import { useState, useEffect } from 'react';
import { Command } from "cmdk";
import { Search } from 'lucide-react';

interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

interface ClientSearchProps {
  onClientSelect: (client: Client) => void;
}

export function ClientSearch({ onClientSelect }: ClientSearchProps) {
  const [search, setSearch] = useState('');
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchClients = async () => {
      if (!search) {
        setClients([]);
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(`/api/acuity/clients?search=${encodeURIComponent(search)}`);
        if (!response.ok) throw new Error('Failed to fetch clients');
        const data = await response.json();
        setClients(data);
      } catch (error) {
        console.error('Error fetching clients:', error);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(fetchClients, 300);
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
            placeholder="Buscar cliente..."
          />
        </div>
        {search && (
          <Command.List className="max-h-[300px] overflow-y-auto p-2">
            {loading ? (
              <Command.Loading>Buscando clientes...</Command.Loading>
            ) : clients.length > 0 ? (
              clients.map(client => (
                <Command.Item
                  key={client.id}
                  value={`${client.firstName} ${client.lastName}`}
                  onSelect={() => onClientSelect(client)}
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