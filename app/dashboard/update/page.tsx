"use client";

import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from 'lucide-react';
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface Declaration {
  id: string;
  firstPerson: { name: string; cpf: string };
  secondPerson: { name: string; cpf: string };
  date: string;
  registryBook: string;
  registryPage: string;
  registryTerm: string;
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

  const handleUpdate = async () => {
    if (!declaration) return;

    setIsUpdating(true);
    try {
      const response = await fetch(`/api/registrations/${declaration.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...declaration,
          averbation: averbation.trim()
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao atualizar registro');
      }

      // Generate updated PDF with averbation
      const pdfResponse = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...declaration,
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
          <Card className="p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Registro Encontrado</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p><strong>Declarantes:</strong></p>
                  <p>{declaration.firstPerson.name} e {declaration.secondPerson.name}</p>
                </div>
                <div>
                  <p><strong>Data:</strong></p>
                  <p>{new Date(declaration.date).toLocaleDateString('pt-BR')}</p>
                </div>
                <div>
                  <p><strong>Livro:</strong></p>
                  <p>{declaration.registryBook}</p>
                </div>
                <div>
                  <p><strong>Folha:</strong></p>
                  <p>{declaration.registryPage}</p>
                </div>
                <div>
                  <p><strong>Termo:</strong></p>
                  <p>{declaration.registryTerm}</p>
                </div>
              </div>

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
                  onClick={handleUpdate}
                  disabled={isUpdating || !averbation.trim()}
                  className="w-full bg-gray-200 hover:bg-gray-300"
                >
                  {isUpdating ? "Atualizando..." : "Atualizar Registro"}
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}