import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UseFormReturn, FieldPath } from 'react-hook-form';
import { DeclarationFormData } from '../types';

interface LocationSelectFieldProps {
  form: UseFormReturn<DeclarationFormData>;
  name: FieldPath<DeclarationFormData>;
  label: string;
  options: string[];
  isLoading: boolean;
  disabled?: boolean;
  placeholder: string;
}

export const LocationSelectField = ({ 
  form, 
  name, 
  label, 
  options, 
  isLoading, 
  disabled = false, 
  placeholder 
}: LocationSelectFieldProps) => (
  <FormField
    control={form.control}
    name={name}
    render={({ field }) => (
      <FormItem>
        <FormLabel>{label}</FormLabel>
        <Select
          onValueChange={field.onChange}
          value={field.value as string || ''}
          disabled={disabled || isLoading}
        >
          <FormControl>
            <SelectTrigger>
              <SelectValue placeholder={isLoading ? "Carregando..." : placeholder} />
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

interface StateSelectFieldProps {
  form: UseFormReturn<DeclarationFormData>;
  name: FieldPath<DeclarationFormData>;
  label: string;
  states: string[];
  isLoading: boolean;
}

export const StateSelectField = ({ form, name, label, states, isLoading }: StateSelectFieldProps) => (
  <LocationSelectField
    form={form}
    name={name}
    label={label}
    options={states}
    isLoading={isLoading}
    placeholder="Selecione o estado..."
  />
);

interface CitySelectFieldProps {
  form: UseFormReturn<DeclarationFormData>;
  stateFieldName: FieldPath<DeclarationFormData>;
  cityFieldName: FieldPath<DeclarationFormData>;
  label: string;
  cities: string[];
  isLoading: boolean;
}

export const CitySelectField = ({ 
  form, 
  stateFieldName, 
  cityFieldName, 
  label, 
  cities, 
  isLoading 
}: CitySelectFieldProps) => {
  const selectedState = form.watch(stateFieldName);
  
  return (
    <LocationSelectField
      form={form}
      name={cityFieldName}
      label={label}
      options={cities}
      isLoading={isLoading}
      disabled={!selectedState}
      placeholder={
        isLoading ? "Carregando..." :
          selectedState ? "Selecione a cidade..." :
            "Selecione primeiro o estado"
      }
    />
  );
};