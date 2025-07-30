"use client";

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, FileText, Plus, RefreshCw } from 'lucide-react';
import { RegistrationData, RegistrationSearchParams } from "@/types/declarations";

interface DashboardAction {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  route: string;
}

const DASHBOARD_ACTIONS: DashboardAction[] = [
  {
    id: 'new-registration',
    title: 'Novo Registro',
    description: 'Criar nova declaração de união estável',
    icon: Plus,
    route: '/dashboard/new-registration'
  },
  {
    id: 'second-copy',
    title: 'Segunda Via',
    description: 'Emitir segunda via de declaração',
    icon: FileText,
    route: '/dashboard/documents'
  },
  {
    id: 'update',
    title: 'Atualização',
    description: 'Atualizar informações de registro\nUpload de selo',
    icon: RefreshCw,
    route: '/dashboard/update'
  }
];

const SearchField = ({ 
  label, 
  placeholder, 
  value, 
  onChange, 
  type = "text" 
}: {
  label: string;
  placeholder: string;
  value: string | number | undefined;
  onChange: (value: string) => void;
  type?: string;
}) => (
  <div>
    <label className="block text-sm font-medium mb-1">
      {label}
    </label>
    <Input
      type={type}
      placeholder={placeholder}
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);

export default function Dashboard() {
  const router = useRouter();
  const [searchParameters, setSearchParameters] = useState<RegistrationSearchParams>({});
  const [searchResults, setSearchResults] = useState<RegistrationData[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const updateSearchParameter = useCallback(<K extends keyof RegistrationSearchParams>(
    key: K,
    value: RegistrationSearchParams[K]
  ) => {
    setSearchParameters(prev => ({ ...prev, [key]: value }));
  }, []);

  const executeSearch = useCallback(async () => {
    const hasSearchCriteria = Object.values(searchParameters).some(value => 
      value !== undefined && value !== '' && value !== null
    );

    if (!hasSearchCriteria) return;

    setIsSearching(true);
    try {
      const response = await fetch('/api/registrations/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(searchParameters),
      });
      
      if (!response.ok) throw new Error('Falha na busca');
      
      const data: RegistrationData[] = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [searchParameters]);

  const navigateToAction = useCallback((route: string) => {
    router.push(route);
  }, [router]);

  const navigateToRegistration = useCallback((registrationId: string, action: 'view' | 'edit') => {
    const route = action === 'view' 
      ? `/dashboard/registrations/${registrationId}`
      : `/dashboard/registrations/${registrationId}/edit`;
    router.push(route);
  }, [router]);

  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black to-gray-800">
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">
            Cartório Colorado - Sistema de União Estável
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {DASHBOARD_ACTIONS.map((action) => {
            const IconComponent = action.icon;
            return (
              <Card key={action.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="p-3 rounded-full">
                    <IconComponent className="h-6 w-6" />
                  </div>
                  <h2 className="text-xl font-semibold">{action.title}</h2>
                  <p className="whitespace-pre-line">{action.description}</p>
                  <Button 
                    className="w-full"
                    onClick={() => navigateToAction(action.route)}
                  >
                    {action.id === 'new-registration' && 'Registrar União'}
                    {action.id === 'second-copy' && 'Emitir Documento'}
                    {action.id === 'update' && 'Atualizar'}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>

        <Card className="p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Buscar Registro</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <SearchField
              label="Número de Protocolo"
              placeholder="Digite o número do protocolo"
              value={searchParameters.protocolNumber}
              onChange={(value) => updateSearchParameter('protocolNumber', value)}
            />
            <SearchField
              label="Nome do Primeiro Declarante"
              placeholder="Digite o nome"
              value={searchParameters.firstPersonName}
              onChange={(value) => updateSearchParameter('firstPersonName', value)}
            />
            <SearchField
              label="Nome do Segundo Declarante"
              placeholder="Digite o nome"
              value={searchParameters.secondPersonName}
              onChange={(value) => updateSearchParameter('secondPersonName', value)}
            />
            <SearchField
              label="Livro"
              placeholder="UE-1"
              value={searchParameters.bookNumber}
              onChange={(value) => updateSearchParameter('bookNumber', value)}
            />
            <SearchField
              label="Folha"
              placeholder="1"
              type="number"
              value={searchParameters.pageNumber}
              onChange={(value) => updateSearchParameter('pageNumber', value ? parseInt(value) : undefined)}
            />
            <SearchField
              label="Termo"
              placeholder="1"
              type="number"
              value={searchParameters.termNumber}
              onChange={(value) => updateSearchParameter('termNumber', value ? parseInt(value) : undefined)}
            />
          </div>
          
          <Button
            onClick={executeSearch}
            disabled={isSearching}
            className="w-full"
          >
            {isSearching ? (
              "Buscando..."
            ) : (
              <>
                <Search className="w-4 h-4 mr-2" />
                Buscar
              </>
            )}
          </Button>
        </Card>

        {searchResults.length > 0 && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Resultados da Busca</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      Protocolo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      Declarantes
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      Data da União
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      Livro/Folha/Termo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {searchResults.map((registration) => (
                    <tr key={registration.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {registration.protocolNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {registration.firstPersonName} e {registration.secondPersonName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {formatDate(registration.unionDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {registration.bookNumber}/{registration.pageNumber}/{registration.termNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Button
                          variant="outline"
                          size="sm"
                          className="mr-2"
                          onClick={() => navigateToRegistration(registration.id, 'view')}
                        >
                          Visualizar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigateToRegistration(registration.id, 'edit')}
                        >
                          Editar
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}