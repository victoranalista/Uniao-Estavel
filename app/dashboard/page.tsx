"use client";

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Search, FileText, Plus, RefreshCw, Eye, Edit } from 'lucide-react';
import { RegistrationSearchParams } from "@/types/declarations";

type RegistrationData = {
  id: string;
  protocolNumber: string;
  firstPersonName: string;
  secondPersonName: string;
  unionDate: string;
  bookNumber: string;
  pageNumber: number;
  termNumber: number;
};

interface DashboardAction {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  route: string;
  buttonText: string;
}

const DASHBOARD_ACTIONS: DashboardAction[] = [
  {
    id: 'new-registration',
    title: 'Novo Registro',
    description: 'Criar nova declaração de união estável',
    icon: Plus,
    route: '/dashboard/new-registration',
    buttonText: 'Registrar União'
  },
  {
    id: 'second-copy',
    title: 'Segunda Via',
    description: 'Emitir segunda via de declaração',
    icon: FileText,
    route: '/dashboard/documents',
    buttonText: 'Emitir Documento'
  },
  {
    id: 'update',
    title: 'Atualização',
    description: 'Atualizar informações de registro e upload de selo',
    icon: RefreshCw,
    route: '/dashboard/update',
    buttonText: 'Atualizar'
  }
];

const ActionCard = ({ action, onNavigate }: { action: DashboardAction; onNavigate: (route: string) => void }) => {
  const IconComponent = action.icon;
  
  return (
    <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105">
      <CardHeader className="text-center pb-4">
        <div className="flex justify-center mb-4">
          <div className="p-4 rounded-full bg-primary/10">
            <IconComponent className="h-8 w-8 text-primary" />
          </div>
        </div>
        <CardTitle className="text-xl">{action.title}</CardTitle>
        <CardDescription className="text-center">
          {action.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button 
          className="w-full" 
          onClick={() => onNavigate(action.route)}
          size="lg"
        >
          {action.buttonText}
        </Button>
      </CardContent>
    </Card>
  );
};

const SearchField = ({ 
  label, 
  placeholder, 
  value, 
  onChange, 
  type = "text" 
}: {
  label: string;
  placeholder: string;
  value: string | number | undefined;
  onChange: (value: string) => void;
  type?: string;
}) => (
  <div className="space-y-2">
    <Label htmlFor={label.toLowerCase().replace(/\s+/g, '-')}>{label}</Label>
    <Input
      id={label.toLowerCase().replace(/\s+/g, '-')}
      type={type}
      placeholder={placeholder}
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);

export default function Dashboard() {
  const router = useRouter();
  const [searchParameters, setSearchParameters] = useState<RegistrationSearchParams>({});
  const [searchResults, setSearchResults] = useState<RegistrationData[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const updateSearchParameter = useCallback(<K extends keyof RegistrationSearchParams>(
    key: K,
    value: RegistrationSearchParams[K]
  ) => {
    setSearchParameters(prev => ({ ...prev, [key]: value }));
  }, []);

  const executeSearch = useCallback(async () => {
    const hasSearchCriteria = Object.values(searchParameters).some(value => 
      value !== undefined && value !== '' && value !== null
    );

    if (!hasSearchCriteria) return;

    setIsSearching(true);
    try {
      const response = await fetch('/api/registrations/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(searchParameters),
      });
      
      if (!response.ok) throw new Error('Falha na busca');
      
      const data: RegistrationData[] = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [searchParameters]);

  const navigateToAction = useCallback((route: string) => {
    router.push(route);
  }, [router]);

  const navigateToRegistration = useCallback((registrationId: string, action: 'view' | 'edit') => {
    const route = action === 'view' 
      ? `/dashboard/registrations/${registrationId}`
      : `/dashboard/registrations/${registrationId}/edit`;
    router.push(route);
  }, [router]);

  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">
            Sistema de União Estável
          </h1>
          <p className="text-muted-foreground text-lg">
            RCPN
          </p>
        </div>

        <Separator />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {DASHBOARD_ACTIONS.map((action) => (
            <ActionCard 
              key={action.id} 
              action={action} 
              onNavigate={navigateToAction}
            />
          ))}
        </div>

        <Separator />

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Buscar Registro
            </CardTitle>
            <CardDescription>
              Pesquise por registros utilizando os filtros abaixo
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <SearchField
                label="Número de Protocolo"
                placeholder="Ex: 2024001"
                value={searchParameters.protocolNumber}
                onChange={(value) => updateSearchParameter('protocolNumber', value)}
              />
              <SearchField
                label="Primeiro Declarante"
                placeholder="Nome completo"
                value={searchParameters.firstPersonName}
                onChange={(value) => updateSearchParameter('firstPersonName', value)}
              />
              <SearchField
                label="Segundo Declarante"
                placeholder="Nome completo"
                value={searchParameters.secondPersonName}
                onChange={(value) => updateSearchParameter('secondPersonName', value)}
              />
              <SearchField
                label="Livro"
                placeholder="Ex: UE-1"
                value={searchParameters.bookNumber}
                onChange={(value) => updateSearchParameter('bookNumber', value)}
              />
              <SearchField
                label="Folha"
                placeholder="Número da folha"
                type="number"
                value={searchParameters.pageNumber}
                onChange={(value) => updateSearchParameter('pageNumber', value ? parseInt(value) : undefined)}
              />
              <SearchField
                label="Termo"
                placeholder="Número do termo"
                type="number"
                value={searchParameters.termNumber}
                onChange={(value) => updateSearchParameter('termNumber', value ? parseInt(value) : undefined)}
              />
            </div>
            
            <Button
              onClick={executeSearch}
              disabled={isSearching}
              className="w-full"
              size="lg"
            >
              {isSearching ? (
                "Buscando..."
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Buscar Registros
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {searchResults.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Resultados da Busca</CardTitle>
              <CardDescription>
                {searchResults.length} registro(s) encontrado(s)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Protocolo</TableHead>
                      <TableHead>Declarantes</TableHead>
                      <TableHead>Data da União</TableHead>
                      <TableHead>Localização</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {searchResults.map((registration) => (
                      <TableRow key={registration.id}>
                        <TableCell className="font-medium">
                          <Badge variant="outline">
                            {registration.protocolNumber}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">{registration.firstPersonName}</div>
                            <div className="text-sm text-muted-foreground">{registration.secondPersonName}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {formatDate(registration.unionDate)}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>Livro: {registration.bookNumber}</div>
                            <div>Folha: {registration.pageNumber} | Termo: {registration.termNumber}</div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigateToRegistration(registration.id, 'view')}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Ver
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigateToRegistration(registration.id, 'edit')}
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Editar
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}