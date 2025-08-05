"use client";
import { useState, useCallback, useEffect, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { FileText, User, Heart, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSession } from '@/lib/hooks/use-session';
import { declarationFormSchema } from '../utils/schemas';
import { DeclarationFormData, FormSubmissionProps, DeclarationActionResult } from '../types/types';
import { createDeclarationAction } from '../actions/create-declaration';
import { PersonSection } from './PersonSection';
import { TextInputField, DateInputField } from './InputFields';
import { useStates, useFilteredCities } from './useLocationData';
import { downloadPdf } from '../utils/helpers';
import { PROPERTY_REGIME_OPTIONS, getCurrentDateString } from '../utils/constants';

const getFormDefaults = (initialData?: Partial<DeclarationFormData>, userName?: string): DeclarationFormData => ({
  city: 'Brasília',
  state: 'DF',
  date: initialData?.date || getCurrentDateString(),
  propertyRegime: (initialData?.propertyRegime as DeclarationFormData['propertyRegime']) || 'COMUNHAO_PARCIAL',
  unionStartDate: initialData?.unionStartDate || '',
  registrarName: userName || '',
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
    typeRegistry: initialData?.firstPerson?.typeRegistry || '',
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
    typeRegistry: initialData?.secondPerson?.typeRegistry || '',
    divorceDate: initialData?.secondPerson?.divorceDate || '',
    newName: initialData?.secondPerson?.newName || '',
  },
});

export const DeclarationForm = ({ onSubmit, initialData }: FormSubmissionProps) => {
  const [isSubmitting, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);
  const { user } = useSession();
  const { states, isStatesLoading } = useStates();
  const form = useForm<DeclarationFormData>({
    resolver: zodResolver(declarationFormSchema),
    defaultValues: getFormDefaults(initialData, user?.name || '')
  });
  const firstPersonState = form.watch('firstPerson.birthPlaceState');
  const secondPersonState = form.watch('secondPerson.birthPlaceState');
  const { cities: firstPersonCities, isCitiesLoading: isFirstPersonCitiesLoading } = useFilteredCities(firstPersonState);
  const { cities: secondPersonCities, isCitiesLoading: isSecondPersonCitiesLoading } = useFilteredCities(secondPersonState);
  useEffect(() => {
    if (initialData || user?.name) 
      form.reset(getFormDefaults(initialData, user?.name || ''));
  }, [initialData, form, user?.name]);
  const handleSubmissionSuccess = useCallback((result: DeclarationActionResult) => {
    if (!result.success) {
      const error = result.message || 'Erro desconhecido';
      toast.error(error);
      return error;
    }
    toast.success('Declaração criada com sucesso!');
    if (result.data?.pdfContent && result.data?.filename) {
      downloadPdf(result.data.pdfContent);
      toast.success('PDF baixado automaticamente!');
    }
    return null;
  }, []);

  const processFormSubmission = useCallback(async (formData: DeclarationFormData) => {
    startTransition(async () => {
      setFormError(null);
      try {
        const result = await createDeclarationAction(formData);
        const error = handleSubmissionSuccess(result);
        setFormError(error);
        if (result.success && onSubmit)
          await onSubmit(formData);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Erro ao processar a solicitação';
        setFormError(errorMessage);
        toast.error(errorMessage);
      }
    });
  }, [handleSubmissionSuccess, onSubmit]);

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8 space-y-8">
      <Card className="border-none bg-gradient-to-r from-primary/5 to-primary/10">
        <CardHeader className="text-center py-8">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-primary/20 rounded-full">
              <FileText className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-3xl font-semibold">
            Novo Registro de União Estável
          </CardTitle>
          <CardDescription className="text-lg mt-2">
            Preencha os dados para gerar a declaração
          </CardDescription>
        </CardHeader>
      </Card>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(processFormSubmission)} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Building className="h-5 w-5" />
                Dados da Declaração
              </CardTitle>
              <CardDescription>Informações gerais sobre a união estável</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <DateInputField form={form} name="date" label="Data da Declaração" />
                <div className="space-y-2">
                  <label className="text-sm font-medium">Cidade</label>
                  <div className="h-10 px-3 py-2 border border-input bg-muted rounded-md flex items-center text-sm text-muted-foreground">
                    Brasília
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Estado</label>
                  <div className="h-10 px-3 py-2 border border-input bg-muted rounded-md flex items-center text-sm text-muted-foreground">
                    Distrito Federal
                  </div>
                </div>
                <DateInputField form={form} name="unionStartDate" label="Data de Início da União" />
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
                <div className="space-y-2">
                  <label className="text-sm font-medium">Oficial Registrador</label>
                  <div className="h-10 px-3 py-2 border border-input bg-muted rounded-md flex items-center text-sm text-muted-foreground">
                    {user?.name || 'Carregando...'}
                  </div>
                </div>
                <TextInputField form={form} name="stamp" label="Selo" required={false} />
              </div>
              <Separator className="my-8" />
              <div className="space-y-6">
                <h4 className="font-medium text-sm text-muted-foreground">
                  Pacto Antenupcial (se aplicável)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <DateInputField form={form} name="pactDate" label="Data do Pacto" required={false} />
                  <TextInputField form={form} name="pactOffice" label="Cartório do Pacto" required={false} />
                  <TextInputField form={form} name="pactBook" label="Livro do Pacto" required={false} />
                  <TextInputField form={form} name="pactPage" label="Folha do Pacto" required={false} />
                  <TextInputField form={form} name="pactTerm" label="Termo do Pacto" required={false} />
                </div>
              </div>
            </CardContent>
          </Card>

          <PersonSection
            form={form}
            prefix="firstPerson"
            title="Primeiro Declarante"
            icon={<User className="h-5 w-5" />}
            states={states}
            cities={firstPersonCities}
            isStatesLoading={isStatesLoading}
            isCitiesLoading={isFirstPersonCitiesLoading}
          />

          <PersonSection
            form={form}
            prefix="secondPerson"
            title="Segundo Declarante"
            icon={<Heart className="h-5 w-5" />}
            states={states}
            cities={secondPersonCities}
            isStatesLoading={isStatesLoading}
            isCitiesLoading={isSecondPersonCitiesLoading}
          />

          {formError && (
            <Alert variant="destructive">
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          )}

          <div className="flex justify-center pt-4">
            <Button type="submit" disabled={isSubmitting} className="w-full max-w-md" size="lg">
              {isSubmitting ? 'Processando...' : 'Criar Registro'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};