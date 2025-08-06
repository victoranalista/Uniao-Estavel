import { useState, useCallback, useEffect, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { useSession } from '@/lib/hooks/use-session';
import { MaskedInput } from './MaskedInput';
import { declarationFormSchema } from '../utils/schemas';
import { createDeclarationAction } from '../actions/create-declaration';
import { downloadPdf } from '../utils/helpers';
import {
  DeclarationFormData,
  FormSubmissionProps,
  DeclarationActionResult,
  TextInputFieldProps,
  DateInputFieldProps
} from '../types/types';

const getCurrentDateString = (): string => new Date().toISOString().split('T')[0];

const getFormDefaults = (
  initialData?: Partial<DeclarationFormData>,
  userName?: string
): DeclarationFormData => ({
  city: 'Brasília',
  state: 'DF',
  date: initialData?.date || getCurrentDateString(),
  propertyRegime:
    (initialData?.propertyRegime as DeclarationFormData['propertyRegime']) ||
    'COMUNHAO_PARCIAL',
  unionStartDate: initialData?.unionStartDate || '',
  registrarName: userName || '',
  stamp: initialData?.stamp || '',
  pactDate: initialData?.pactDate || '',
  pactOffice: initialData?.pactOffice || '',
  pactBook: initialData?.pactBook || '',
  pactPage: initialData?.pactPage || '',
  pactTerm: initialData?.pactTerm || '',
  firstPerson: {
    ...Object.fromEntries(
      Object.keys(declarationFormSchema.shape.firstPerson.shape).map(key => [key, initialData?.firstPerson?.[key as keyof typeof initialData.firstPerson] || ''])
    )
  } as DeclarationFormData['firstPerson'],
  secondPerson: {
    ...Object.fromEntries(
      Object.keys(declarationFormSchema.shape.secondPerson.shape).map(key => [key, initialData?.secondPerson?.[key as keyof typeof initialData.secondPerson] || ''])
    )
  } as DeclarationFormData['secondPerson']
});

export const useDeclarationForm = ({ onSubmit, initialData }: FormSubmissionProps) => {
  const [isSubmitting, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);
  const { user } = useSession();
  
  const form = useForm<DeclarationFormData>({
    resolver: zodResolver(declarationFormSchema),
    defaultValues: getFormDefaults(initialData, user?.name || '')
  });

  useEffect(() => {
    if (initialData || user?.name)
      form.reset(getFormDefaults(initialData, user?.name || ''));
  }, [initialData, form, user?.name]);

  const handleSubmissionSuccess = useCallback(
    (result: DeclarationActionResult) => {
      if (!result.success) {
        const error = result.message || 'Erro desconhecido';
        toast.error(error);
        return error;
      }
      toast.success('Declaração criada com sucesso!');
      if (result.data?.pdfContent) {
        downloadPdf(result.data.pdfContent);
        toast.success('PDF baixado automaticamente!');
      }
      return null;
    },
    []
  );

  const processFormSubmission = useCallback(
    async (formData: DeclarationFormData) => {
      startTransition(async () => {
        setFormError(null);
        try {
          const result = await createDeclarationAction(formData);
          const error = handleSubmissionSuccess(result);
          setFormError(error);
          if (result.success && onSubmit) await onSubmit(formData);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Erro ao processar a solicitação';
          setFormError(errorMessage);
          toast.error(errorMessage);
        }
      });
    },
    [handleSubmissionSuccess, onSubmit]
  );

  return { form, isSubmitting, formError, processFormSubmission };
};

export const TextInputField = ({ form, name, label, required = true, mask }: TextInputFieldProps) => (
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
            <MaskedInput mask={mask} {...field} value={String(field.value || '')} />
          ) : (
            <Input {...field} value={String(field.value || '')} />
          )}
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
);

export const DateInputField = ({ form, name, label, required = true }: DateInputFieldProps) => (
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
          <Input type="date" {...field} value={String(field.value || '')} />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
);

export const FormActions = ({ isSubmitting, formError }: { isSubmitting: boolean; formError: string | null }) => (
  <>
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
  </>
);
