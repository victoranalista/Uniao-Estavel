"use client";
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import InputMask from 'react-input-mask';
import { Declaration, PropertyRegime } from '@/domain/entities/Declaration';
import { validateCPF } from '@/utils/validators';

const personSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  nationality: z.string().min(1, 'Nacionalidade é obrigatória'),
  civilStatus: z.string().min(1, 'Estado civil é obrigatório'),
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
type FormData = z.infer<typeof declarationSchema>;
interface FormFieldProps {
  label: string;
  register: any;
  name: string;
  error?: string;
  type?: string;
  required?: boolean;
  mask?: string;
}
const FormField = ({
  label,
  register,
  name,
  error,
  type = "text",
  required = true,
  mask
}: FormFieldProps) => {
  const inputProps = register(name);
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      {mask ? (
        <InputMask
          mask={mask}
          type={type}
          {...inputProps}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
          required={required}
        />
      ) : (
        <input
          type={type}
          {...inputProps}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
          required={required}
        />
      )}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};
export function DeclarationForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(declarationSchema),
  });
  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error('Erro ao gerar o PDF. Por favor, tente novamente.');
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'declaracao-uniao-estavel.pdf';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error:', error);
      setError(error instanceof Error ? error.message : 'Erro ao gerar o PDF');
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
          error={errors[prefix]?.nationality?.message}
        />
        <FormField
          label="Estado Civil"
          register={register}
          name={`${prefix}.civilStatus`}
          error={errors[prefix]?.civilStatus?.message}
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
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-7xl mx-auto p-6 space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Termo Declaratório de União Estável</h1>
        <p className="text-gray-600">Cartório Colorado</p>
      </div>
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-8">
          <p className="text-red-700">{error}</p>
        </div>
      )}
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
            error={errors.city?.message}
          />
          <FormField
            label="Estado"
            register={register}
            name="state"
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
            error={errors.registrarName?.message}
          />
        </div>
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-primary text-white py-3 px-4 rounded-lg hover:bg-primary-dark disabled:opacity-50 font-medium text-lg"
      >
        {isSubmitting ? 'Gerando PDF...' : 'Gerar Declaração'}
      </button>
    </form>
  );
}