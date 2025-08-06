'use client';
import React, { useTransition, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useWatch, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Role, ActivationStatus } from '@prisma/client';
import usePersonTaxPayerIdAvailability from '@/lib/hooks/usePersonTaxPayerIdAvailability';
import { validationSchema } from './validationSchema';
import { toast } from 'sonner';
import { createUser } from './actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  Form
} from '@/components/ui/form';
import { UserFormValues, Field } from '../types';

export default function CreateUserForm() {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const methods = useForm<UserFormValues>({
    resolver: zodResolver(validationSchema),
    defaultValues: {
      name: '',
      email: '',
      role: Role.USER,
      status: ActivationStatus.ACTIVE,
      taxpayerId: ''
    },
    mode: 'onChange'
  });
  const currentRole = useWatch({
    control: methods.control,
    name: 'role',
    defaultValue: Role.USER
  });

  usePersonTaxPayerIdAvailability(methods as any);

  const fields = useMemo<Array<Field>>(() => {
    const baseFields: Array<Field> = [
      {
        name: 'name',
        label: 'Nome',
        type: 'text',
        placeholder: 'Digite o nome'
      },
      {
        name: 'email',
        label: 'Email',
        type: 'email',
        placeholder: 'Digite o email'
      },
      {
        name: 'role',
        label: 'Permissão',
        type: 'select',
        options: [
          { value: Role.ADMIN, label: 'Admin' },
          { value: Role.USER, label: 'Usuário' }
        ]
      },
      {
        name: 'status',
        label: 'Status',
        type: 'select',
        options: [
          { value: ActivationStatus.ACTIVE, label: 'Ativo' },
          { value: ActivationStatus.INACTIVE, label: 'Inativo' }
        ]
      }
    ];
    if (currentRole === Role.ADMIN || currentRole === Role.USER) {
      baseFields.push({
        name: 'taxpayerId',
        label: 'taxpayerId',
        type: 'text',
        placeholder: 'Digite o CPF'
      });
    }
    return baseFields;
  }, [currentRole]);

  const handleSubmit = async (data: UserFormValues) => {
    try {
      const userData = {
        ...validationSchema.parse(data),
        taxpayerId: data.taxpayerId ?? ''
      };
      const result = await createUser(userData);
      if (result && typeof result === 'object' && 'success' in result) {
        if (result.success) {
          toast.success('Usuário criado com sucesso');
          startTransition(() => router.push('/settings/users'));
        } else {
          toast.error('Erro ao criar usuário', {
            description: result.message || 'Erro inesperado ao criar usuário.'
          });
        }
      } else {
        toast.error('Erro ao criar usuário', {
          description: 'Resposta inesperada do servidor.'
        });
      }
    } catch (err) {
      const description =
        err instanceof Error
          ? err.message
          : 'Erro inesperado ao criar usuário.';
      toast.error('Erro ao criar usuário', { description });
    }
  };

  const renderField = (field: Field) => {
    return (
      <FormField
        key={field.name}
        control={methods.control}
        name={field.name}
        render={({ field: formField }) => (
          <FormItem>
            <FormLabel>{field.label}</FormLabel>
            <FormControl>
              {field.type === 'select' ? (
                <Select
                  onValueChange={formField.onChange}
                  value={formField.value}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={`Selecione ${field.label.toLowerCase()}`}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {field.options?.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  type={field.type}
                  placeholder={field.placeholder}
                  {...formField}
                />
              )}
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    );
  };

  return (
    <div className="flex flex-col w-full max-w-[600px] mx-auto mt-0 px-1">
      <Card className="sm:max-h-[84vh] max-h-[74vh] overflow-auto">
        <CardHeader>
          <CardTitle>Criar Usuário</CardTitle>
        </CardHeader>
        <CardContent>
          <FormProvider {...methods}>
            <Form {...methods}>
              <form
                onSubmit={methods.handleSubmit(handleSubmit)}
                className="space-y-4"
              >
                {fields.map(renderField)}
                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push('/settings/users')}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={methods.formState.isSubmitting}
                  >
                    {methods.formState.isSubmitting ? 'Criando...' : 'Criar'}
                  </Button>
                </div>
              </form>
            </Form>
          </FormProvider>
        </CardContent>
      </Card>
    </div>
  );
}
