"use client";
import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Upload } from 'lucide-react';
import { parseXMLSeals } from '@/utils/bookControl';

export default function Update() {
  const [protocolNumber, setProtocolNumber] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [seals, setSeals] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const handleSearch = async () => {
    setIsSearching(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      if (!text.includes('loteDeSelos')) {
        throw new Error('Arquivo XML inválido. Deve conter lote de selos.');
      }
      const newSeals = parseXMLSeals(text);
      if (newSeals.length === 0) {
        throw new Error('Nenhum selo encontrado no arquivo.');
      }
      setSeals(prevSeals => {
        const uniqueNewSeals = newSeals.filter(seal => !prevSeals.includes(seal));
        return [...prevSeals, ...uniqueNewSeals];
      });
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao processar arquivo');
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
                Número de Protocolo
              </label>
              <Input
                type="text"
                placeholder="Digite o número do protocolo"
                value={protocolNumber}
                onChange={(e) => setProtocolNumber(e.target.value)}
              />
            </div>
            <Button
              onClick={handleSearch}
              disabled={isSearching || !protocolNumber}
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
        <Card className="p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Carregar Lote de Selos</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-2 text-gray-500" />
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Clique para carregar</span> ou arraste o arquivo XML
                  </p>
                  <p className="text-xs text-gray-500">Arquivo XML de lote de selos</p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept=".xml"
                  onChange={handleFileUpload}
                />
              </label>
            </div>
            {error && (
              <div className="p-4 text-sm text-red-700 bg-red-100 rounded-lg">
                {error}
              </div>
            )}
            {seals.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Selos Disponíveis ({seals.length})</h3>
                <div className="max-h-48 overflow-y-auto bg-gray-50 rounded-lg p-4">
                  {seals.map((seal, index) => (
                    <div key={seal} className="text-sm text-gray-600 mb-1">
                      {index + 1}. {seal}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
        <p className="text-center text-gray-600">
          Digite o número de protocolo para buscar e atualizar o registro.
        </p>
      </div>
    </div>
  );
}