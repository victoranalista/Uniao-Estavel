'use server';

import { PdfData } from '@/types/declarations';
import { combineBirthPlace } from '@/app/dashboard/services/validation';

export const mapDeclarationToPdf = (declaration: { participants: [any, any]; declarationDate: { toISOString: () => any; }; city: any; state: any; unionStartDate: { toISOString: () => any; }; propertyRegime: string; registryInfo: { registrarName: any; }; prenuptial: { pactDate: { toISOString: () => any; }; pactOffice: any; pactBook: any; pactPage: any; pactTerm: any; }; history: any[]; }): PdfData => {
  const [firstParticipant, secondParticipant] = declaration.participants;
  
return {
  city: declaration.city,
  state: declaration.state,
  firstPerson: {
    name: firstParticipant.person.identity?.fullName || '',
    cpf: firstParticipant.person.identity?.taxId || '',
    nationality: firstParticipant.person.identity?.nationality || '',
    civilStatus: firstParticipant.person.civilStatuses?.[0]?.status || '',
    birthDate: firstParticipant.person.identity?.birthDate?.toISOString() || '',
    birthPlace: firstParticipant.person.identity?.birthPlace || '',
    profession: firstParticipant.person.professional?.profession || '',
    rg: firstParticipant.person.documents?.rg || '',
    address: firstParticipant.person.addresses?.[0]?.street || '',
    email: firstParticipant.person.contact?.email || '',
    phone: firstParticipant.person.contact?.phone || '',
    fatherName: firstParticipant.person.family?.fatherName || '',
    motherName: firstParticipant.person.family?.motherName || '',
    registryOffice: firstParticipant.person.registry?.registryOffice || '',
    registryBook: firstParticipant.person.registry?.registryBook || '',
    registryPage: firstParticipant.person.registry?.registryPage || '',
    registryTerm: firstParticipant.person.registry?.registryTerm || '',
    typeRegistry: 'NASCIMENTO',
    birthPlaceState: '',
    birthPlaceCity: '',
    taxpayerId: ''
  },
  secondPerson: {
    name: secondParticipant.person.identity?.fullName || '',
    cpf: secondParticipant.person.identity?.taxId || '',
    nationality: secondParticipant.person.identity?.nationality || '',
    civilStatus: secondParticipant.person.civilStatuses?.[0]?.status || '',
    birthDate: secondParticipant.person.identity?.birthDate?.toISOString() || '',
    birthPlace: secondParticipant.person.identity?.birthPlace || '',
    profession: secondParticipant.person.professional?.profession || '',
    rg: secondParticipant.person.documents?.rg || '',
    address: secondParticipant.person.addresses?.[0]?.street || '',
    email: secondParticipant.person.contact?.email || '',
    phone: secondParticipant.person.contact?.phone || '',
    fatherName: secondParticipant.person.family?.fatherName || '',
    motherName: secondParticipant.person.family?.motherName || '',
    registryOffice: secondParticipant.person.registry?.registryOffice || '',
    registryBook: secondParticipant.person.registry?.registryBook || '',
    registryPage: secondParticipant.person.registry?.registryPage || '',
    registryTerm: secondParticipant.person.registry?.registryTerm || '',
    typeRegistry: 'NASCIMENTO',
    birthPlaceState: '',
    birthPlaceCity: '',
    taxpayerId: ''
  },
  unionStartDate: declaration.unionStartDate.toISOString(),
  propertyRegime: declaration.propertyRegime as 'COMUNHAO_PARCIAL' | 'SEPARACAO_TOTAL' | 'PARTICIPACAO_FINAL' | 'COMUNHAO_UNIVERSAL',
  registrarName: declaration.registryInfo?.registrarName || '',
  pactDate: declaration.prenuptial?.pactDate?.toISOString(),
  pactOffice: declaration.prenuptial?.pactOffice,
  pactBook: declaration.prenuptial?.pactBook,
  pactPage: declaration.prenuptial?.pactPage,
  pactTerm: declaration.prenuptial?.pactTerm,
  averbations: declaration.history?.map((h: any) => ({
    text: h.description,
    date: h.updatedAt.toISOString(),
    updatedBy: h.updatedBy
  })),
  isUpdate: true,
  date: '',
  stamp: ''
};
};