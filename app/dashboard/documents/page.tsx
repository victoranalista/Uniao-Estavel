"use client";

import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from 'lucide-react';
import { toast } from "sonner";

interface Declaration {
  id: string;
  firstPerson: { name: string; cpf: string };
  secondPerson: { name: string; cpf: string };
  date: string;
  createdAt: string;
}

export default function Documents() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [declaration, setDeclaration] = useState<Declaration | null>(null);

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

      // Generate PDF for the found declaration
      const pdfResponse = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data[0]),
      });

      if (!pdfResponse.ok) {
        throw new Error('Erro ao gerar PDF');
      }

      const blob = await pdfResponse.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'segunda-via-declaracao.pdf';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Erro ao buscar declaração');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black to-gray-900">
      <div className="max-w-7xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-white mb-8">
          Segunda Via de Documentos
        </h1>

        <Card className="p-6 mb-8">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-black mb-1">
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
                  Buscar Documento
                </>
              )}
            </Button>
          </div>
        </Card>

        {declaration && (
          <Card className="p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Declaração Encontrada</h2>
            <div className="space-y-2">
              <p><strong>Declarantes:</strong> {declaration.firstPerson.name} e {declaration.secondPerson.name}</p>
              <p><strong>Data:</strong> {new Date(declaration.date).toLocaleDateString('pt-BR')}</p>
              <p><strong>Data de Registro:</strong> {new Date(declaration.createdAt).toLocaleDateString('pt-BR')}</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}