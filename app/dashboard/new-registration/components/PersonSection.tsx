import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TextInputField, DateInputField } from './InputFields';
import { GenderSelectField, SelectField } from './SelectFields';
import { REGISTRY_TYPES } from '@/utils/constants';
import { MASKS } from '@/lib/utils/index';
import { PersonSectionProps, DeclarationFormData } from '../types/types';
import { UseFormReturn, FieldPath } from 'react-hook-form';

const LocationSelectField = ({
  form,
  name,
  label,
  options,
  isLoading,
  disabled = false,
  placeholder
}: {
  form: UseFormReturn<DeclarationFormData>;
  name: FieldPath<DeclarationFormData>;
  label: string;
  options: string[];
  isLoading: boolean;
  disabled?: boolean;
  placeholder: string;
}) => (
  <FormField
    control={form.control}
    name={name}
    render={({ field }) => (
      <FormItem>
        <FormLabel>{label}</FormLabel>
        <Select
          onValueChange={field.onChange}
          value={String(field.value || '')}
          disabled={disabled || isLoading}
        >
          <FormControl>
            <SelectTrigger>
              <SelectValue placeholder={isLoading ? 'Carregando...' : placeholder} />
            </SelectTrigger>
          </FormControl>
          <SelectContent>
            {options.map((option) => (
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

const PersonalFields = ({ form, prefix }: { form: UseFormReturn<DeclarationFormData>; prefix: 'firstPerson' | 'secondPerson' }) => (
  <>
    <TextInputField form={form} name={`${prefix}.name`} label="Nome Completo" />
    <GenderSelectField form={form} prefix={prefix} label="Nacionalidade" fieldType="nationality" />
    <GenderSelectField form={form} prefix={prefix} label="Estado Civil" fieldType="civilStatus" />
    <DateInputField form={form} name={`${prefix}.birthDate`} label="Data de Nascimento" />
  </>
);

const LocationFields = ({
  form,
  prefix,
  states,
  cities,
  isStatesLoading,
  isCitiesLoading
}: {
  form: UseFormReturn<DeclarationFormData>;
  prefix: 'firstPerson' | 'secondPerson';
  states: string[];
  cities: string[];
  isStatesLoading: boolean;
  isCitiesLoading: boolean;
}) => {
  const selectedState = form.watch(`${prefix}.birthPlaceState`);
  return (
    <>
      <LocationSelectField
        form={form}
        name={`${prefix}.birthPlaceState`}
        label="Estado de Nascimento"
        options={states}
        isLoading={isStatesLoading}
        placeholder="Selecione o estado..."
      />
      <LocationSelectField
        form={form}
        name={`${prefix}.birthPlaceCity`}
        label="Cidade de Nascimento"
        options={cities}
        isLoading={isCitiesLoading}
        disabled={!selectedState}
        placeholder={
          isCitiesLoading ? 'Carregando...' : selectedState ? 'Selecione a cidade...' : 'Selecione primeiro o estado'
        }
      />
    </>
  );
};

const DocumentFields = ({ form, prefix }: { form: UseFormReturn<DeclarationFormData>; prefix: 'firstPerson' | 'secondPerson' }) => (
  <>
    <TextInputField form={form} name={`${prefix}.profession`} label="Profissão" />
    <TextInputField form={form} name={`${prefix}.rg`} label="RG" />
    <TextInputField form={form} name={`${prefix}.taxpayerId`} label="CPF" mask={MASKS.CPF} />
    <SelectField
      form={form}
      name={`${prefix}.typeRegistry`}
      label="Tipo de Registro"
      options={REGISTRY_TYPES}
      placeholder="Selecione o tipo de registro..."
    />
  </>
);

const ContactFields = ({ form, prefix }: { form: UseFormReturn<DeclarationFormData>; prefix: 'firstPerson' | 'secondPerson' }) => (
  <>
    <div className="md:col-span-2 lg:col-span-3">
      <TextInputField form={form} name={`${prefix}.address`} label="Endereço Completo" />
    </div>
    <TextInputField form={form} name={`${prefix}.email`} label="Email" />
    <TextInputField form={form} name={`${prefix}.phone`} label="Telefone" mask={MASKS.PHONE} />
  </>
);

const FamilyFields = ({ form, prefix }: { form: UseFormReturn<DeclarationFormData>; prefix: 'firstPerson' | 'secondPerson' }) => (
  <>
    <TextInputField form={form} name={`${prefix}.fatherName`} label="Nome do Pai" />
    <TextInputField form={form} name={`${prefix}.motherName`} label="Nome da Mãe" />
  </>
);

const RegistryFields = ({ form, prefix }: { form: UseFormReturn<DeclarationFormData>; prefix: 'firstPerson' | 'secondPerson' }) => (
  <>
    <TextInputField form={form} name={`${prefix}.registryOffice`} label="Cartório de Registro" />
    <TextInputField form={form} name={`${prefix}.registryBook`} label="Livro" />
    <TextInputField form={form} name={`${prefix}.registryPage`} label="Folha" />
    <TextInputField form={form} name={`${prefix}.registryTerm`} label="Termo" />
  </>
);

const OptionalFields = ({ form, prefix }: { form: UseFormReturn<DeclarationFormData>; prefix: 'firstPerson' | 'secondPerson' }) => (
  <>
    <DateInputField form={form} name={`${prefix}.divorceDate`} label="Data do Divórcio" required={false} />
    <TextInputField form={form} name={`${prefix}.newName`} label="Novo Nome Pretendido" required={false} />
  </>
);

export const PersonSection = ({
  form,
  prefix,
  title,
  icon,
  states,
  cities,
  isStatesLoading,
  isCitiesLoading
}: PersonSectionProps) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-3">
        {icon}
        {title}
      </CardTitle>
      <CardDescription>Dados pessoais e documentais do declarante</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <PersonalFields form={form} prefix={prefix} />
        <LocationFields
          form={form}
          prefix={prefix}
          states={states}
          cities={cities}
          isStatesLoading={isStatesLoading}
          isCitiesLoading={isCitiesLoading}
        />
        <DocumentFields form={form} prefix={prefix} />
        <ContactFields form={form} prefix={prefix} />
        <FamilyFields form={form} prefix={prefix} />
        <RegistryFields form={form} prefix={prefix} />
        <OptionalFields form={form} prefix={prefix} />
      </div>
    </CardContent>
  </Card>
);
