import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  LocationSelectFieldProps,
  StateSelectFieldProps,
  CitySelectFieldProps
} from '../types/types';

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
          value={String(field.value || '')}
          disabled={disabled || isLoading}
        >
          <FormControl>
            <SelectTrigger>
              <SelectValue
                placeholder={isLoading ? 'Carregando...' : placeholder}
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

export const StateSelectField = ({
  form,
  name,
  label,
  states,
  isLoading
}: StateSelectFieldProps) => (
  <LocationSelectField
    form={form}
    name={name}
    label={label}
    options={states}
    isLoading={isLoading}
    placeholder="Selecione o estado..."
  />
);

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
        isLoading
          ? 'Carregando...'
          : selectedState
            ? 'Selecione a cidade...'
            : 'Selecione primeiro o estado'
      }
    />
  );
};
