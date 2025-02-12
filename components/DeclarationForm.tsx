"use client";
import { useState, useEffect, forwardRef } from 'react';
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

type FormData = z.infer<typeof declarationSchema>;
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

interface DeclarationFormProps {
  selectedDeclaration?: {
    unionStartDate: string;
    firstPerson: {
      name: string;
      nationality: string;
      civilStatus: string;
      typeRegistry: string;
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
      typeRegistry: string;
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
  } | null;
}

const MaskedInput = forwardRef<HTMLInputElement, any>((props, ref) => (
  <InputMask {...props} ref={ref}>
    {(inputProps: any) => (
      <input
        {...inputProps}
        type={props.type}
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
      />
    )}
  </InputMask>
));
MaskedInput.displayName = 'MaskedInput';
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
        <MaskedInput
          mask={mask}
          type={type}
          {...register(name)}
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
export function DeclarationForm({ selectedDeclaration }: DeclarationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [firstPersonAge, setFirstPersonAge] = useState<number | null>(null);
  const [secondPersonAge, setSecondPersonAge] = useState<number | null>(null);
  const [selectedSeal, setSelectedSeal] = useState<string | null>(null);
  const [seals, setSeals] = useState<string[]>([]);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(declarationSchema),
    defaultValues: {
      city: 'Brasília',
      state: 'DF'
    }
  });

  useEffect(() => {
    if (selectedDeclaration) {

      setValue('unionStartDate', selectedDeclaration.unionStartDate);

      Object.entries(selectedDeclaration.firstPerson).forEach(([key, value]) => {
        setValue(`firstPerson.${key as keyof typeof selectedDeclaration.firstPerson}`, value);
      });      

      Object.entries(selectedDeclaration.secondPerson).forEach(([key, value]) => {
        setValue(`secondPerson.${key as keyof typeof selectedDeclaration.secondPerson}`, value);
      });
      
    }
  }, [selectedDeclaration, setValue]);

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };
  const handleBirthDateChange = (date: string, person: 'first' | 'second') => {
    const age = calculateAge(date);
    if (person === 'first') {
      setFirstPersonAge(age);
    } else {
      setSecondPersonAge(age);
    }
  };

  const registrarName = watch('registrarName'); 
  const selectedOfficialFunction = OFICIAIS_REGISTRADORES[registrarName] || 'Oficial Registrador';

  const handleCitySelect = (cityName: string) => {
    const city = MUNICIPIOS_BRASIL.find(m => m.nome === cityName);
    if (city) {
      setValue('city', city.uf);
    }
  };
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
          onSelect={(date) => handleBirthDateChange(date, prefix === 'firstPerson' ? 'first' : 'second')}
        />
        <FormField
          label="Local de Nascimento"
          register={register}
          name={`${prefix}.birthPlace`}
          options={MUNICIPIOS_BRASIL.map(m => m.nome)}
          onSelect={handleCitySelect}
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
      {(firstPersonAge !== null && firstPersonAge < 18) && (
        <Alert variant="default">
          {firstPersonAge < 16 ?
            "Pessoa menor de 16 anos não pode formalizar união estável." :
            "Pessoa entre 16 e 18 anos precisa de autorização dos pais ou responsáveis."}
        </Alert>
      )}
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
          <p className="text-sm text-gray-600">{selectedOfficialFunction}</p>
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