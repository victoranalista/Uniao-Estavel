import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useGenderState } from './useGenderState';
import { 
  getNacionalidadesPorGenero,
  getEstadosCivisPorGenero,
  OFICIAIS_REGISTRADORES 
} from '@/utils/constants';

interface SelectFieldProps {
  form: any;
  name: string;
  label: string;
  options: readonly string[];
  placeholder?: string;
}

export const SelectField = ({ form, name, label, options, placeholder = "Selecione..." }: SelectFieldProps) => (
  <FormField
    control={form.control}
    name={name}
    render={({ field }) => (
      <FormItem>
        <FormLabel>{label}</FormLabel>
        <Select onValueChange={field.onChange} value={field.value || ''}>
          <FormControl>
            <SelectTrigger>
              <SelectValue placeholder={placeholder} />
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

interface GenderSelectFieldProps {
  form: any;
  prefix: string;
  label: string;
  fieldType: 'nationality' | 'civilStatus';
}

export const GenderSelectField = ({ form, prefix, label, fieldType }: GenderSelectFieldProps) => {
  const isSecondPerson = prefix === 'secondPerson';
  const { gender, toggleGender } = useGenderState(isSecondPerson ? 'F' : 'M');
  
  const options = fieldType === 'nationality' 
    ? getNacionalidadesPorGenero(gender)
    : getEstadosCivisPorGenero(gender);

  const handleGenderToggle = () => {
    toggleGender();
    const currentValue = form.getValues(`${prefix}.${fieldType}`);
    if (currentValue) {
      const currentOptions = fieldType === 'nationality'
        ? getNacionalidadesPorGenero(gender)
        : getEstadosCivisPorGenero(gender);
      const currentIndex = currentOptions.indexOf(currentValue);
      if (currentIndex !== -1) {
        const newOptions = fieldType === 'nationality'
          ? getNacionalidadesPorGenero(gender === 'M' ? 'F' : 'M')
          : getEstadosCivisPorGenero(gender === 'M' ? 'F' : 'M');
        if (newOptions[currentIndex]) {
          form.setValue(`${prefix}.${fieldType}`, newOptions[currentIndex]);
        } else {
          form.setValue(`${prefix}.${fieldType}`, '');
        }
      }
    }
  };

  return (
    <FormField
      control={form.control}
      name={`${prefix}.${fieldType}`}
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
          <Select onValueChange={field.onChange} value={field.value || ''}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={`Selecione ${fieldType === 'nationality' ? 'a nacionalidade' : 'o estado civil'}...`} />
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
};

interface StateSelectFieldProps {
  form: any;
  name: string;
  label: string;
  states: string[];
  isLoading: boolean;
}

export const StateSelectField = ({ form, name, label, states, isLoading }: StateSelectFieldProps) => (
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

export const RegistrarSelectField = ({ form, name, label }: Omit<SelectFieldProps, 'options'>) => (
  <SelectField
    form={form}
    name={name}
    label={label}
    options={Object.keys(OFICIAIS_REGISTRADORES)}
    placeholder="Selecione o oficial registrador..."
  />
);