import { forwardRef } from 'react';
import { Input } from '@/components/ui/input';
import { MaskedInputProps } from '../types/types';
import { applyMask } from '../utils/constants';

export const MaskedInput = forwardRef<HTMLInputElement, MaskedInputProps>(
  ({ mask, value = '', onChange, ...props }, ref) => {
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
  }
);

MaskedInput.displayName = 'MaskedInput';
