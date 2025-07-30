"use client";

import { useState, useCallback, useEffect, useTransition, forwardRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { validatetaxpayerId } from '@/utils/validators';
import { createDeclarationAction, updateDeclarationAction } from '@/app/actions/declarations';
import {
  getNacionalidadesPorGenero,
  getEstadosCivisPorGenero,
  OFICIAIS_REGISTRADORES,
  REGISTRO_CARTORIO
} from '@/utils/constants';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { FileText, User, Heart, Building } from "lucide-react";
import { DeclarationData } from '@/types/declarations';
import { useFilteredCities } from '@/hooks/use-filtered-cities';
import { useStates } from '@/hooks/use-states';

const applyMask = (value: string, mask: string): string => {
  if (!value) return '';
  const cleanValue = value.replace(/\D/g, '');
  let maskedValue = '';
  let valueIndex = 0;
  for (let i = 0; i < mask.length && valueIndex < cleanValue.length; i++) {
    if (mask[i] === '9') {
      maskedValue += cleanValue[valueIndex];
      valueIndex++;
    } else {
      maskedValue += mask[i];
    }
  }
  return maskedValue;
};

const MaskedInput = forwardRef<HTMLInputElement, {
  mask: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  disabled?: boolean;
}>(({ mask, value = '', onChange, ...props }, ref) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const maskedValue = applyMask(e.target.value, mask);
    e.target.value = maskedValue;
    onChange?.(e);
  };
  return (
    <Input
      ref={ref}
      value={applyMask(value, mask)}
      onChange={handleChange}
      {...props}
    />
  );
});

MaskedInput.displayName = 'MaskedInput';

const personSchema = z.object({
  name: z.string().min(1, 'Nome obrigatório'),
  nationality: z.string().min(1, 'Nacionalidade obrigatória'),
  civilStatus: z.string().min(1, 'Estado civil obrigatório'),
  typeRegistry: z.string().min(1, 'Tipo de registro obrigatório'),
  RegistrationStatus: z.string().optional(),
  birthDate: z.string().min(1, 'Data de nascimento obrigatória'),
  birthPlaceState: z.string().min(1, 'Estado de nascimento obrigatório'),
  birthPlaceCity: z.string().min(1, 'Cidade de nascimento obrigatória'),
  profession: z.string().min(1, 'Profissão obrigatória'),
  rg: z.string().min(1, 'RG obrigatório'),
  taxpayerId: z.string().min(11, 'CPF inválido').refine(validatetaxpayerId, 'CPF inválido'),
  address: z.string().min(1, 'Endereço obrigatório'),
  email: z.email('Email inválido'),
  phone: z.string().min(14, 'Telefone inválido'),
  fatherName: z.string().min(1, 'Nome do pai obrigatório'),
  motherName: z.string().min(1, 'Nome da mãe obrigatório'),
  registryOffice: z.string().min(1, 'Cartório obrigatório'),
  registryBook: z.string().min(1, 'Livro obrigatório'),
  registryPage: z.string().min(1, 'Folha obrigatória'),
  registryTerm: z.string().min(1, 'Termo obrigatório'),
  divorceDate: z.string().optional(),
  newName: z.string().optional(),
});

const declarationSchema = z.object({
  date: z.string().min(1, 'Data obrigatória'),
  city: z.string().min(1, 'Cidade obrigatória'),
  state: z.string().min(1, 'Estado obrigatório'),
  firstPerson: personSchema,
  secondPerson: personSchema,
  unionStartDate: z.string().min(1, 'Data de início da união obrigatória'),
  propertyRegime: z.enum(['COMUNHAO_PARCIAL', 'SEPARACAO_TOTAL', 'PARTICIPACAO_FINAL', 'COMUNHAO_UNIVERSAL'] as const),
  stamp: z.string().optional(),
  pactDate: z.string().optional(),
  pactOffice: z.string().optional(),
  pactBook: z.string().optional(),
  pactPage: z.string().optional(),
  pactTerm: z.string().optional(),
  registrarName: z.string().min(1, 'Nome do oficial obrigatório'),
});

type DeclarationFormData = z.infer<typeof declarationSchema>;

interface DeclarationFormProps {
  declarationId?: string;
  initialData?: Partial<DeclarationData>;
  onSuccess?: () => void;
}

const PROPERTY_REGIME_OPTIONS = [
  { value: 'COMUNHAO_PARCIAL', label: 'Comunhão Parcial de Bens' },
  { value: 'SEPARACAO_TOTAL', label: 'Separação Total de Bens' },
  { value: 'PARTICIPACAO_FINAL', label: 'Participação Final nos Aquestos' },
  { value: 'COMUNHAO_UNIVERSAL', label: 'Comunhão Universal de Bens' },
] as const;

const getFormDefaults = (initialData?: Partial<DeclarationData>): DeclarationFormData => ({
  city: initialData?.city || 'Brasília',
  state: initialData?.state || 'DF',
  date: initialData?.date ? new Date(initialData.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
  propertyRegime: initialData?.propertyRegime || 'COMUNHAO_PARCIAL',
  unionStartDate: initialData?.unionStartDate ? new Date(initialData.unionStartDate).toISOString().split('T')[0] : '',
  registrarName: initialData?.registrarName || '',
  stamp: initialData?.stamp || '',
  pactDate: initialData?.pactDate ? new Date(initialData.pactDate).toISOString().split('T')[0] : '',
  pactOffice: initialData?.pactOffice || '',
  pactBook: initialData?.pactBook || '',
  pactPage: initialData?.pactPage || '',
  pactTerm: initialData?.pactTerm || '',
  firstPerson: {
    name: initialData?.firstPerson?.name || '',
    nationality: initialData?.firstPerson?.nationality || '',
    civilStatus: initialData?.firstPerson?.civilStatus || '',
    typeRegistry: initialData?.firstPerson?.typeRegistry || '',
    birthDate: initialData?.firstPerson?.birthDate ? new Date(initialData.firstPerson.birthDate).toISOString().split('T')[0] : '',
    birthPlaceState: initialData?.firstPerson?.birthPlaceState || '',
    birthPlaceCity: initialData?.firstPerson?.birthPlaceCity || '',
    profession: initialData?.firstPerson?.profession || '',
    rg: initialData?.firstPerson?.rg || '',
    taxpayerId: initialData?.firstPerson?.taxpayerId || '',
    address: initialData?.firstPerson?.address || '',
    email: initialData?.firstPerson?.email || '',
    phone: initialData?.firstPerson?.phone || '',
    fatherName: initialData?.firstPerson?.fatherName || '',
    motherName: initialData?.firstPerson?.motherName || '',
    registryOffice: initialData?.firstPerson?.registryOffice || '',
    registryBook: initialData?.firstPerson?.registryBook || '',
    registryPage: initialData?.firstPerson?.registryPage || '',
    registryTerm: initialData?.firstPerson?.registryTerm || '',
    divorceDate: initialData?.firstPerson?.divorceDate ? new Date(initialData.firstPerson.divorceDate).toISOString().split('T')[0] : '',
    newName: initialData?.firstPerson?.newName || '',
  },
  secondPerson: {
    name: initialData?.secondPerson?.name || '',
    nationality: initialData?.secondPerson?.nationality || '',
    civilStatus: initialData?.secondPerson?.civilStatus || '',
    typeRegistry: initialData?.secondPerson?.typeRegistry || '',
    birthDate: initialData?.secondPerson?.birthDate ? new Date(initialData.secondPerson.birthDate).toISOString().split('T')[0] : '',
    birthPlaceState: initialData?.secondPerson?.birthPlaceState || '',
    birthPlaceCity: initialData?.secondPerson?.birthPlaceCity || '',
    profession: initialData?.secondPerson?.profession || '',
    rg: initialData?.secondPerson?.rg || '',
    taxpayerId: initialData?.secondPerson?.taxpayerId || '',
    address: initialData?.secondPerson?.address || '',
    email: initialData?.secondPerson?.email || '',
    phone: initialData?.secondPerson?.phone || '',
    fatherName: initialData?.secondPerson?.fatherName || '',
    motherName: initialData?.secondPerson?.motherName || '',
    registryOffice: initialData?.secondPerson?.registryOffice || '',
    registryBook: initialData?.secondPerson?.registryBook || '',
    registryPage: initialData?.secondPerson?.registryPage || '',
    registryTerm: initialData?.secondPerson?.registryTerm || '',
    divorceDate: initialData?.secondPerson?.divorceDate ? new Date(initialData.secondPerson.divorceDate).toISOString().split('T')[0] : '',
    newName: initialData?.secondPerson?.newName || '',
  },
});

const createSubmissionData = (formData: DeclarationFormData): FormData => {
  const submissionData = new FormData();
  const flattenFormData = (obj: Record<string, unknown>, prefix = '') => {
    Object.entries(obj).forEach(([key, value]) => {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        flattenFormData(value as Record<string, unknown>, fullKey);
      } else if (value !== undefined && value !== null && value !== '') {
        submissionData.append(fullKey, String(value));
      }
    });
  };
  flattenFormData(formData);
  return submissionData;
};

const handleFormSubmission = async (formData: DeclarationFormData, declarationId?: string) => {
  const submissionData = createSubmissionData(formData);
  return declarationId
    ? await updateDeclarationAction(declarationId, submissionData)
    : await createDeclarationAction(submissionData);
};

const downloadPdf = (pdfBase64: string, filename: string) => {
  const byteCharacters = atob(pdfBase64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], { type: 'application/pdf' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

const showSubmissionResult = (result: any, declarationId?: string, onSuccess?: () => void) => {
  if (result.success) {
    const message = declarationId
      ? 'Declaração atualizada com sucesso!'
      : 'Declaração criada com sucesso!';
    toast.success(message);
    if (result.pdfContent && result.filename) {
      downloadPdf(result.pdfContent, result.filename);
      toast.success('PDF baixado automaticamente!');
    }
    onSuccess?.();
    return null;
  } else {
    const error = result.error || 'Erro desconhecido';
    toast.error(error);
    return error;
  }
};

const renderTextInput = (form: any, name: string, label: string, required = true, mask?: string) => (
  <FormField
    control={form.control}
    name={name}
    render={({ field }) => (
      <FormItem>
        <FormLabel className="flex items-center gap-2">
          {label}
          {!required && <Badge variant="outline" className="text-xs">Opcional</Badge>}
        </FormLabel>
        <FormControl>
          {mask ? (
            <MaskedInput mask={mask} {...field} value={field.value || ''} />
          ) : (
            <Input {...field} value={field.value || ''} />
          )}
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
);

const renderDateInput = (form: any, name: string, label: string, required = true) => (
  <FormField
    control={form.control}
    name={name}
    render={({ field }) => (
      <FormItem>
        <FormLabel className="flex items-center gap-2">
          {label}
          {!required && <Badge variant="outline" className="text-xs">Opcional</Badge>}
        </FormLabel>
        <FormControl>
          <Input type="date" {...field} value={field.value || ''} />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
);

const renderSelectInput = (form: any, name: string, label: string, options: readonly string[]) => (
  <FormField
    control={form.control}
    name={name}
    render={({ field }) => (
      <FormItem>
        <FormLabel>{label}</FormLabel>
        <Select onValueChange={field.onChange} value={field.value || ''}>
          <FormControl>
            <SelectTrigger>
              <SelectValue placeholder="Selecione..." />
            </SelectTrigger>
          </FormControl>
          <SelectContent>
            {options.map(option => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <FormMessage />
      </FormItem>
    )}
  />
);

const renderStateSelectInput = (form: any, name: string, label: string) => {
  const { states, isLoading } = useStates();
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <Select
            onValueChange={field.onChange}
            value={field.value || ''}
            disabled={isLoading}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={isLoading ? "Carregando..." : "Selecione o estado..."} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {states.map(state => (
                <SelectItem key={state} value={state}>
                  {state}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

const renderCitySelectInput = (form: any, stateFieldName: string, cityFieldName: string, label: string) => {
  const selectedState = form.watch(stateFieldName);
  const { cities, isLoading } = useFilteredCities(selectedState);
  return (
    <FormField
      control={form.control}
      name={cityFieldName}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <Select
            onValueChange={field.onChange}
            value={field.value || ''}
            disabled={!selectedState || isLoading}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={
                  isLoading ? "Carregando..." :
                    selectedState ? "Selecione a cidade..." :
                      "Selecione primeiro o estado"
                } />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {cities.map(city => (
                <SelectItem key={`${selectedState}-${city}`} value={city}>
                  {city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

const renderNationalitySelectInput = (form: any, prefix: string, label: string) => {
  const isSecondPerson = prefix === 'secondPerson';
  const [gender, setGender] = useState<'M' | 'F'>(isSecondPerson ? 'F' : 'M');
  const nacionalidades = getNacionalidadesPorGenero(gender);

  const toggleGender = () => {
    const newGender = gender === 'M' ? 'F' : 'M';
    setGender(newGender);
    const currentValue = form.getValues(`${prefix}.nationality`);
    if (currentValue) {
      const currentIndex = getNacionalidadesPorGenero(gender).indexOf(currentValue);
      if (currentIndex !== -1) {
        const newNationalities = getNacionalidadesPorGenero(newGender);
        if (newNationalities[currentIndex]) {
          form.setValue(`${prefix}.nationality`, newNationalities[currentIndex]);
        } else {
          form.setValue(`${prefix}.nationality`, '');
        }
      }
    }
  };

  return (
    <FormField
      control={form.control}
      name={`${prefix}.nationality`}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="flex items-center gap-2">
            {label}
            <Badge
              variant="outline"
              className="text-xs cursor-pointer hover:bg-muted transition-colors"
              onClick={toggleGender}
              title="Clique para alternar entre masculino e feminino"
            >
              {gender === 'M' ? 'Masculino' : 'Feminino'}
            </Badge>
          </FormLabel>
          <Select onValueChange={field.onChange} value={field.value || ''}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a nacionalidade..." />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {nacionalidades.map(nationality => (
                <SelectItem key={nationality} value={nationality}>
                  {nationality}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

const renderCivilStatusSelectInput = (form: any, prefix: string, label: string) => {
  const isSecondPerson = prefix === 'secondPerson';
  const [gender, setGender] = useState<'M' | 'F'>(isSecondPerson ? 'F' : 'M');
  const estadosCivis = getEstadosCivisPorGenero(gender);

  const toggleGender = () => {
    const newGender = gender === 'M' ? 'F' : 'M';
    setGender(newGender);
    const currentValue = form.getValues(`${prefix}.civilStatus`);
    if (currentValue) {
      const currentIndex = getEstadosCivisPorGenero(gender).indexOf(currentValue);
      if (currentIndex !== -1) {
        const newCivilStatuses = getEstadosCivisPorGenero(newGender);
        if (newCivilStatuses[currentIndex]) {
          form.setValue(`${prefix}.civilStatus`, newCivilStatuses[currentIndex]);
        } else {
          form.setValue(`${prefix}.civilStatus`, '');
        }
      }
    }
  };

  return (
    <FormField
      control={form.control}
      name={`${prefix}.civilStatus`}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="flex items-center gap-2">
            {label}
            <Badge
              variant="outline"
              className="text-xs cursor-pointer hover:bg-muted transition-colors"
              onClick={toggleGender}
              title="Clique para alternar entre masculino e feminino"
            >
              {gender === 'M' ? 'Masculino' : 'Feminino'}
            </Badge>
          </FormLabel>
          <Select onValueChange={field.onChange} value={field.value || ''}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o estado civil..." />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {estadosCivis.map(status => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

const renderPersonSection = (form: any, prefix: 'firstPerson' | 'secondPerson', title: string, icon: React.ReactNode) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-3">
        {icon}
        {title}
      </CardTitle>
      <CardDescription>Dados pessoais e documentais do declarante</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {renderTextInput(form, `${prefix}.name`, 'Nome Completo')}
        {renderNationalitySelectInput(form, prefix, 'Nacionalidade')}
        {renderCivilStatusSelectInput(form, prefix, 'Estado Civil')}
        {renderDateInput(form, `${prefix}.birthDate`, 'Data de Nascimento')}
        {renderStateSelectInput(form, `${prefix}.birthPlaceState`, 'Estado de Nascimento')}
        {renderCitySelectInput(form, `${prefix}.birthPlaceState`, `${prefix}.birthPlaceCity`, 'Cidade de Nascimento')}
        {renderTextInput(form, `${prefix}.profession`, 'Profissão')}
        {renderTextInput(form, `${prefix}.rg`, 'RG')}
        {renderTextInput(form, `${prefix}.taxpayerId`, 'CPF', true, '999.999.999-99')}
        {renderSelectInput(form, `${prefix}.typeRegistry`, 'Tipo de Registro', REGISTRO_CARTORIO)}
        {renderTextInput(form, `${prefix}.address`, 'Endereço Completo')}
        {renderTextInput(form, `${prefix}.email`, 'Email')}
        {renderTextInput(form, `${prefix}.phone`, 'Telefone', true, '(99) 99999-9999')}
        {renderTextInput(form, `${prefix}.fatherName`, 'Nome do Pai')}
        {renderTextInput(form, `${prefix}.motherName`, 'Nome da Mãe')}
        {renderTextInput(form, `${prefix}.registryOffice`, 'Cartório de Registro')}
        {renderTextInput(form, `${prefix}.registryBook`, 'Livro')}
        {renderTextInput(form, `${prefix}.registryPage`, 'Folha')}
        {renderTextInput(form, `${prefix}.registryTerm`, 'Termo')}
        {renderDateInput(form, `${prefix}.divorceDate`, 'Data do Divórcio', false)}
        {renderTextInput(form, `${prefix}.newName`, 'Novo Nome Pretendido', false)}
      </div>
    </CardContent>
  </Card>
);

export const DeclarationForm = ({ declarationId, initialData, onSuccess }: DeclarationFormProps) => {
  const [isSubmitting, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);
  const form = useForm<DeclarationFormData>({
    resolver: zodResolver(declarationSchema),
    defaultValues: getFormDefaults(initialData)
  });
  useEffect(() => {
    if (initialData) {
      form.reset(getFormDefaults(initialData));
    }
  }, [initialData, form]);
  const processFormSubmission = useCallback(async (formData: DeclarationFormData) => {
    startTransition(async () => {
      setFormError(null);
      try {
        const result = await handleFormSubmission(formData, declarationId);
        const error = showSubmissionResult(result, declarationId, onSuccess);
        setFormError(error);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Erro ao processar a solicitação';
        setFormError(errorMessage);
        toast.error(errorMessage);
      }
    });
  }, [declarationId, onSuccess]);
  return (
    <div className="w-full max-w-none mx-auto space-y-6 px-4 xl:px-8">
      <Card className="border-none bg-gradient-to-r from-primary/5 to-primary/10">
        <CardHeader className="text-center py-6">
          <div className="flex items-center justify-center mb-3">
            <div className="p-2 bg-primary/20 rounded-full">
              <FileText className="h-6 w-6 text-primary" />
            </div>
          </div>
          <CardTitle className="text-xl font-bold">Termo Declaratório de União Estável</CardTitle>
          <CardDescription>
            Preencha os dados abaixo para registrar.
          </CardDescription>
        </CardHeader>
      </Card>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(processFormSubmission)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Building className="h-5 w-5" />
                Informações da Declaração
              </CardTitle>
              <CardDescription>Dados gerais do documento e local de registro</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-2">
                <div>
                  {renderDateInput(form, 'date', 'Data da Declaração')}
                </div>
                <div>
                  {renderStateSelectInput(form, 'state', 'Estado')}
                </div>
                <div>
                  {renderCitySelectInput(form, 'state', 'city', 'Cidade')}
                </div>
              </div>
              <div className="mt-4">
                {renderTextInput(form, 'stamp', 'Selo', false)}
              </div>
            </CardContent>
          </Card>
          {renderPersonSection(form, 'firstPerson', 'Primeiro Declarante', <User className="h-5 w-5" />)}
          {renderPersonSection(form, 'secondPerson', 'Segundo Declarante', <User className="h-5 w-5" />)}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Heart className="h-5 w-5" />
                Informações da União Estável
              </CardTitle>
              <CardDescription>Dados sobre a união e regime de bens adotado</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {renderDateInput(form, 'unionStartDate', 'Data de Início da União')}
                <FormField
                  control={form.control}
                  name="propertyRegime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Regime de Bens</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ''}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o regime..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {PROPERTY_REGIME_OPTIONS.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Separator />
              <div className="space-y-4">
                <h4 className="font-medium text-sm text-muted-foreground">
                  Pacto Antenupcial (se aplicável)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {renderDateInput(form, 'pactDate', 'Data do Pacto', false)}
                  {renderTextInput(form, 'pactOffice', 'Cartório do Pacto', false)}
                  {renderTextInput(form, 'pactBook', 'Livro do Pacto', false)}
                  {renderTextInput(form, 'pactPage', 'Folha do Pacto', false)}
                  {renderTextInput(form, 'pactTerm', 'Termo do Pacto', false)}
                  {renderSelectInput(form, 'registrarName', 'Oficial Registrador', Object.keys(OFICIAIS_REGISTRADORES))}
                </div>
              </div>
            </CardContent>
          </Card>
          {formError && (
            <Alert variant="destructive">
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          )}
          <Button type="submit" disabled={isSubmitting} className="w-full" size="lg">
            {isSubmitting ? 'Processando...' : declarationId ? 'Atualizar Registro' : 'Criar Registro'}
          </Button>
        </form>
      </Form>
    </div>
  );
};