import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Building } from 'lucide-react';
import { useSession } from '@/lib/hooks/use-session';
import { useGenderState } from './useGenderState';
import { TextInputField, DateInputField } from './InputFields';
import { getNationalitiesByGender, getCivilStatusByGender, REGISTRY_OFFICERS } from '@/utils/constants';
import { PROPERTY_REGIME_OPTIONS } from '@/lib/utils/index';
import { UseFormReturn, FieldPath } from 'react-hook-form';
import { DeclarationFormData } from '../utils/schemas';
import { SelectFieldProps, GenderSelectFieldProps, PropertyRegimeOption } from '../types/types';

export const SelectField = ({ form, name, label, options, placeholder = 'Selecione...' }: SelectFieldProps) => (
  <FormField
    control={form.control}
    name={name}
    render={({ field }) => (
      <FormItem>
        <FormLabel>{label}</FormLabel>
        <Select onValueChange={field.onChange} value={String(field.value || '')}>
          <FormControl>
            <SelectTrigger>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
          </FormControl>
          <SelectContent>
            {options.map((option) => (
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

const getFieldOptions = (gender: 'M' | 'F', fieldType: 'nationality' | 'civilStatus'): readonly string[] =>
  fieldType === 'nationality' ? getNationalitiesByGender(gender) : getCivilStatusByGender(gender);

const updateFieldValue = (
  form: UseFormReturn<DeclarationFormData>,
  fieldName: FieldPath<DeclarationFormData>,
  currentOptions: readonly string[],
  newOptions: readonly string[],
  currentValue: string
) => {
  const currentIndex = currentOptions.indexOf(currentValue);
  if (currentIndex !== -1 && newOptions[currentIndex]) {
    form.setValue(fieldName, newOptions[currentIndex]);
  } else {
    form.setValue(fieldName, '');
  }
};

export const GenderSelectField = ({ form, prefix, label, fieldType }: GenderSelectFieldProps) => {
  const isSecondPerson = prefix === 'secondPerson';
  const { gender, toggleGender } = useGenderState(isSecondPerson ? 'F' : 'M');
  const options = getFieldOptions(gender, fieldType);
  const fieldName = `${prefix}.${fieldType}` as FieldPath<DeclarationFormData>;
  
  const handleGenderToggle = () => {
    toggleGender();
    const currentValue = form.getValues(fieldName);
    if (!currentValue) return;
    const currentOptions = getFieldOptions(gender, fieldType);
    const newOptions = getFieldOptions(gender === 'M' ? 'F' : 'M', fieldType);
    updateFieldValue(form, fieldName, currentOptions, newOptions, String(currentValue));
  };

  return (
    <FormField
      control={form.control}
      name={fieldName}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="flex items-center gap-2">
            {label}
            <Badge
              variant="outline"
              className="text-xs cursor-pointer hover:bg-muted transition-colors"
              onClick={handleGenderToggle}
              title="Clique para alternar entre masculino e feminino"
            >
              {gender === 'M' ? 'Masculino' : 'Feminino'}
            </Badge>
          </FormLabel>
          <Select onValueChange={field.onChange} value={String(field.value || '')}>
            <FormControl>
              <SelectTrigger>
                <SelectValue
                  placeholder={`Selecione ${fieldType === 'nationality' ? 'a nacionalidade' : 'o estado civil'}...`}
                />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {options.map((option) => (
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
};

export const DeclarationDataSection = ({ form }: { form: UseFormReturn<DeclarationFormData> }) => {
  const { user } = useSession();
  return (
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
                    {PROPERTY_REGIME_OPTIONS.map((option: PropertyRegimeOption) => (
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
          <h4 className="font-medium text-sm text-muted-foreground">Pacto Antenupcial (se aplicável)</h4>
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
  );
};
