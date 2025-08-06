import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MaskedInput } from './MaskedInput';
import { TextInputFieldProps, DateInputFieldProps } from '../types/types';

export const TextInputField = ({
  form,
  name,
  label,
  required = true,
  mask
}: TextInputFieldProps) => (
  <FormField
    control={form.control}
    name={name}
    render={({ field }) => (
      <FormItem>
        <FormLabel className="flex items-center gap-2">
          {label}
          {!required && (
            <Badge variant="outline" className="text-xs">
              Opcional
            </Badge>
          )}
        </FormLabel>
        <FormControl>
          {mask ? (
            <MaskedInput
              mask={mask}
              {...field}
              value={String(field.value || '')}
            />
          ) : (
            <Input {...field} value={String(field.value || '')} />
          )}
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
);

export const DateInputField = ({
  form,
  name,
  label,
  required = true
}: DateInputFieldProps) => (
  <FormField
    control={form.control}
    name={name}
    render={({ field }) => (
      <FormItem>
        <FormLabel className="flex items-center gap-2">
          {label}
          {!required && (
            <Badge variant="outline" className="text-xs">
              Opcional
            </Badge>
          )}
        </FormLabel>
        <FormControl>
          <Input type="date" {...field} value={String(field.value || '')} />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
);
