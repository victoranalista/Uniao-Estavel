'use client';
import { User, Heart } from 'lucide-react';
import { Form } from '@/components/ui/form';
import { FormSubmissionProps } from '../types/types';
import { FormHeader } from './FormHeader';
import { DeclarationDataSection } from './SelectFields';
import { useDeclarationForm, FormActions } from './InputFields';
import { PersonSection } from './PersonSection';
import { useStates, useFilteredCities } from './useLocationData';

export const DeclarationForm = ({
  onSubmit,
  initialData
}: FormSubmissionProps) => {
  const { form, isSubmitting, formError, processFormSubmission } = useDeclarationForm({
    onSubmit,
    initialData
  });
  const { states, isStatesLoading } = useStates();
  const firstPersonState = form.watch('firstPerson.birthPlaceState');
  const secondPersonState = form.watch('secondPerson.birthPlaceState');
  const {
    cities: firstPersonCities,
    isCitiesLoading: isFirstPersonCitiesLoading
  } = useFilteredCities(firstPersonState);
  
  const {
    cities: secondPersonCities,
    isCitiesLoading: isSecondPersonCitiesLoading
  } = useFilteredCities(secondPersonState);

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8 space-y-8">
      <FormHeader />
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(processFormSubmission)}
          className="space-y-8"
        >
          <DeclarationDataSection form={form} />

          <PersonSection
            form={form}
            prefix="firstPerson"
            title="Primeiro Declarante"
            icon={<User className="h-5 w-5" />}
            states={states}
            cities={firstPersonCities}
            isStatesLoading={isStatesLoading}
            isCitiesLoading={isFirstPersonCitiesLoading}
          />

          <PersonSection
            form={form}
            prefix="secondPerson"
            title="Segundo Declarante"
            icon={<Heart className="h-5 w-5" />}
            states={states}
            cities={secondPersonCities}
            isStatesLoading={isStatesLoading}
            isCitiesLoading={isSecondPersonCitiesLoading}
          />

          <FormActions isSubmitting={isSubmitting} formError={formError} />
        </form>
      </Form>
    </div>
  );
};
