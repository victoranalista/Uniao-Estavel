import { useEffect, useCallback } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { UserFormValues } from '../../app/settings/users/types';
import { validatetaxpayerId } from '@/lib/validators';
import debounce from 'lodash.debounce';
import { checkTaxpayerIdAvailability } from 'app/settings/users/availability/actions';
import { Role } from '@prisma/client';

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

      if (!validatetaxpayerId(val) && hasInteracted) {
        setError('taxpayerId', {
          type: 'manual',
          message: 'taxpayerId inválido'
        });
        return;
      }
      if (!hasInteracted) return;
      try {
        const { available, message } = await checkTaxpayerIdAvailability(
          val,
          role
        );
        if (!available)
          setError('taxpayerId', {
            type: 'manual',
            message: message ?? 'taxpayerId indisponível'
          });
        else clearErrors('taxpayerId');
      } catch (err) {
        console.error('Erro ao verificar taxpayerId:', err);
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
