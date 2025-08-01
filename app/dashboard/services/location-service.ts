import { memoryCache } from '@/lib/cache';

interface StatesCitiesData {
  states: string[];
  cities: Record<string, string[]>;
}

const CACHE_KEYS = {
  STATES: 'locations:states',
  CITIES: (state: string) => `locations:cities:${state}`,
  ALL_DATA: 'locations:all'
};

const STATES_CITIES_DATA: StatesCitiesData = {
  states: [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 
    'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 
    'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ],
  cities: {
    'DF': ['Brasília'],
    'SP': ['São Paulo', 'Campinas', 'Santos', 'Ribeirão Preto'],
    'RJ': ['Rio de Janeiro', 'Niterói', 'Petrópolis', 'Nova Iguaçu'],
    'MG': ['Belo Horizonte', 'Uberlândia', 'Contagem', 'Juiz de Fora'],
    'PR': ['Curitiba', 'Londrina', 'Maringá', 'Ponta Grossa'],
    'RS': ['Porto Alegre', 'Caxias do Sul', 'Pelotas', 'Santa Maria'],
    'BA': ['Salvador', 'Feira de Santana', 'Vitória da Conquista', 'Camaçari'],
    'SC': ['Florianópolis', 'Joinville', 'Blumenau', 'São José'],
    'GO': ['Goiânia', 'Aparecida de Goiânia', 'Anápolis', 'Rio Verde'],
    'PE': ['Recife', 'Jaboatão dos Guararapes', 'Olinda', 'Caruaru'],
    'CE': ['Fortaleza', 'Caucaia', 'Juazeiro do Norte', 'Maracanaú'],
    'PA': ['Belém', 'Ananindeua', 'Santarém', 'Marabá'],
    'PB': ['João Pessoa', 'Campina Grande', 'Santa Rita', 'Patos'],
    'PI': ['Teresina', 'Parnaíba', 'Picos', 'Piripiri'],
    'AL': ['Maceió', 'Arapiraca', 'Palmeira dos Índios', 'Rio Largo'],
    'RN': ['Natal', 'Mossoró', 'Parnamirim', 'São Gonçalo do Amarante'],
    'ES': ['Vitória', 'Cariacica', 'Cachoeiro de Itapemirim', 'Linhares'],
    'MT': ['Cuiabá', 'Várzea Grande', 'Rondonópolis', 'Sinop'],
    'MS': ['Campo Grande', 'Dourados', 'Três Lagoas', 'Corumbá'],
    'MA': ['São Luís', 'Imperatriz', 'Timon', 'Caxias'],
    'SE': ['Aracaju', 'Nossa Senhora do Socorro', 'Lagarto', 'Itabaiana'],
    'TO': ['Palmas', 'Araguaína', 'Gurupi', 'Porto Nacional'],
    'AC': ['Rio Branco', 'Cruzeiro do Sul', 'Sena Madureira', 'Tarauacá'],
    'AP': ['Macapá', 'Santana', 'Laranjal do Jari', 'Oiapoque'],
    'AM': ['Manaus', 'Parintins', 'Itacoatiara', 'Manacapuru'],
    'RO': ['Porto Velho', 'Ji-Paraná', 'Ariquemes', 'Vilhena'],
    'RR': ['Boa Vista', 'Rorainópolis', 'Caracaraí', 'Alto Alegre']
  }
};

export const getStates = (): string[] => {
  const cached = memoryCache.get<string[]>(CACHE_KEYS.STATES);
  if (cached) return cached;
  const states = STATES_CITIES_DATA.states;
  memoryCache.set(CACHE_KEYS.STATES, states, 60 * 60 * 1000);
  return states;
};

export const getCitiesByState = (state: string): string[] => {
  if (!state) return [];
  const cacheKey = CACHE_KEYS.CITIES(state);
  const cached = memoryCache.get<string[]>(cacheKey);
  if (cached) return cached;
  const cities = STATES_CITIES_DATA.cities[state] || [];
  memoryCache.set(cacheKey, cities, 60 * 60 * 1000);
  return cities;
};

export const getAllStatesAndCities = (): StatesCitiesData => {
  const cached = memoryCache.get<StatesCitiesData>(CACHE_KEYS.ALL_DATA);
  if (cached) return cached;
  memoryCache.set(CACHE_KEYS.ALL_DATA, STATES_CITIES_DATA, 60 * 60 * 1000);
  return STATES_CITIES_DATA;
};