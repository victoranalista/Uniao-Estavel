"use client";

import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from 'lucide-react';

export default function Documents() {
  const [protocolNumber, setProtocolNumber] = useState('');
  const [isSearching, setIsSearching] = useState(false);

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
                  Buscar Documento
                </>
              )}
            </Button>
          </div>
        </Card>

        <p className="text-center text-gray-300">
          Digite o número de protocolo para buscar e gerar a segunda via do documento.
        </p>
      </div>
    </div>
  );
}