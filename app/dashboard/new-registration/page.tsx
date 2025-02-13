"use client";

import { useState } from 'react';
import { DeclarationForm } from "@/components/DeclarationForm";
import { ClientSearch } from "@/components/ClientSearch";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

export default function NewRegistration() {
  const [selectedClient, setSelectedClient] = useState(null);

  const handleClientSelect = (client: any) => {
    setSelectedClient(client);
  };

  const handleSubmit = async (formData: any) => {
    try {
      const response = await fetch('/api/registrations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Erro ao salvar registro');
      }

      const data = await response.json();
      toast.success('Registro salvo com sucesso!');
      return data;
    } catch (error) {
      console.error('Error:', error);
      toast.error('Erro ao salvar registro');
      throw error;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black to-gray-900">
      <div className="max-w-7xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-white mb-8">
          Novo Registro de União Estável
        </h1>

        <Card className="p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Importar Cliente do Acuity</h2>
          <ClientSearch onClientSelect={handleClientSelect} />
          {selectedClient && (
            <div className="mt-4 p-4 bg-green-50 rounded-md">
              <p className="text-green-800">
                Cliente importado com sucesso! Os dados foram preenchidos no formulário abaixo.
              </p>
            </div>
          )}
        </Card>

        <DeclarationForm 
          initialData={selectedClient?.declaration} 
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}