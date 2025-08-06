import { useEffect, useCallback } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { UserFormValues } from '../../app/settings/users/types';
import { isValidTaxpayerId } from '@/lib/validators';
import debounce from 'lodash.debounce';
import { checkTaxpayerIdAvailability } from 'app/settings/users/availability/actions';
import { Role } from '@prisma/client';

const validateInput = (value: string, hasInteracted: boolean) => {
  if (!isValidTaxpayerId(value) && hasInteracted) {
    return { type: 'manual', message: 'taxpayerId inválido' };
  }
  return null;
};

const checkAvailability = async (value: string, role: Role) => {
  const { available, message } = await checkTaxpayerIdAvailability(value, role);
  if (!available) {
    return { type: 'manual', message: message ?? 'taxpayerId indisponível' };
  }
  return null;
};

const usePersonTaxPayerIdAvailability = (
  methods: UseFormReturn<UserFormValues>
) => {
  const {
    watch,
    setError,
    clearErrors,
    formState: { touchedFields, dirtyFields }
  } = methods;
  const taxpayerIdValue: string = watch('taxpayerId') || '';
  const roleValue = watch('role');

  const validate = useCallback(
    debounce(async (val: string, role: Role) => {
      const hasInteracted = touchedFields.taxpayerId || dirtyFields.taxpayerId;
      if (!hasInteracted) return;

      const inputError = validateInput(val, hasInteracted);
      if (inputError) {
        setError('taxpayerId', inputError);
        return;
      }

      try {
        const availabilityError = await checkAvailability(val, role);
        if (availabilityError) {
          setError('taxpayerId', availabilityError);
        } else {
          clearErrors('taxpayerId');
        }
      } catch {
        setError('taxpayerId', {
          type: 'manual',
          message: 'Erro ao verificar disponibilidade'
        });
      }
    }, 500),
    [setError, clearErrors, touchedFields.taxpayerId, dirtyFields.taxpayerId]
  );

  useEffect(() => {
    validate(taxpayerIdValue, roleValue);
    return () => validate.cancel();
  }, [taxpayerIdValue, roleValue, validate]);
};

export default usePersonTaxPayerIdAvailability;
