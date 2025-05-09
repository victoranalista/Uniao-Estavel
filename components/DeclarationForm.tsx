"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import InputMask from 'react-input-mask';
import { validateCPF } from '@/utils/validators';
import {
  ESTADOS_BRASILEIROS,
  NACIONALIDADES,
  ESTADOS_CIVIS,
  OFICIAIS_REGISTRADORES,
  MUNICIPIOS_BRASIL,
  REGISTRO_CARTORIO
} from '@/utils/constants';
import { Alert } from "@/components/ui/alert";
import { toast } from "sonner";

const personSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  nationality: z.string().min(1, 'Nacionalidade é obrigatória'),
  civilStatus: z.string().min(1, 'Estado civil é obrigatório'),
  typeRegistry: z.string().min(1, 'Tipo de registro é obrigatório'),
  birthDate: z.string().min(1, 'Data de nascimento é obrigatória'),
  birthPlace: z.string().min(1, 'Local de nascimento é obrigatório'),
  profession: z.string().min(1, 'Profissão é obrigatória'),
  rg: z.string().min(1, 'RG é obrigatório'),
  cpf: z.string().min(11, 'CPF inválido').refine(validateCPF, 'CPF inválido'),
  address: z.string().min(1, 'Endereço é obrigatório'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(14, 'Telefone inválido'),
  fatherName: z.string().min(1, 'Nome do pai é obrigatório'),
  motherName: z.string().min(1, 'Nome da mãe é obrigatório'),
  registryOffice: z.string().min(1, 'Cartório é obrigatório'),
  registryBook: z.string().min(1, 'Livro é obrigatório'),
  registryPage: z.string().min(1, 'Folha é obrigatória'),
  registryTerm: z.string().min(1, 'Termo é obrigatório'),
  divorceDate: z.string().optional(),
  newName: z.string().optional(),
});

const declarationSchema = z.object({
  date: z.string().min(1, 'Data é obrigatória'),
  city: z.string().min(1, 'Cidade é obrigatória'),
  state: z.string().min(1, 'Estado é obrigatório'),
  firstPerson: personSchema,
  secondPerson: personSchema,
  unionStartDate: z.string().min(1, 'Data de início da união é obrigatória'),
  propertyRegime: z.enum(['COMUNHAO_PARCIAL', 'SEPARACAO_TOTAL', 'PARTICIPACAO_FINAL', 'COMUNHAO_UNIVERSAL'] as const),
  pactDate: z.string().optional(),
  pactOffice: z.string().optional(),
  pactBook: z.string().optional(),
  pactPage: z.string().optional(),
  pactTerm: z.string().optional(),
  registrarName: z.string().min(1, 'Nome do oficial é obrigatório'),
});

export type FormData = z.infer<typeof declarationSchema>;

interface DeclarationFormProps {
  initialData?: {
    unionStartDate: string;
    firstPerson: {
      name: string;
      nationality: string;
      civilStatus: string;
      birthDate: string;
      birthPlace: string;
      profession: string;
      rg: string;
      cpf: string;
      address: string;
      email: string;
      phone: string;
      fatherName: string;
      motherName: string;
      registryOffice: string;
      registryBook: string;
      registryPage: string;
      registryTerm: string;
    };
    secondPerson: {
      name: string;
      nationality: string;
      civilStatus: string;
      birthDate: string;
      birthPlace: string;
      profession: string;
      rg: string;
      cpf: string;
      address: string;
      email: string;
      phone: string;
      fatherName: string;
      motherName: string;
      registryOffice: string;
      registryBook: string;
      registryPage: string;
      registryTerm: string;
    };
  };
  onSubmit: (data: FormData) => Promise<void>;
}

interface FormFieldProps {
  label: string;
  register: any;
  name: string;
  error?: string;
  type?: string;
  required?: boolean;
  mask?: string;
  options?: string[];
  onSelect?: (value: string) => void;
  value?: string;
  disabled?: boolean;
}

const FormField = ({
  label,
  register,
  name,
  error,
  type = "text",
  required = true,
  mask,
  options,
  onSelect,
  value,
  disabled = false
}: FormFieldProps) => {
  if (options) {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        <select
          {...register(name)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
          onChange={(e) => onSelect && onSelect(e.target.value)}
          value={value}
          disabled={disabled}
        >
          <option value="">Selecione...</option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    );
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      {mask ? (
        <InputMask
          mask={mask}
          type={type}
          {...register(name)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
          required={required}
        />
      ) : (
        <input
          type={type}
          {...register(name)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
          required={required}
        />
      )}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export function DeclarationForm({ initialData, onSubmit }: DeclarationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [firstPersonAge, setFirstPersonAge] = useState<number | null>(null);
  const [secondPersonAge, setSecondPersonAge] = useState<number | null>(null);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(declarationSchema),
    defaultValues: {
      city: 'Brasília',
      state: 'DF'
    }
  });

  useEffect(() => {
    if (initialData) {
      setValue('unionStartDate', initialData.unionStartDate);
      
      Object.entries(initialData.firstPerson).forEach(([key, value]) => {
        setValue(`firstPerson.${key as keyof typeof initialData.firstPerson}`, value);
      });
      
      Object.entries(initialData.secondPerson).forEach(([key, value]) => {
        setValue(`secondPerson.${key as keyof typeof initialData.secondPerson}`, value);
      });
    }
  }, [initialData, setValue]);

  const registrarName = watch('registrarName');
  const selectedOfficialFunction = OFICIAIS_REGISTRADORES[registrarName] || 'Oficial Registrador';

  const handleFormSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    setError(null);
    try {
      await onSubmit(data);
    } catch (error) {
      console.error('Error:', error);
      setError(error instanceof Error ? error.message : 'Erro ao processar a solicitação');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderPersonFields = (prefix: 'firstPerson' | 'secondPerson', title: string) => (
    <div className="space-y-4 bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold border-b pb-2">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          label="Nome Completo"
          register={register}
          name={`${prefix}.name`}
          error={errors[prefix]?.name?.message}
        />
        <FormField
          label="Nacionalidade"
          register={register}
          name={`${prefix}.nationality`}
          options={NACIONALIDADES}
          error={errors[prefix]?.nationality?.message}
        />
        <FormField
          label="Estado Civil"
          register={register}
          name={`${prefix}.civilStatus`}
          options={ESTADOS_CIVIS}
          error={errors[prefix]?.civilStatus?.message}
        />
        <FormField
          label="Tipo de Registro"
          register={register}
          name={`${prefix}.typeRegistry`}
          options={REGISTRO_CARTORIO}
          error={errors[prefix]?.typeRegistry?.message}
        />
        <FormField
          label="Data de Nascimento"
          register={register}
          name={`${prefix}.birthDate`}
          type="date"
          error={errors[prefix]?.birthDate?.message}
        />
        <FormField
          label="Local de Nascimento"
          register={register}
          name={`${prefix}.birthPlace`}
          options={MUNICIPIOS_BRASIL.map(m => m.nome)}
          error={errors[prefix]?.birthPlace?.message}
        />
        <FormField
          label="Profissão"
          register={register}
          name={`${prefix}.profession`}
          error={errors[prefix]?.profession?.message}
        />
        <FormField
          label="RG"
          register={register}
          name={`${prefix}.rg`}
          error={errors[prefix]?.rg?.message}
        />
        <FormField
          label="CPF"
          register={register}
          name={`${prefix}.cpf`}
          mask="999.999.999-99"
          error={errors[prefix]?.cpf?.message}
        />
        <FormField
          label="Endereço"
          register={register}
          name={`${prefix}.address`}
          error={errors[prefix]?.address?.message}
        />
        <FormField
          label="Email"
          register={register}
          name={`${prefix}.email`}
          type="email"
          error={errors[prefix]?.email?.message}
        />
        <FormField
          label="Telefone"
          register={register}
          name={`${prefix}.phone`}
          mask="(99) 99999-9999"
          error={errors[prefix]?.phone?.message}
        />
        <FormField
          label="Nome do Pai"
          register={register}
          name={`${prefix}.fatherName`}
          error={errors[prefix]?.fatherName?.message}
        />
        <FormField
          label="Nome da Mãe"
          register={register}
          name={`${prefix}.motherName`}
          error={errors[prefix]?.motherName?.message}
        />
        <FormField
          label="Cartório de Registro"
          register={register}
          name={`${prefix}.registryOffice`}
          error={errors[prefix]?.registryOffice?.message}
        />
        <FormField
          label="Livro"
          register={register}
          name={`${prefix}.registryBook`}
          error={errors[prefix]?.registryBook?.message}
        />
        <FormField
          label="Folha"
          register={register}
          name={`${prefix}.registryPage`}
          error={errors[prefix]?.registryPage?.message}
        />
        <FormField
          label="Termo"
          register={register}
          name={`${prefix}.registryTerm`}
          error={errors[prefix]?.registryTerm?.message}
        />
        <FormField
          label="Data do Divórcio (se aplicável)"
          register={register}
          name={`${prefix}.divorceDate`}
          type="date"
          required={false}
          error={errors[prefix]?.divorceDate?.message}
        />
        <FormField
          label="Novo Nome (se aplicável)"
          register={register}
          name={`${prefix}.newName`}
          required={false}
          error={errors[prefix]?.newName?.message}
        />
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="max-w-7xl mx-auto p-6 space-y-8">
      <div className="bg-white p-6 rounded-lg shadow-sm space-y-4 mb-8">
        <h2 className="text-xl font-semibold border-b pb-2">Informações da Declaração</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            label="Data"
            register={register}
            name="date"
            type="date"
            error={errors.date?.message}
          />
          <FormField
            label="Cidade"
            register={register}
            name="city"
            options={MUNICIPIOS_BRASIL.map(m => m.nome)}
            error={errors.city?.message}
          />
          <FormField
            label="Estado"
            register={register}
            name="state"
            options={ESTADOS_BRASILEIROS}
            error={errors.state?.message}
          />
        </div>
      </div>

      {renderPersonFields('firstPerson', 'Primeiro Declarante')}
      {renderPersonFields('secondPerson', 'Segundo Declarante')}

      <div className="bg-white p-6 rounded-lg shadow-sm space-y-4">
        <h2 className="text-xl font-semibold border-b pb-2">Informações da União</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Data de Início da União"
            register={register}
            name="unionStartDate"
            type="date"
            error={errors.unionStartDate?.message}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700">Regime de Bens</label>
            <select
              {...register('propertyRegime')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
            >
              <option value="COMUNHAO_PARCIAL">Comunhão Parcial de Bens</option>
              <option value="SEPARACAO_TOTAL">Separação Total de Bens</option>
              <option value="PARTICIPACAO_FINAL">Participação Final nos Aquestos</option>
              <option value="COMUNHAO_UNIVERSAL">Comunhão Universal de Bens</option>
            </select>
            {errors.propertyRegime && (
              <p className="mt-1 text-sm text-red-600">{errors.propertyRegime.message}</p>
            )}
          </div>
          <FormField
            label="Data do Pacto"
            register={register}
            name="pactDate"
            type="date"
            required={false}
            error={errors.pactDate?.message}
          />
          <FormField
            label="Cartório do Pacto"
            register={register}
            name="pactOffice"
            required={false}
            error={errors.pactOffice?.message}
          />
          <FormField
            label="Livro do Pacto"
            register={register}
            name="pactBook"
            required={false}
            error={errors.pactBook?.message}
          />
          <FormField
            label="Folha do Pacto"
            register={register}
            name="pactPage"
            required={false}
            error={errors.pactPage?.message}
          />
          <FormField
            label="Termo do Pacto"
            register={register}
            name="pactTerm"
            required={false}
            error={errors.pactTerm?.message}
          />
          <FormField
            label="Nome do Oficial Registrador"
            register={register}
            name="registrarName"
            options={Object.keys(OFICIAIS_REGISTRADORES)}
            error={errors.registrarName?.message}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-primary text-white py-3 px-4 rounded-lg hover:bg-primary-dark disabled:opacity-50 font-medium text-lg"
      >
        {isSubmitting ? 'Salvando...' : 'Salvar Registro'}
      </button>
    </form>
  );
}