import { PersonInput, PdfPersonData, DeclarationInput, PropertyRegime, PdfData } from '@/types/declarations';

interface PersonData {
  name: string;
  nationality: string;
  civilStatus: string;
  birthDate: Date;
  birthPlaceState: string;
  birthPlaceCity: string;
  profession: string;
  rg: string;
  taxpayerId: string;
  address: string;
  email: string;
  phone: string;
  fatherName: string;
  motherName: string;
  registryOffice: string;
  registryBook: string;
  registryPage: string;
  registryTerm: string;
  divorceDate?: Date;
  newName?: string;
}

interface DeclarationData {
  city: string;
  state: string;
  stamp: string;
  firstPerson: PersonData;
  secondPerson: PersonData;
  unionStartDate: Date;
  propertyRegime: PropertyRegime;
  registrarName?: string;
  pactDate?: Date;
  pactOffice?: string;
  pactBook?: string;
  pactPage?: string;
  pactTerm?: string;
}

export const combineBirthPlace = (state: string, city: string): string => `${city}, ${state}`;

export const convertFormDataToObject = (formData: FormData): Record<string, string> => {
  const rawData: Record<string, string> = {};
  formData.forEach((value, key) => {
    if (key.includes('.')) {
      const keys = key.split('.');
      let current = rawData as Record<string, string | Record<string, string>>;
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]] as Record<string, string | Record<string, string>>;
      }
      (current as Record<string, string>)[keys[keys.length - 1]] = value as string;
    } else {
      rawData[key] = value as string;
    }
  });
  return rawData;
};

type PersonPrismaInput = {
  identity: {
    create: {
      fullName: string;
      nationality: string;
      birthDate: Date;
      birthPlace: string;
      taxId: string;
    };
  };
  civilStatuses: {
    create: {
      status: string;
    };
  };
  addresses: {
    create: {
      street: string;
      number: string;
      neighborhood: string;
      city: string;
      state: string;
    };
  };
  contact: {
    create: {
      email: string;
      phone: string;
    };
  };
  documents: {
    create: {
      rg: string;
    };
  };
  family: {
    create: {
      fatherName: string;
      motherName: string;
    };
  };
  professional: {
    create: {
      profession: string;
    };
  };
  registry: {
    create: {
      registryOffice: string;
      registryBook: string;
      registryPage: string;
      registryTerm: string;
    };
  };
};

export const createPersonPrismaData = (personData: PersonData): PersonPrismaInput => ({
  identity: {
    create: {
      fullName: personData.name,
      nationality: personData.nationality,
      birthDate: personData.birthDate,
      birthPlace: combineBirthPlace(personData.birthPlaceState, personData.birthPlaceCity),
      taxId: personData.taxpayerId,
    }
  },
  civilStatuses: {
    create: {
      status: personData.civilStatus,
    }
  },
  addresses: {
    create: {
      street: personData.address,
      number: "S/N",
      neighborhood: "Centro",
      city: personData.birthPlaceCity,
      state: personData.birthPlaceState,
    }
  },
  contact: {
    create: {
      email: personData.email,
      phone: personData.phone,
    }
  },
  documents: {
    create: {
      rg: personData.rg,
    }
  },
  family: {
    create: {
      fatherName: personData.fatherName,
      motherName: personData.motherName,
    }
  },
  professional: {
    create: {
      profession: personData.profession,
    }
  },
  registry: {
    create: {
      registryOffice: personData.registryOffice,
      registryBook: personData.registryBook,
      registryPage: personData.registryPage,
      registryTerm: personData.registryTerm,
    }
  }
});

export const mapPersonToPdf = (personData: PersonData): PdfPersonData => ({
  name: personData.name,
  cpf: personData.taxpayerId,
  nationality: personData.nationality,
  civilStatus: personData.civilStatus,
  birthDate: personData.birthDate.toISOString(),
  birthPlace: combineBirthPlace(personData.birthPlaceState, personData.birthPlaceCity),
  birthPlaceState: personData.birthPlaceState,
  birthPlaceCity: personData.birthPlaceCity,
  profession: personData.profession,
  rg: personData.rg,
  taxpayerId: personData.taxpayerId,
  address: personData.address,
  email: personData.email,
  phone: personData.phone,
  fatherName: personData.fatherName,
  motherName: personData.motherName,
  registryOffice: personData.registryOffice,
  registryBook: personData.registryBook,
  registryPage: personData.registryPage,
  registryTerm: personData.registryTerm,
  typeRegistry: 'NASCIMENTO',
  divorceDate: personData.divorceDate?.toISOString(),
  newName: personData.newName,
});

export const mapDeclarationToPdf = (data: DeclarationData): PdfData => ({
  date: new Date().toLocaleDateString('pt-BR'),
  city: data.city,
  state: data.state,
  stamp: data.stamp,
  firstPerson: mapPersonToPdf(data.firstPerson),
  secondPerson: mapPersonToPdf(data.secondPerson),
  unionStartDate: data.unionStartDate.toLocaleDateString('pt-BR'),
  propertyRegime: data.propertyRegime,
  registrarName: data.registrarName,
  pactDate: data.pactDate?.toLocaleDateString('pt-BR'),
  pactOffice: data.pactOffice,
  pactBook: data.pactBook,
  pactPage: data.pactPage,
  pactTerm: data.pactTerm,
});
export const convertFormDataToDeclarationInput = (formData: FormData): DeclarationInput => {
  const data = convertFormDataToObject(formData);
  return {
    date: data.date,
    city: data.city,
    state: data.state,
    unionStartDate: data.unionStartDate,
    propertyRegime: data.propertyRegime as PropertyRegime,
    registrarName: data.registrarName,
    stamp: data.stamp,
    pactDate: data.pactDate,
    pactOffice: data.pactOffice,
    pactBook: data.pactBook,
    pactPage: data.pactPage,
    pactTerm: data.pactTerm,
    firstPerson: {
      name: data['firstPerson.name'],
      nationality: data['firstPerson.nationality'],
      civilStatus: data['firstPerson.civilStatus'],
      birthDate: data['firstPerson.birthDate'],
      birthPlaceState: data['firstPerson.birthPlaceState'],
      birthPlaceCity: data['firstPerson.birthPlaceCity'],
      profession: data['firstPerson.profession'],
      rg: data['firstPerson.rg'],
      taxpayerId: data['firstPerson.taxpayerId'],
      address: data['firstPerson.address'],
      email: data['firstPerson.email'],
      phone: data['firstPerson.phone'],
      fatherName: data['firstPerson.fatherName'],
      motherName: data['firstPerson.motherName'],
      registryOffice: data['firstPerson.registryOffice'],
      registryBook: data['firstPerson.registryBook'],
      registryPage: data['firstPerson.registryPage'],
      registryTerm: data['firstPerson.registryTerm'],
      divorceDate: data['firstPerson.divorceDate'],
      newName: data['firstPerson.newName'],
    },
    secondPerson: {
      name: data['secondPerson.name'],
      nationality: data['secondPerson.nationality'],
      civilStatus: data['secondPerson.civilStatus'],
      birthDate: data['secondPerson.birthDate'],
      birthPlaceState: data['secondPerson.birthPlaceState'],
      birthPlaceCity: data['secondPerson.birthPlaceCity'],
      profession: data['secondPerson.profession'],
      rg: data['secondPerson.rg'],
      taxpayerId: data['secondPerson.taxpayerId'],
      address: data['secondPerson.address'],
      email: data['secondPerson.email'],
      phone: data['secondPerson.phone'],
      fatherName: data['secondPerson.fatherName'],
      motherName: data['secondPerson.motherName'],
      registryOffice: data['secondPerson.registryOffice'],
      registryBook: data['secondPerson.registryBook'],
      registryPage: data['secondPerson.registryPage'],
      registryTerm: data['secondPerson.registryTerm'],
      divorceDate: data['secondPerson.divorceDate'],
      newName: data['secondPerson.newName'],
    }
  };
};