'use client';

import { useState, useTransition } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, FileText, Edit, Save, X } from 'lucide-react';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  addAverbationAction,
  generatePdfWithAverbationsAction,
  searchUpdateCandidatesAction,
  updateDeclarationDataAction
} from './actions';

type ActionResult = {
  success: boolean;
  error?: string;
  data?: any;
  changes?: string[];
};

type DeclarationData = {
  id: string;
  unionStartDate: Date;
  city: string;
  state: string;
  propertyRegime: string;
  participants: Array<{
    person: {
      identity: { 
        fullName: string;
        taxId: string;
        nationality: string;
        birthDate: Date;
        birthPlace: string;
      } | null;
      contact: {
        email: string;
        phone: string;
      } | null;
      professional: {
        profession: string;
      } | null;
      family: {
        fatherName: string;
        motherName: string;
      } | null;
      documents: {
        rg: string;
      } | null;
      addresses: Array<{
        street: string;
        number: string;
        complement?: string;
        neighborhood: string;
        city: string;
        state: string;
      }>;
      civilStatuses: Array<{
        status: string;
      }>;
    } | null;
  }>;
  registryInfo: {
    registrarName: string;
  } | null;
  history?: Array<{
    type: string;
    description: string;
    averbation: string | null;
    updatedAt: Date;
    updatedBy: string;
  }>;
};

const SearchSection = ({ onDeclarationFound }: { onDeclarationFound: (declaration: DeclarationData) => void }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, startSearchTransition] = useTransition();
  
  const handleSearch = () => {
    if (!searchTerm.trim()) {
      toast.error('Digite um termo para buscar');
      return;
    }
    startSearchTransition(async () => {
      const result = await searchUpdateCandidatesAction(searchTerm) as ActionResult;
      if (result.success && result.data && Array.isArray(result.data)) {
        const declarations = result.data as DeclarationData[];
        if (declarations.length > 0) {
          onDeclarationFound(declarations[0]);
          toast.success('Declaração encontrada');
        } else {
          toast.error('Nenhuma declaração encontrada');
        }
      } else {
        toast.error(result.error || 'Erro na busca');
      }
    });
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Buscar Declaração
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="search">CPF ou Nome</Label>
          <Input
            id="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Digite CPF ou nome para buscar"
          />
        </div>
        <Button onClick={handleSearch} disabled={isSearching} className="w-full">
          {isSearching ? 'Buscando...' : 'Buscar'}
        </Button>
      </CardContent>
    </Card>
  );
};

const EditDeclarationForm = ({ declaration, onUpdate }: { 
  declaration: DeclarationData; 
  onUpdate: (updatedDeclaration?: DeclarationData) => void;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, startUpdateTransition] = useTransition();
  const [formData, setFormData] = useState(() => buildInitialFormData(declaration));

  const handleSave = () => {
    startUpdateTransition(async () => {
      const result = await updateDeclarationDataAction(declaration.id, formData) as ActionResult;
      if (result.success) {
        toast.success(`Dados atualizados com sucesso${result.changes?.length ? `: ${result.changes.join(', ')}` : ''}`);
        setIsEditing(false);
        onUpdate();
      } else {
        toast.error(result.error || 'Erro ao atualizar dados');
      }
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  if (!isEditing) {
    return buildReadOnlyView(formData, setIsEditing);
  }

  return buildEditableView(formData, setFormData, handleSave, handleCancel, isUpdating);
};

const buildInitialFormData = (declaration: DeclarationData) => {
  const firstPerson = declaration.participants[0]?.person;
  const secondPerson = declaration.participants[1]?.person;
  return {
    city: declaration.city,
    state: declaration.state,
    unionStartDate: declaration.unionStartDate.toISOString().split('T')[0],
    propertyRegime: declaration.propertyRegime,
    registrarName: declaration.registryInfo?.registrarName || '',
    firstPerson: buildPersonFormData(firstPerson),
    secondPerson: buildPersonFormData(secondPerson)
  };
};

const buildPersonFormData = (person: any) => ({
  name: person?.identity?.fullName || '',
  cpf: person?.identity?.taxId || '',
  nationality: person?.identity?.nationality || '',
  birthDate: person?.identity?.birthDate?.toISOString().split('T')[0] || '',
  birthPlace: person?.identity?.birthPlace || '',
  profession: person?.professional?.profession || '',
  rg: person?.documents?.rg || '',
  email: person?.contact?.email || '',
  phone: person?.contact?.phone || '',
  fatherName: person?.family?.fatherName || '',
  motherName: person?.family?.motherName || '',
  civilStatus: person?.civilStatuses?.[0]?.status || '',
  address: buildPersonAddressString(person?.addresses)
});

const buildPersonAddressString = (addresses: any[]) => {
  if (!addresses?.[0]) return '';
  const addr = addresses[0];
  return `${addr.street}, ${addr.number}, ${addr.neighborhood}, ${addr.city}, ${addr.state}`;
};

const buildReadOnlyView = (formData: any, setIsEditing: (editing: boolean) => void) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center justify-between">
        Dados da Declaração
        <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
          <Edit className="h-4 w-4 mr-2" />
          Editar
        </Button>
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label className="font-semibold">Primeira Pessoa</Label>
          <p>{formData.firstPerson.name}</p>
          <p>{formData.firstPerson.email}</p>
          <p>{formData.firstPerson.profession}</p>
        </div>
        <div>
          <Label className="font-semibold">Segunda Pessoa</Label>
          <p>{formData.secondPerson.name}</p>
          <p>{formData.secondPerson.email}</p>
          <p>{formData.secondPerson.profession}</p>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <p><strong>Data da União:</strong> {new Date(formData.unionStartDate).toLocaleDateString('pt-BR')}</p>
        <p><strong>Cidade:</strong> {formData.city}, {formData.state}</p>
      </div>
      <p><strong>Regime de Bens:</strong> {getPropertyRegimeLabel(formData.propertyRegime)}</p>
      <p><strong>Registrador:</strong> {formData.registrarName}</p>
    </CardContent>
  </Card>
);

const buildEditableView = (formData: any, setFormData: any, handleSave: () => void, handleCancel: () => void, isUpdating: boolean) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center justify-between">
        Editar Declaração
        <div className="flex gap-2">
          <Button onClick={handleSave} disabled={isUpdating} size="sm">
            <Save className="h-4 w-4 mr-2" />
            {isUpdating ? 'Salvando...' : 'Salvar'}
          </Button>
          <Button onClick={handleCancel} variant="outline" size="sm">
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
        </div>
      </CardTitle>
    </CardHeader>
    <CardContent>
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="general">Dados Gerais</TabsTrigger>
          <TabsTrigger value="first">Primeira Pessoa</TabsTrigger>
          <TabsTrigger value="second">Segunda Pessoa</TabsTrigger>
        </TabsList>
        {buildEditableTabs(formData, setFormData)}
      </Tabs>
    </CardContent>
  </Card>
);

const buildEditableTabs = (formData: any, setFormData: any) => (
  <>
    <TabsContent value="general" className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="city">Cidade</Label>
          <Input
            id="city"
            value={formData.city}
            onChange={(e) => setFormData((prev: any) => ({ ...prev, city: e.target.value }))}
          />
        </div>
        <div>
          <Label htmlFor="state">Estado</Label>
          <Input
            id="state"
            value={formData.state}
            onChange={(e) => setFormData((prev: any) => ({ ...prev, state: e.target.value }))}
          />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="unionDate">Data da União</Label>
          <Input
            id="unionDate"
            type="date"
            value={formData.unionStartDate}
            onChange={(e) => setFormData((prev: any) => ({ ...prev, unionStartDate: e.target.value }))}
          />
        </div>
        <div>
          <Label htmlFor="regime">Regime de Bens</Label>
          <Select
            value={formData.propertyRegime}
            onValueChange={(value) => setFormData((prev: any) => ({ ...prev, propertyRegime: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="COMUNHAO_PARCIAL">Comunhão Parcial de Bens</SelectItem>
              <SelectItem value="SEPARACAO_TOTAL">Separação Total de Bens</SelectItem>
              <SelectItem value="PARTICIPACAO_FINAL">Participação Final nos Aquestos</SelectItem>
              <SelectItem value="COMUNHAO_UNIVERSAL">Comunhão Universal de Bens</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <Label htmlFor="registrar">Nome do Registrador</Label>
        <Input
          id="registrar"
          value={formData.registrarName}
          onChange={(e) => setFormData((prev: any) => ({ ...prev, registrarName: e.target.value }))}
        />
      </div>
    </TabsContent>
    {buildPersonEditTab('first', 'Primeira Pessoa', formData.firstPerson, setFormData)}
    {buildPersonEditTab('second', 'Segunda Pessoa', formData.secondPerson, setFormData)}
  </>
);

const buildPersonEditTab = (personKey: string, title: string, personData: any, setFormData: any) => (
  <TabsContent value={personKey} className="space-y-4">
    <h4 className="font-semibold">{title}</h4>
    <div className="grid gap-4 md:grid-cols-2">
      <div>
        <Label htmlFor={`${personKey}Name`}>Nome Completo</Label>
        <Input
          id={`${personKey}Name`}
          value={personData.name}
          onChange={(e) => setFormData((prev: any) => ({ 
            ...prev, 
            [`${personKey}Person`]: { ...prev[`${personKey}Person`], name: e.target.value }
          }))}
        />
      </div>
      <div>
        <Label htmlFor={`${personKey}Cpf`}>CPF</Label>
        <Input
          id={`${personKey}Cpf`}
          value={personData.cpf}
          onChange={(e) => setFormData((prev: any) => ({ 
            ...prev, 
            [`${personKey}Person`]: { ...prev[`${personKey}Person`], cpf: e.target.value }
          }))}
        />
      </div>
    </div>
    <div className="grid gap-4 md:grid-cols-2">
      <div>
        <Label htmlFor={`${personKey}Nationality`}>Nacionalidade</Label>
        <Input
          id={`${personKey}Nationality`}
          value={personData.nationality}
          onChange={(e) => setFormData((prev: any) => ({ 
            ...prev, 
            [`${personKey}Person`]: { ...prev[`${personKey}Person`], nationality: e.target.value }
          }))}
        />
      </div>
      <div>
        <Label htmlFor={`${personKey}BirthDate`}>Data de Nascimento</Label>
        <Input
          id={`${personKey}BirthDate`}
          type="date"
          value={personData.birthDate}
          onChange={(e) => setFormData((prev: any) => ({ 
            ...prev, 
            [`${personKey}Person`]: { ...prev[`${personKey}Person`], birthDate: e.target.value }
          }))}
        />
      </div>
    </div>
    <div className="grid gap-4 md:grid-cols-2">
      <div>
        <Label htmlFor={`${personKey}BirthPlace`}>Local de Nascimento</Label>
        <Input
          id={`${personKey}BirthPlace`}
          value={personData.birthPlace}
          onChange={(e) => setFormData((prev: any) => ({ 
            ...prev, 
            [`${personKey}Person`]: { ...prev[`${personKey}Person`], birthPlace: e.target.value }
          }))}
        />
      </div>
      <div>
        <Label htmlFor={`${personKey}CivilStatus`}>Estado Civil</Label>
        <Input
          id={`${personKey}CivilStatus`}
          value={personData.civilStatus}
          onChange={(e) => setFormData((prev: any) => ({ 
            ...prev, 
            [`${personKey}Person`]: { ...prev[`${personKey}Person`], civilStatus: e.target.value }
          }))}
        />
      </div>
    </div>
    <div className="grid gap-4 md:grid-cols-2">
      <div>
        <Label htmlFor={`${personKey}Profession`}>Profissão</Label>
        <Input
          id={`${personKey}Profession`}
          value={personData.profession}
          onChange={(e) => setFormData((prev: any) => ({ 
            ...prev, 
            [`${personKey}Person`]: { ...prev[`${personKey}Person`], profession: e.target.value }
          }))}
        />
      </div>
      <div>
        <Label htmlFor={`${personKey}Email`}>Email</Label>
        <Input
          id={`${personKey}Email`}
          type="email"
          value={personData.email}
          onChange={(e) => setFormData((prev: any) => ({ 
            ...prev, 
            [`${personKey}Person`]: { ...prev[`${personKey}Person`], email: e.target.value }
          }))}
        />
      </div>
    </div>
    <div className="grid gap-4 md:grid-cols-2">
      <div>
        <Label htmlFor={`${personKey}Phone`}>Telefone</Label>
        <Input
          id={`${personKey}Phone`}
          value={personData.phone}
          onChange={(e) => setFormData((prev: any) => ({ 
            ...prev, 
            [`${personKey}Person`]: { ...prev[`${personKey}Person`], phone: e.target.value }
          }))}
        />
      </div>
      <div>
        <Label htmlFor={`${personKey}Rg`}>RG</Label>
        <Input
          id={`${personKey}Rg`}
          value={personData.rg}
          onChange={(e) => setFormData((prev: any) => ({ 
            ...prev, 
            [`${personKey}Person`]: { ...prev[`${personKey}Person`], rg: e.target.value }
          }))}
        />
      </div>
    </div>
    <div className="grid gap-4 md:grid-cols-2">
      <div>
        <Label htmlFor={`${personKey}Father`}>Nome do Pai</Label>
        <Input
          id={`${personKey}Father`}
          value={personData.fatherName}
          onChange={(e) => setFormData((prev: any) => ({ 
            ...prev, 
            [`${personKey}Person`]: { ...prev[`${personKey}Person`], fatherName: e.target.value }
          }))}
        />
      </div>
      <div>
        <Label htmlFor={`${personKey}Mother`}>Nome da Mãe</Label>
        <Input
          id={`${personKey}Mother`}
          value={personData.motherName}
          onChange={(e) => setFormData((prev: any) => ({ 
            ...prev, 
            [`${personKey}Person`]: { ...prev[`${personKey}Person`], motherName: e.target.value }
          }))}
        />
      </div>
    </div>
  </TabsContent>
);

const AverbationSection = ({ declaration, onUpdate }: { 
  declaration: DeclarationData; 
  onUpdate: (updatedDeclaration: DeclarationData) => void;
}) => {
  const [averbationText, setAverbationText] = useState('');
  const [isAdding, startAddTransition] = useTransition();
  
  const handleAddAverbation = () => {
    if (!averbationText.trim()) {
      toast.error('Digite o texto da averbação');
      return;
    }
    startAddTransition(async () => {
      const result = await addAverbationAction(declaration.id, averbationText) as ActionResult;
      if (result.success && result.data) {
        toast.success('Averbação adicionada com sucesso');
        setAverbationText('');
        onUpdate(result.data as DeclarationData);
      } else {
        toast.error(result.error || 'Erro ao adicionar averbação');
      }
    });
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Adicionar Averbação</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="averbation">Texto da Averbação</Label>
          <Textarea
            id="averbation"
            value={averbationText}
            onChange={(e) => setAverbationText(e.target.value)}
            placeholder="Digite o texto da averbação"
            rows={4}
          />
        </div>
        <Button onClick={handleAddAverbation} disabled={isAdding} className="w-full">
          {isAdding ? 'Adicionando...' : 'Adicionar Averbação'}
        </Button>
      </CardContent>
    </Card>
  );
};

const PdfSection = ({ declaration }: { declaration: DeclarationData }) => {
  const [isGenerating, startGenerateTransition] = useTransition();
  
  const handleGeneratePdf = () => {
    startGenerateTransition(async () => {
      const result = await generatePdfWithAverbationsAction(declaration.id) as ActionResult;
      if (result.success && result.data) {
        const pdfData = result.data as { pdfContent: string; filename: string };
        downloadPdfFile(pdfData.pdfContent, pdfData.filename);
        toast.success('PDF baixado com sucesso');
      } else {
        toast.error(result.error || 'Erro ao gerar PDF');
      }
    });
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Gerar PDF Atualizado
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Button onClick={handleGeneratePdf} disabled={isGenerating} className="w-full">
          {isGenerating ? 'Gerando...' : 'Gerar PDF com Averbações'}
        </Button>
      </CardContent>
    </Card>
  );
};

const HistorySection = ({ declaration }: { declaration: DeclarationData }) => {
  if (!declaration.history || declaration.history.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Histórico de Alterações</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {declaration.history.map((entry, index) => (
            <div key={index} className="border-l-2 border-blue-200 pl-4 py-2">
              <div className="flex justify-between items-start">
                <p className="text-sm font-medium">{entry.description}</p>
                <span className="text-xs text-muted-foreground">
                  {entry.updatedAt.toLocaleDateString('pt-BR')}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">Por: {entry.updatedBy}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const createBlobFromBase64 = (base64Content: string): Blob => {
  try {
    const byteCharacters = atob(base64Content);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: 'application/pdf' });
  } catch {
    throw new Error('Erro ao processar PDF');
  }
};

const triggerDownload = (blob: Blob, filename: string): void => {
  try {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.style.display = 'none';
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  } catch {
    throw new Error('Erro ao fazer download do PDF');
  }
};

const downloadPdfFile = (pdfContent: string, filename: string): void => {
  try {
    const blob = createBlobFromBase64(pdfContent);
    triggerDownload(blob, filename);
  } catch {
    throw new Error('Erro ao baixar PDF');
  }
};

const getPropertyRegimeLabel = (regime: string): string => {
  const regimeLabels: Record<string, string> = {
    'COMUNHAO_PARCIAL': 'Comunhão Parcial de Bens',
    'SEPARACAO_TOTAL': 'Separação Total de Bens',
    'PARTICIPACAO_FINAL': 'Participação Final nos Aquestos',
    'COMUNHAO_UNIVERSAL': 'Comunhão Universal de Bens',
  };
  return regimeLabels[regime] || regime;
};

export default function UpdatePage() {
  const [selectedDeclaration, setSelectedDeclaration] = useState<DeclarationData | null>(null);

  const handleDeclarationUpdate = (updatedDeclaration?: DeclarationData) => {
    if (updatedDeclaration) {
      setSelectedDeclaration(updatedDeclaration);
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <FileText className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Atualização de Declarações</h1>
          <p className="text-muted-foreground">Editar dados, adicionar averbações e gerar PDF atualizado</p>
        </div>
      </div>
      
      <div className="grid gap-8">
        <SearchSection onDeclarationFound={setSelectedDeclaration} />
        
        {selectedDeclaration && (
          <div className="grid gap-6">
            <EditDeclarationForm 
              key={selectedDeclaration.id}
              declaration={selectedDeclaration} 
              onUpdate={handleDeclarationUpdate}
            />
            
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="space-y-6">
                <AverbationSection 
                  declaration={selectedDeclaration} 
                  onUpdate={setSelectedDeclaration}
                />
                <HistorySection declaration={selectedDeclaration} />
              </div>
              
              <div className="space-y-6">
                <PdfSection declaration={selectedDeclaration} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
