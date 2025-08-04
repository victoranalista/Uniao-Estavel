interface IBGEState {
  id: number;
  sigla: string;
  nome: string;
}

interface IBGECity {
  id: number;
  nome: string;
}

const IBGE_BASE_URL = 'https://servicodados.ibge.gov.br/api/v1/localidades';

export const fetchStatesFromIBGE = async (): Promise<string[]> => {
  try {
    const response = await fetch(`${IBGE_BASE_URL}/estados?orderBy=nome`);
    if (!response.ok) throw new Error('Failed to fetch states');
    const states: IBGEState[] = await response.json();
    return states.map(state => state.sigla);
  } catch (error) {
    console.error('Error fetching states from IBGE:', error);
    return [
      'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO',
      'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI',
      'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
    ];
  }
};

export const fetchCitiesFromIBGE = async (stateCode: string): Promise<string[]> => {
  try {
    const response = await fetch(`${IBGE_BASE_URL}/estados/${stateCode}/municipios?orderBy=nome`);
    if (!response.ok) throw new Error('Failed to fetch cities');
    const cities: IBGECity[] = await response.json();
    return cities.map(city => city.nome);
  } catch (error) {
    console.error('Error fetching cities from IBGE:', error);
    return [];
  }
};