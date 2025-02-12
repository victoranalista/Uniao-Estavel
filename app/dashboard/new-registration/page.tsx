"use client";

import { useState } from 'react';
import { DeclarationForm } from "@/components/DeclarationForm";
import { DeclarationSearch } from "@/components/DeclarationSearch";
import { Card } from "@/components/ui/card";

export default function NewRegistration() {
  const [selectedDeclaration, setSelectedDeclaration] = useState(null);

  const handleDeclarationSelect = (declaration: any) => {
    setSelectedDeclaration(declaration);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black to-gray-900">
      <div className="max-w-7xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-white mb-8">
          Novo Registro de União Estável
        </h1>

        <Card className="p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Importar Agendamento</h2>
          <DeclarationSearch onDeclarationSelect={handleDeclarationSelect} />
        </Card>

        <DeclarationForm selectedDeclaration={selectedDeclaration} />
      </div>
    </div>
  );
}