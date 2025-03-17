"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, FileText, Plus, RefreshCw } from 'lucide-react';
import { Registration, RegistrationSearch } from '@/src/domain/entities/Registration';

export default function Dashboard() {
  const router = useRouter();
  const [searchParams, setSearchParams] = useState<RegistrationSearch>({});
  const [searchResults, setSearchResults] = useState<Registration[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    setIsSearching(true);
    try {
      const response = await fetch('/api/registrations/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(searchParams),
      });
      
      if (!response.ok) throw new Error('Falha na busca');
      
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black to-gray-800">
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">
            Cartório Colorado - Sistema de União Estável
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-3 bg-gray-300 rounded-full"> 
                <Plus className="h-6 w-6 text-black" />
              </div>
              <h2 className="text-xl-white font-semibold">Novo Registro</h2>
              <p className="text-gray-600">Criar nova declaração de união estável</p>
              <Button 
                className="w-full bg-gray-300 hover:bg-gray-400"
                onClick={() => router.push('/dashboard/new-registration')}
              >
                Registrar União
              </Button>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-3 bg-gray-300 rounded-full">
                <FileText className="h-6 w-6 text-black" />
              </div>
              <h2 className="text-xl font-semibold">Segunda Via</h2>
              <p className="text-gray-600">Emitir segunda via de declaração</p>
              <Button 
                className="w-full bg-gray-300 hover:bg-gray-400"
                onClick={() => router.push('/dashboard/documents')}
              >
                Emitir Documento
              </Button>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-3 bg-gray-300 rounded-full">
                <RefreshCw className="h-6 w-6 text-gray-900" />
              </div>
              <h2 className="text-xl font-semibold">Atualização</h2>
              <p className="text-gray-600">Atualizar informações de registro <br></br> Upload de selo</p>
              <Button 
                className="w-full bg-gray-300 hover:bg-gray-400"
                onClick={() => router.push('/dashboard/update')}
              >
                Atualizar
              </Button>
            </div>
          </Card>
        </div>

        <Card className="p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Buscar Registro</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Número de Protocolo
              </label>
              <Input
                type="text"
                placeholder="Digite o número do protocolo"
                onChange={(e) => setSearchParams({
                  ...searchParams,
                  protocolNumber: e.target.value
                })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome do Primeiro Declarante
              </label>
              <Input
                type="text"
                placeholder="Digite o nome"
                onChange={(e) => setSearchParams({
                  ...searchParams,
                  firstPersonName: e.target.value
                })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome do Segundo Declarante
              </label>
              <Input
                type="text"
                placeholder="Digite o nome"
                onChange={(e) => setSearchParams({
                  ...searchParams,
                  secondPersonName: e.target.value
                })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Livro
              </label>
              <Input
                type="text"
                placeholder="UE-1"
                onChange={(e) => setSearchParams({
                  ...searchParams,
                  bookNumber: e.target.value
                })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Folha
              </label>
              <Input
                type="number"
                placeholder="1"
                onChange={(e) => setSearchParams({
                  ...searchParams,
                  pageNumber: parseInt(e.target.value)
                })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Termo
              </label>
              <Input
                type="number"
                placeholder="1"
                onChange={(e) => setSearchParams({
                  ...searchParams,
                  termNumber: parseInt(e.target.value)
                })}
              />
            </div>
          </div>
          <Button
            onClick={handleSearch}
            disabled={isSearching}
            className="w-full bg-gray-300 hover:bg-gray-400"
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Protocolo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Declarantes
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data da União
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Livro/Folha/Termo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {searchResults.map((registration) => (
                    <tr key={registration.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {registration.protocolNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {registration.firstPersonName} e {registration.secondPersonName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(registration.unionDate).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {registration.bookNumber}/{registration.pageNumber}/{registration.termNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Button
                          variant="outline"
                          size="sm"
                          className="mr-2"
                          onClick={() => router.push(`/dashboard/registrations/${registration.id}`)}
                        >
                          Visualizar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/dashboard/registrations/${registration.id}/edit`)}
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