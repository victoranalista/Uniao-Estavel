"use client";

import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from 'lucide-react';
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { DeclarationForm } from "@/components/DeclarationForm";

interface Declaration {
  id: string;
  firstPerson: { 
    name: string; 
    cpf: string;
    nationality: string;
    civilStatus: string;
    birthDate: string;
    birthPlace: string;
    profession: string;
    rg: string;
    address: string;
    email: string;
    phone: string;
    fatherName: string;
    motherName: string;
    registryOffice: string;
    registryBook: string;
    registryPage: string;
    registryTerm: string;
    typeRegistry: string;
  };
  secondPerson: { 
    name: string; 
    cpf: string;
    nationality: string;
    civilStatus: string;
    birthDate: string;
    birthPlace: string;
    profession: string;
    rg: string;
    address: string;
    email: string;
    phone: string;
    fatherName: string;
    motherName: string;
    registryOffice: string;
    registryBook: string;
    registryPage: string;
    registryTerm: string;
    typeRegistry: string;
  };
  date: string;
  city: string;
  state: string;
  unionStartDate: string;
  propertyRegime: string;
  registrarName: string;
  pactDate?: string;
  pactOffice?: string;
  pactBook?: string;
  pactPage?: string;
  pactTerm?: string;
  createdAt: string;
  updatedAt: string;
  history?: Array<{
    id: string;
    type: 'UPDATE' | 'SECOND_COPY';
    description: string;
    averbation?: string;
    updatedBy: string;
    updatedAt: string;
  }>;
}

export default function Update() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [declaration, setDeclaration] = useState<Declaration | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [averbation, setAverbation] = useState('');

  const handleSearch = async () => {
    if (!searchTerm) {
      toast.error('Digite um CPF ou protocolo para buscar');
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(`/api/registrations?search=${encodeURIComponent(searchTerm)}`);
      if (!response.ok) {
        throw new Error('Erro ao buscar declaração');
      }

      const data = await response.json();
      if (data.length === 0) {
        toast.error('Nenhuma declaração encontrada');
        setDeclaration(null);
        return;
      }

      setDeclaration(data[0]);
      toast.success('Declaração encontrada');
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Erro ao buscar declaração');
    } finally {
      setIsSearching(false);
    }
  };

  const handleUpdate = async (formData: any) => {
    if (!declaration) return;

    setIsUpdating(true);
    try {
      const response = await fetch(`/api/registrations/${declaration.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          averbation: averbation.trim()
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao atualizar registro');
      }

      // Verificar se a averbação foi inserida
      if (averbation.trim()) {
        // Gerar o PDF atualizado com a averbação
        const pdfResponse = await fetch('/api/generate-pdf', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...formData,
            averbation: averbation.trim()
          }),
        });

        if (!pdfResponse.ok) {
          throw new Error('Erro ao gerar PDF atualizado');
        }

        const blob = await pdfResponse.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'declaracao-atualizada.pdf';
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      }

      toast.success('Registro atualizado com sucesso');
      setAverbation('');
      handleSearch(); // Refresh declaration data
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Erro ao atualizar registro');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black to-gray-900">
      <div className="max-w-7xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-white mb-8">
          Atualização de Registro
        </h1>

        <Card className="p-6 mb-8">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Número de Protocolo ou CPF
              </label>
              <Input
                type="text"
                placeholder="Digite o número do protocolo ou CPF"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button
              onClick={handleSearch}
              disabled={isSearching || !searchTerm}
              className="w-full bg-gray-200 hover:bg-gray-300"
            >
              {isSearching ? (
                "Buscando..."
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Buscar Registro
                </>
              )}
            </Button>
          </div>
        </Card>

        {declaration && (
          <>
            <Card className="p-6 mb-8">
              <h2 className="text-xl font-semibold mb-4">Histórico de Alterações</h2>
              <div className="space-y-4">
                {declaration.history && declaration.history.length > 0 ? (
                  declaration.history.map((entry) => (
                    <div key={entry.id} className="border-l-4 border-gray-300 pl-4">
                      <p className="font-semibold">{entry.type === 'UPDATE' ? 'Atualização' : 'Segunda Via'}</p>
                      <p>{entry.description}</p>
                      {entry.averbation && (
                        <p className="text-gray-600">Averbação: {entry.averbation}</p>
                      )}
                      <p className="text-sm text-gray-500">
                        Por: {entry.updatedBy} em {new Date(entry.updatedAt).toLocaleString('pt-BR')}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">Nenhuma alteração registrada</p>
                )}
              </div>
            </Card>

            <Card className="p-6 mb-8">
              <h2 className="text-xl font-semibold mb-4">Atualizar Registro</h2>
              <DeclarationForm 
                initialData={declaration}
                onSubmit={handleUpdate}
              />
              
              <div className="mt-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Averbação
                  </label>
                  <Textarea
                    placeholder="Digite o texto da averbação..."
                    value={averbation}
                    onChange={(e) => setAverbation(e.target.value)}
                    className="min-h-[100px]"
                  />
                </div>

                <Button
                  onClick={() => handleUpdate(declaration)}
                  disabled={isUpdating || !averbation.trim()}
                  className="w-full bg-gray-200 hover:bg-gray-300"
                >
                  {isUpdating ? "Atualizando..." : "Atualizar Registro"}
                </Button>
              </div>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
