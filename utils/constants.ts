import { BrasilAPI } from '@matheustrres/brasilapi';
export * from '@/lib/utils';

export const MALE_NATIONALITIES = [
  'Brasileiro', 'Afegão', 'Albanês', 'Alemão', 'Americano', 'Andorrano', 'Angolano',
  'Antiguano', 'Argentino', 'Armênio', 'Australiano', 'Austríaco', 'Azerbaijano',
  'Bahamense', 'Bangladeshi', 'Barbadiano', 'Belga', 'Belizenho', 'Beninense',
  'Boliviano', 'Bósnio', 'Botsuanês', 'Britânico', 'Búlgaro', 'Burquinês',
  'Burundiano', 'Butanês', 'Cabo-verdiano', 'Camaronês', 'Cambojano', 'Canadense',
  'Catarense', 'Cazaque', 'Chadiano', 'Chileno', 'Chinês', 'Cipriota', 'Colombiano',
  'Comorense', 'Congolês', 'Sul-coreano', 'Norte-coreano', 'Costarriquenho', 'Croata',
  'Cubano', 'Dinamarquês', 'Dominicano', 'Egípcio', 'Salvadorenho', 'Emiradense',
  'Equatoriano', 'Eritreu', 'Eslovaco', 'Esloveno', 'Espanhol', 'Estadunidense',
  'Estoniano', 'Etíope', 'Fijiano', 'Filipino', 'Finlandês', 'Francês', 'Gabonês',
  'Gambiano', 'Ganês', 'Georgiano', 'Grego', 'Guatemalteco', 'Guianense', 'Guineense',
  'Haitiano', 'Holandês', 'Hondurenho', 'Húngaro', 'Iemenita', 'Indiano', 'Indonésio',
  'Iraniano', 'Iraquiano', 'Irlandês', 'Islandês', 'Israelense', 'Italiano', 'Jamaicano',
  'Japonês', 'Jordaniano', 'Kuwaitiano', 'Laosiano', 'Lesoto', 'Letão', 'Libanês',
  'Liberiano', 'Líbio', 'Liechtensteinense', 'Lituano', 'Luxemburguês', 'Macedônio',
  'Madagascarense', 'Malaio', 'Malauiano', 'Maldivo', 'Malinês', 'Maltês', 'Marroquino',
  'Mauriciano', 'Mauritano', 'Mexicano', 'Mianmarense', 'Moçambicano', 'Moldávio',
  'Monegasco', 'Mongol', 'Montenegrino', 'Namibiano', 'Nepalês', 'Nicaraguense',
  'Nigerino', 'Nigeriano', 'Norueguês', 'Neozelandês', 'Omani', 'Palauense',
  'Palestino', 'Panamenho', 'Papua', 'Paquistanês', 'Paraguaio', 'Peruano', 'Polonês',
  'Português', 'Queniano', 'Quirguiz', 'Romeno', 'Ruandês', 'Russo', 'Samoano',
  'Santa-lucense', 'São-cristovense', 'Samarinês', 'São-tomense', 'Saudita',
  'Senegalês', 'Sérvio', 'Seichelense', 'Serra-leonês', 'Singapuriano', 'Sírio',
  'Somali', 'Sri-lankês', 'Suázi', 'Sudanês', 'Sul-sudanês', 'Sueco', 'Suíço',
  'Surinamês', 'Tailandês', 'Taiwanês', 'Tajique', 'Tanzaniano', 'Tcheco',
  'Timorense', 'Togolês', 'Tonganês', 'Trinitário', 'Tunisiano', 'Turcomeno',
  'Turco', 'Tuvaluano', 'Ucraniano', 'Ugandês', 'Uruguaio', 'Uzbeque', 'Vanuatuense',
  'Vaticano', 'Venezuelano', 'Vietnamita', 'Zambiano', 'Zimbabuano'
] as const;

export const FEMALE_NATIONALITIES = [
  'Brasileira', 'Afegã', 'Albanesa', 'Alemã', 'Americana', 'Andorrana', 'Angolana',
  'Antiguana', 'Argentina', 'Armênia', 'Australiana', 'Austríaca', 'Azerbaijana',
  'Bahamense', 'Bangladeshi', 'Barbadiana', 'Belga', 'Belizenha', 'Beninense',
  'Boliviana', 'Bósnia', 'Botsuanesa', 'Britânica', 'Búlgara', 'Burquinense',
  'Burundiana', 'Butanesa', 'Cabo-verdiana', 'Camaronesa', 'Cambojana', 'Canadense',
  'Catarense', 'Cazaque', 'Chadiana', 'Chilena', 'Chinesa', 'Cipriota', 'Colombiana',
  'Comorense', 'Congolesa', 'Sul-coreana', 'Norte-coreana', 'Costarriquenha', 'Croata',
  'Cubana', 'Dinamarquesa', 'Dominicana', 'Egípcia', 'Salvadorenha', 'Emiradense',
  'Equatoriana', 'Eritreia', 'Eslovaca', 'Eslovena', 'Espanhola', 'Estadunidense',
  'Estoniana', 'Etíope', 'Fijiana', 'Filipina', 'Finlandesa', 'Francesa', 'Gabonesa',
  'Gambiana', 'Ganesa', 'Georgiana', 'Grega', 'Guatemalteca', 'Guianense', 'Guineense',
  'Haitiana', 'Holandesa', 'Hondurenha', 'Húngara', 'Iemenita', 'Indiana', 'Indonésia',
  'Iraniana', 'Iraquiana', 'Irlandesa', 'Islandesa', 'Israelense', 'Italiana', 'Jamaicana',
  'Japonesa', 'Jordaniana', 'Kuwaitiana', 'Laosiana', 'Lesota', 'Letã', 'Libanesa',
  'Liberiana', 'Líbia', 'Liechtensteinense', 'Lituana', 'Luxemburguesa', 'Macedônia',
  'Madagascarense', 'Malaia', 'Malauiana', 'Maldiva', 'Malinesa', 'Maltesa', 'Marroquina',
  'Mauriciana', 'Mauritana', 'Mexicana', 'Mianmarense', 'Moçambicana', 'Moldávia',
  'Monegasca', 'Mongol', 'Montenegrina', 'Namibiana', 'Nepalesa', 'Nicaraguense',
  'Nigerina', 'Nigeriana', 'Norueguesa', 'Neozelandesa', 'Omani', 'Palauense',
  'Palestina', 'Panamenha', 'Papua', 'Paquistanesa', 'Paraguaia', 'Peruana', 'Polonesa',
  'Portuguesa', 'Queniana', 'Quirguiz', 'Romena', 'Ruandesa', 'Russa', 'Samoana',
  'Santa-lucense', 'São-cristovense', 'Samarinesa', 'São-tomense', 'Saudita',
  'Senegalesa', 'Sérvia', 'Seichelense', 'Serra-leonesa', 'Singapuriana', 'Síria',
  'Somali', 'Sri-lankesa', 'Suázi', 'Sudanesa', 'Sul-sudanesa', 'Sueca', 'Suíça',
  'Surinamesa', 'Tailandesa', 'Taiwanesa', 'Tajique', 'Tanzaniana', 'Tcheca',
  'Timorense', 'Togolesa', 'Tonganesa', 'Trinitária', 'Tunisiana', 'Turcomena',
  'Turca', 'Tuvaluana', 'Ucraniana', 'Ugandesa', 'Uruguaia', 'Uzbeque', 'Vanuatuense',
  'Vaticana', 'Venezuelana', 'Vietnamita', 'Zambiana', 'Zimbabuana'
] as const;

export const MALE_CIVIL_STATUS = ['Solteiro', 'Viúvo', 'Divorciado'] as const;

export const FEMALE_CIVIL_STATUS = ['Solteira', 'Viúva', 'Divorciada'] as const;

export const CIVIL_STATUS = ['Solteiro(a)', 'Viúvo(a)', 'Divorciado(a)'] as const;

export const REGISTRY_OFFICERS = {
  'André Victor Alves de Sousa': 'Oficial Auxiliar',
  'Karina Alves Barbosa': 'Oficial Substituta',
  'Daniella dos Santos': 'Oficial Substituta',
  'Myllena Areda Fernandes': 'Oficial Auxiliar'
} as const;

export const REGISTRY_TYPES = [
  'Nascimento',
  'Casamento',
  'Óbito'
] as const;

interface IBGEState {
  id: number;
  sigla: string;
  nome: string;
}

interface IBGECity {
  nome: string;
}

const brasilAPI = new BrasilAPI();
const statesCache = new Map<string, string[]>();

const getFromCache = (key: string): string[] | undefined => statesCache.get(key);

const setInCache = (key: string, data: string[]): void => {
  statesCache.set(key, data);
};

const getStatesFallback = (): string[] => [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG',
  'PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'
];

const fetchStatesFromAPI = async (): Promise<string[]> => {
  const { data: statesPage } = await brasilAPI.IBGE.listStates({ take: 27 });
  const states = await statesPage!.loadPages();
  return states.flat().map((state: IBGEState) => state.sigla).sort();
};

export const fetchStates = async (): Promise<string[]> => {
  const cacheKey = 'states';
  const cached = getFromCache(cacheKey);
  if (cached) return cached;
  try {
    const states = await fetchStatesFromAPI();
    setInCache(cacheKey, states);
    return states;
  } catch {
    const fallback = getStatesFallback();
    setInCache(cacheKey, fallback);
    return fallback;
  }
};

const fetchCitiesFromAPI = async (uf: string): Promise<string[]> => {
  const { data: page } = await brasilAPI.IBGE.listFederativeUnitMinicipalities(uf, undefined, { take: 1000 });
  const municipalities = await page!.loadPages();
  return municipalities.flat().map((city: IBGECity) => city.nome).sort();
};

export const fetchCitiesByState = async (uf: string): Promise<string[]> => {
  const cacheKey = `cities-${uf}`;
  const cached = getFromCache(cacheKey);
  if (cached) return cached;
  try {
    const cities = await fetchCitiesFromAPI(uf);
    setInCache(cacheKey, cities);
    return cities;
  } catch {
    const fallback: string[] = [];
    setInCache(cacheKey, fallback);
    return fallback;
  }
};

export const getNationalitiesByGender = (gender: 'M' | 'F'): readonly string[] => 
  gender === 'M' ? MALE_NATIONALITIES : FEMALE_NATIONALITIES;

export const getCivilStatusByGender = (gender: 'M' | 'F'): readonly string[] => 
  gender === 'M' ? MALE_CIVIL_STATUS : FEMALE_CIVIL_STATUS;