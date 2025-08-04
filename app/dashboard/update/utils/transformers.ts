import { UpdateFormData, DeclarationWithRelations } from '../types';

const formatDateToString = (date: Date): string => date.toISOString().split('T')[0];

const extractCompletePersonData = (participant: DeclarationWithRelations['participants'][0]) => ({
  name: participant.name,
  nationality: participant.nationality,
  civilStatus: participant.maritalStatus,
  birthDate: formatDateToString(participant.birthDate),
  birthPlaceState: participant.birthPlaceState,
  birthPlaceCity: participant.birthPlaceCity,
  profession: participant.occupation,
  rg: participant.rg,
  taxpayerId: participant.cpf,
  address: participant.address,
  email: participant.email,
  phone: participant.phone,
  fatherName: participant.fatherName,
  motherName: participant.motherName,
  registryOffice: participant.registryOffice,
  registryBook: participant.registryBook,
  registryPage: participant.registryPage,
  registryTerm: participant.registryTerm,
  typeRegistry: participant.typeRegistry,
  divorceDate: '',
  newName: ''
});

export const transformDeclarationToFormData = (declaration: DeclarationWithRelations): Partial<UpdateFormData> => {
  const firstPerson = declaration.participants.find(p => p.isFirstPerson);
  const secondPerson = declaration.participants.find(p => !p.isFirstPerson);
  
  if (!firstPerson || !secondPerson) return {};

  return {
    date: formatDateToString(declaration.declarationDate),
    city: declaration.city,
    state: declaration.state,
    unionStartDate: formatDateToString(declaration.unionStartDate),
    propertyRegime: declaration.propertyRegime as UpdateFormData['propertyRegime'],
    registrarName: declaration.registryInfo?.registrarName || '',
    stamp: '',
    pactDate: declaration.prenuptial?.pactDate ? formatDateToString(declaration.prenuptial.pactDate) : '',
    pactOffice: declaration.prenuptial?.pactOffice || '',
    pactBook: declaration.prenuptial?.pactBook || '',
    pactPage: declaration.prenuptial?.pactPage || '',
    pactTerm: declaration.prenuptial?.pactTerm || '',
    averbation: '',
    firstPerson: extractCompletePersonData(firstPerson),
    secondPerson: extractCompletePersonData(secondPerson)
  };
};