import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MaskedInput } from './MaskedInput';
import { UseFormReturn, FieldPath } from 'react-hook-form';
import { DeclarationFormData } from '../types';

interface TextInputFieldProps {
  form: UseFormReturn<DeclarationFormData>;
  name: FieldPath<DeclarationFormData>;
  label: string;
  required?: boolean;
  mask?: string;
}

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
            <MaskedInput mask={mask} {...field} value={field.value as string || ''} />
          ) : (
            <Input {...field} value={field.value as string || ''} />
          )}
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
);

interface DateInputFieldProps {
  form: UseFormReturn<DeclarationFormData>;
  name: FieldPath<DeclarationFormData>;
  label: string;
  required?: boolean;
}

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
          <Input type="date" {...field} value={field.value as string || ''} />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
);