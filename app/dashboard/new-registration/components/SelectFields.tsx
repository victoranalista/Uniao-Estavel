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
import { Badge } from '@/components/ui/badge';
import { useGenderState } from './useGenderState';
import {
  getNationalitiesByGender,
  getCivilStatusByGender,
  REGISTRY_OFFICERS
} from '@/utils/constants';
import { UseFormReturn, FieldPath } from 'react-hook-form';
import { DeclarationFormData } from '../utils/schemas';
import { SelectFieldProps, GenderSelectFieldProps } from '../types/types';

export const SelectField = ({
  form,
  name,
  label,
  options,
  placeholder = 'Selecione...'
}: SelectFieldProps) => (
  <FormField
    control={form.control}
    name={name}
    render={({ field }) => (
      <FormItem>
        <FormLabel>{label}</FormLabel>
        <Select
          onValueChange={field.onChange}
          value={String(field.value || '')}
        >
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

const getFieldOptions = (
  gender: 'M' | 'F',
  fieldType: 'nationality' | 'civilStatus'
): readonly string[] =>
  fieldType === 'nationality'
    ? getNationalitiesByGender(gender)
    : getCivilStatusByGender(gender);

const getNewGender = (currentGender: 'M' | 'F'): 'M' | 'F' =>
  currentGender === 'M' ? 'F' : 'M';

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

export const GenderSelectField = ({
  form,
  prefix,
  label,
  fieldType
}: GenderSelectFieldProps) => {
  const isSecondPerson = prefix === 'secondPerson';
  const { gender, toggleGender } = useGenderState(isSecondPerson ? 'F' : 'M');
  const options = getFieldOptions(gender, fieldType);
  const fieldName = `${prefix}.${fieldType}` as FieldPath<DeclarationFormData>;
  const handleGenderToggle = () => {
    toggleGender();
    const currentValue = form.getValues(fieldName);
    if (!currentValue) return;
    const currentOptions = getFieldOptions(gender, fieldType);
    const newOptions = getFieldOptions(getNewGender(gender), fieldType);
    updateFieldValue(
      form,
      fieldName,
      currentOptions,
      newOptions,
      String(currentValue)
    );
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
          <Select
            onValueChange={field.onChange}
            value={String(field.value || '')}
          >
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

export const RegistrarSelectField = ({
  form,
  name,
  label
}: Omit<SelectFieldProps, 'options'>) => (
  <SelectField
    form={form}
    name={name}
    label={label}
    options={Object.keys(REGISTRY_OFFICERS)}
    placeholder="Selecione o oficial registrador..."
  />
);
