import { BrasilAPI } from '@matheustrres/brasilapi';

export const NACIONALIDADES_MASCULINO = [
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
];

export const NACIONALIDADES_FEMININO = [
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
];

export const ESTADOS_CIVIS_MASCULINO = ['Solteiro', 'Viúvo', 'Divorciado'];

export const ESTADOS_CIVIS_FEMININO = ['Solteira', 'Viúva', 'Divorciada'];

export const ESTADOS_CIVIS = ['Solteiro(a)', 'Viúvo(a)', 'Divorciado(a)'];

export const OFICIAIS_REGISTRADORES: Record<string, string> = {
  'André Victor Alves de Sousa': 'Oficial Auxiliar',
  'Karina Alves Barbosa': 'Oficial Substituta',
  'Daniella dos Santos': 'Oficial Substituta',
  'Myllena Areda Fernandes': 'Oficial Auxiliar'
};

export const REGISTRO_CARTORIO = [
  'Nascimento',
  'Casamento',
  'Óbito'
];

interface Estado {
  id: number;
  sigla: string;
  nome: string;
}

interface Cidade {
  nome: string;
}

const brasilAPI = new BrasilAPI();
const cache = new Map<string, string[]>();

export const buscarEstados = async (): Promise<string[]> => {
  const cacheKey = 'estados';
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey)!;
  }
  try {
    const { data: statesPage } = await brasilAPI.IBGE.listStates({ take: 27 });
    const states = await statesPage!.loadPages();
    const siglas = states.flat().map((s: any) => s.sigla).sort();
    cache.set(cacheKey, siglas);
    return siglas;
  } catch (error) {
    console.error('Error fetching states from IBGE:', error);
    const fallback = [
      'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG',
      'PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'
    ];
    cache.set(cacheKey, fallback);
    return fallback;
  }
};

export const buscarCidadesPorEstado = async (uf: string): Promise<string[]> => {
  const cacheKey = `cities-${uf}`;
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey)!;
  }
  try {
    const { data: page } =
      await brasilAPI.IBGE.listFederativeUnitMinicipalities(uf, undefined, { take: 1000 });
    const municipalities = await page!.loadPages();
    const names = municipalities.flat().map((c: any) => c.nome).sort();
    cache.set(cacheKey, names);
    return names;
  } catch (error) {
    console.error(`Error fetching cities for state ${uf}:`, error);
    const fallback: string[] = [];
    cache.set(cacheKey, fallback);
    return fallback;
  }
}

export const getNacionalidadesPorGenero = (genero: 'M' | 'F'): string[] => 
  genero === 'M' ? NACIONALIDADES_MASCULINO : NACIONALIDADES_FEMININO;

export const getEstadosCivisPorGenero = (genero: 'M' | 'F'): string[] => 
  genero === 'M' ? ESTADOS_CIVIS_MASCULINO : ESTADOS_CIVIS_FEMININO;