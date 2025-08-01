"use client";

import { useState, useCallback, useEffect, useTransition, forwardRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
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
import { useFilteredCities, useStates } from '@/app/dashboard/new-registration/components/use-filteredMaps';
import { updateDeclarationAction } from '../../update/actions/update-declaration';
import { createDeclarationAction } from '../actions/create-declaration';
import { declarationFormSchema, type DeclarationFormData } from '../actions/schemas';

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

interface DeclarationFormProps {
  declarationId?: string;
  initialData?: Partial<DeclarationFormData>;
  onSuccess?: () => void;
}

const PROPERTY_REGIME_OPTIONS = [
  { value: 'COMUNHAO_PARCIAL', label: 'Comunhão Parcial de Bens' },
  { value: 'SEPARACAO_TOTAL', label: 'Separação Total de Bens' },
  { value: 'PARTICIPACAO_FINAL', label: 'Participação Final nos Aquestos' },
  { value: 'COMUNHAO_UNIVERSAL', label: 'Comunhão Universal de Bens' },
] as const;

const getFormDefaults = (initialData?: Partial<DeclarationFormData>) => ({
  city: initialData?.city || 'Brasília',
  state: initialData?.state || 'DF',
  date: initialData?.date || new Date().toISOString().split('T')[0],
  propertyRegime: initialData?.propertyRegime || 'COMUNHAO_PARCIAL',
  unionStartDate: initialData?.unionStartDate || '',
  registrarName: initialData?.registrarName || '',
  stamp: initialData?.stamp || '',
  pactDate: initialData?.pactDate || '',
  pactOffice: initialData?.pactOffice || '',
  pactBook: initialData?.pactBook || '',
  pactPage: initialData?.pactPage || '',
  pactTerm: initialData?.pactTerm || '',
  firstPerson: {
    name: initialData?.firstPerson?.name || '',
    nationality: initialData?.firstPerson?.nationality || '',
    civilStatus: initialData?.firstPerson?.civilStatus || '',
    birthDate: initialData?.firstPerson?.birthDate || '',
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
    divorceDate: initialData?.firstPerson?.divorceDate || '',
    newName: initialData?.firstPerson?.newName || '',
  },
  secondPerson: {
    name: initialData?.secondPerson?.name || '',
    nationality: initialData?.secondPerson?.nationality || '',
    civilStatus: initialData?.secondPerson?.civilStatus || '',
    birthDate: initialData?.secondPerson?.birthDate || '',
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
    divorceDate: initialData?.secondPerson?.divorceDate || '',
    newName: initialData?.secondPerson?.newName || '',
  },
});

type FormInputType = {
  date: string;
  city: string;
  state: string;
  unionStartDate: string;
  propertyRegime: 'COMUNHAO_PARCIAL' | 'SEPARACAO_TOTAL' | 'PARTICIPACAO_FINAL' | 'COMUNHAO_UNIVERSAL';
  registrarName: string;
  stamp?: string;
  pactDate?: string;
  pactOffice?: string;
  pactBook?: string;
  pactPage?: string;
  pactTerm?: string;
  firstPerson: {
    name: string;
    nationality: string;
    civilStatus: string;
    birthDate: string;
    birthPlaceState: string;
    birthPlaceCity: string;
    profession: string;
    rg: string;
    taxpayerId: string;
    address: string;
    email: string;
    phone: string;
    fatherName: string;
    motherName: string;
    registryOffice: string;
    registryBook: string;
    registryPage: string;
    registryTerm: string;
    divorceDate?: string;
    newName?: string;
  };
  secondPerson: {
    name: string;
    nationality: string;
    civilStatus: string;
    birthDate: string;
    birthPlaceState: string;
    birthPlaceCity: string;
    profession: string;
    rg: string;
    taxpayerId: string;
    address: string;
    email: string;
    phone: string;
    fatherName: string;
    motherName: string;
    registryOffice: string;
    registryBook: string;
    registryPage: string;
    registryTerm: string;
    divorceDate?: string;
    newName?: string;
  };
};

const convertToFormData = (data: FormInputType): FormData => {
  const formData = new FormData();
  formData.append('date', data.date);
  formData.append('city', data.city);
  formData.append('state', data.state);
  formData.append('unionStartDate', data.unionStartDate);
  formData.append('propertyRegime', data.propertyRegime);
  formData.append('registrarName', data.registrarName);
  if (data.stamp) formData.append('stamp', data.stamp);
  if (data.pactDate) formData.append('pactDate', data.pactDate);
  if (data.pactOffice) formData.append('pactOffice', data.pactOffice);
  if (data.pactBook) formData.append('pactBook', data.pactBook);
  if (data.pactPage) formData.append('pactPage', data.pactPage);
  if (data.pactTerm) formData.append('pactTerm', data.pactTerm);
  Object.entries(data.firstPerson).forEach(([key, value]) => {
    if (value) {
      formData.append(`firstPerson${key.charAt(0).toUpperCase() + key.slice(1)}`, value);
    }
  });
  Object.entries(data.secondPerson).forEach(([key, value]) => {
    if (value) {
      formData.append(`secondPerson${key.charAt(0).toUpperCase() + key.slice(1)}`, value);
    }
  });
  return formData;
};

const handleSubmission = async (data: FormInputType, declarationId?: string) => 
  declarationId
    ? await updateDeclarationAction(declarationId, convertToFormData(data))
    : await createDeclarationAction(convertToFormData(data));

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
    if (result.data?.pdfContent && result.data?.filename) {
      downloadPdf(result.data.pdfContent, result.data.filename);
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
    resolver: zodResolver(declarationFormSchema),
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
        const result = await handleSubmission(formData, declarationId);
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