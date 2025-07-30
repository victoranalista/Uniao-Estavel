import { useState, useEffect } from 'react';
import { buscarCidadesPorEstado } from '@/utils/constants';

export const useFilteredCities = (selectedState?: string) => {
  const [cities, setCities] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    const loadCities = async () => {
      if (!selectedState) {
        setCities([]);
        return;
      }
      setIsLoading(true);
      const municipios = await buscarCidadesPorEstado(selectedState);
      setCities(municipios);
      setIsLoading(false);
    };
    loadCities();
  }, [selectedState]);
  
  return { cities, isLoading };
};