"use client";

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DeclarationForm } from "@/app/dashboard/new-registration/components/DeclarationForm";
import { ClientSearch } from "@/app/dashboard/search/components/ClientSearch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, FileText, Users } from "lucide-react";
import { ClientData, MappedDeclaration } from "@/app/types/declarations";

const mapClientToFormData = (declaration: MappedDeclaration) => ({
  unionStartDate: declaration.unionStartDate,
  firstPerson: {
    ...declaration.firstPerson,
    typeRegistry: 'NASCIMENTO'
  },
  secondPerson: {
    ...declaration.secondPerson,
    typeRegistry: 'NASCIMENTO'
  }
});

const SuccessNotification = ({ isVisible }: { isVisible: boolean }) => {
  if (!isVisible) return null;
  return (
    <Alert className="border-green-200 bg-green-50">
      <CheckCircle className="h-4 w-4 text-green-600" />
      <AlertDescription className="text-green-800">
        Cliente importado com sucesso! Os dados foram preenchidos no formulário abaixo.
      </AlertDescription>
    </Alert>
  );
};

const PageHeader = () => (
  <div className="space-y-6">
    <div className="flex items-center gap-3">
      <div className="p-2 bg-primary/10 rounded-lg">
        <FileText className="h-6 w-6 text-primary" />
      </div>
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Novo Registro</h1>
        <p className="text-muted-foreground">Criar nova declaração de união estável</p>
      </div>
    </div>
    <Separator />
  </div>
);

const ImportSection = ({ onClientSelect, hasSelectedClient }: {
  onClientSelect: (client: ClientData) => void;
  hasSelectedClient: boolean;
}) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Users className="h-5 w-5" />
        Importar Cliente
      </CardTitle>
      <CardDescription>
        Busque e importe dados de clientes cadastrados no Acuity para acelerar o preenchimento
      </CardDescription>
    </CardHeader>
    <CardContent className="space-y-4">
      <ClientSearch onClientSelect={onClientSelect} />
      {hasSelectedClient && (
        <Badge variant="secondary" className="flex items-center gap-1 w-fit">
          <CheckCircle className="h-3 w-3" />
          Cliente selecionado
        </Badge>
      )}
    </CardContent>
  </Card>
);

export default function NewRegistration() {
  const [selectedClientData, setSelectedClientData] = useState<ClientData | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const router = useRouter();
  const handleClientSelection = useCallback((client: ClientData) => {
    setSelectedClientData(client);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 5000);
  }, []);
  const handleSuccessNavigation = useCallback(() => {
    router.push('/dashboard');
  }, [router]);
  return (
    <div className="container mx-auto py-8 space-y-8">
      <PageHeader />
      <div className="grid gap-8">
        <ImportSection 
          onClientSelect={handleClientSelection}
          hasSelectedClient={!!selectedClientData}
        />
        <SuccessNotification isVisible={showSuccess} />
        <DeclarationForm 
          initialData={selectedClientData?.declaration ? mapClientToFormData(selectedClientData.declaration) : undefined} 
          onSuccess={handleSuccessNavigation}
        />
      </div>
    </div>
  );
}