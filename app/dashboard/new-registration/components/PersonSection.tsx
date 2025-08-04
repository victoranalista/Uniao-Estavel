import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TextInputField, DateInputField } from './InputFields';
import { GenderSelectField, SelectField } from './SelectFields';
import { StateSelectField, CitySelectField } from './LocationFields';
import { REGISTRY_TYPES } from '@/utils/constants';
import { CPF_MASK, PHONE_MASK } from '../utils/constants';
import { UseFormReturn } from 'react-hook-form';
import { DeclarationFormData } from '../types';

interface PersonSectionProps {
  form: UseFormReturn<DeclarationFormData>;
  prefix: 'firstPerson' | 'secondPerson';
  title: string;
  icon: React.ReactNode;
  states: string[];
  cities: string[];
  isStatesLoading: boolean;
  isCitiesLoading: boolean;
}

const renderPersonalFields = (form: UseFormReturn<DeclarationFormData>, prefix: 'firstPerson' | 'secondPerson') => (
  <>
    <TextInputField form={form} name={`${prefix}.name`} label="Nome Completo" />
    <GenderSelectField form={form} prefix={prefix} label="Nacionalidade" fieldType="nationality" />
    <GenderSelectField form={form} prefix={prefix} label="Estado Civil" fieldType="civilStatus" />
    <DateInputField form={form} name={`${prefix}.birthDate`} label="Data de Nascimento" />
  </>
);

const renderLocationFields = (
  form: UseFormReturn<DeclarationFormData>, 
  prefix: 'firstPerson' | 'secondPerson', 
  states: string[], 
  cities: string[], 
  isStatesLoading: boolean, 
  isCitiesLoading: boolean
) => (
  <>
    <StateSelectField 
      form={form} 
      name={`${prefix}.birthPlaceState`} 
      label="Estado de Nascimento"
      states={states}
      isLoading={isStatesLoading}
    />
    <CitySelectField 
      form={form} 
      stateFieldName={`${prefix}.birthPlaceState`}
      cityFieldName={`${prefix}.birthPlaceCity`}
      label="Cidade de Nascimento"
      cities={cities}
      isLoading={isCitiesLoading}
    />
  </>
);

const renderDocumentFields = (form: UseFormReturn<DeclarationFormData>, prefix: 'firstPerson' | 'secondPerson') => (
  <>
    <TextInputField form={form} name={`${prefix}.profession`} label="Profissão" />
    <TextInputField form={form} name={`${prefix}.rg`} label="RG" />
    <TextInputField form={form} name={`${prefix}.taxpayerId`} label="CPF" mask={CPF_MASK} />
    <SelectField 
      form={form} 
      name={`${prefix}.typeRegistry`} 
      label="Tipo de Registro" 
      options={REGISTRY_TYPES}
      placeholder="Selecione o tipo de registro..."
    />
  </>
);

const renderContactFields = (form: UseFormReturn<DeclarationFormData>, prefix: 'firstPerson' | 'secondPerson') => (
  <>
    <div className="md:col-span-2 lg:col-span-3">
      <TextInputField form={form} name={`${prefix}.address`} label="Endereço Completo" />
    </div>
    <TextInputField form={form} name={`${prefix}.email`} label="Email" />
    <TextInputField form={form} name={`${prefix}.phone`} label="Telefone" mask={PHONE_MASK} />
  </>
);

const renderFamilyFields = (form: UseFormReturn<DeclarationFormData>, prefix: 'firstPerson' | 'secondPerson') => (
  <>
    <TextInputField form={form} name={`${prefix}.fatherName`} label="Nome do Pai" />
    <TextInputField form={form} name={`${prefix}.motherName`} label="Nome da Mãe" />
  </>
);

const renderRegistryFields = (form: UseFormReturn<DeclarationFormData>, prefix: 'firstPerson' | 'secondPerson') => (
  <>
    <TextInputField form={form} name={`${prefix}.registryOffice`} label="Cartório de Registro" />
    <TextInputField form={form} name={`${prefix}.registryBook`} label="Livro" />
    <TextInputField form={form} name={`${prefix}.registryPage`} label="Folha" />
    <TextInputField form={form} name={`${prefix}.registryTerm`} label="Termo" />
  </>
);

const renderOptionalFields = (form: UseFormReturn<DeclarationFormData>, prefix: 'firstPerson' | 'secondPerson') => (
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
        {renderPersonalFields(form, prefix)}
        {renderLocationFields(form, prefix, states, cities, isStatesLoading, isCitiesLoading)}
        {renderDocumentFields(form, prefix)}
        {renderContactFields(form, prefix)}
        {renderFamilyFields(form, prefix)}
        {renderRegistryFields(form, prefix)}
        {renderOptionalFields(form, prefix)}
      </div>
    </CardContent>
  </Card>
);