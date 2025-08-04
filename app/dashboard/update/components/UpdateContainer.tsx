'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { SearchComponent } from './SearchComponent';
import { UpdateForm } from './UpdateForm';
import { getDeclarationByIdAction } from '../actions/get-declaration';
import { transformDeclarationToFormData } from '../utils/transformers';
import { UpdateFormData, DeclarationWithRelations } from '../types';

export const UpdateContainer = () => {
  const [selectedDeclaration, setSelectedDeclaration] = useState<DeclarationWithRelations | null>(null);
  const [formData, setFormData] = useState<Partial<UpdateFormData> | null>(null);
  const [isLoading, startTransition] = useTransition();

  const handleSelectDeclaration = (declarationId: string) => {
    startTransition(async () => {
      try {
        const declaration = await getDeclarationByIdAction(declarationId);
        
        if (!declaration) {
          toast.error('Registro não encontrado');
          return;
        }

        const transformedData = transformDeclarationToFormData(declaration);
        setFormData(transformedData);
        setSelectedDeclaration(declaration);
        toast.success('Registro carregado com sucesso');
      } catch (error) {
        toast.error('Erro ao carregar registro');
      }
    });
  };

  const handleUpdateSuccess = () => {
    setSelectedDeclaration(null);
    setFormData(null);
    toast.success('Retornando à busca');
  };

  const handleBackToSearch = () => {
    setSelectedDeclaration(null);
    setFormData(null);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-5xl px-4 py-8">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground">Carregando registro...</p>
          </div>
        </div>
      </div>
    );
  }

  if (selectedDeclaration && formData) {
    return (
      <UpdateForm
        declaration={selectedDeclaration}
        declarationId={selectedDeclaration.id}
        initialData={formData}
        onSuccess={handleUpdateSuccess}
        onBack={handleBackToSearch}
      />
    );
  }

  return <SearchComponent onSelectDeclaration={handleSelectDeclaration} />;
};