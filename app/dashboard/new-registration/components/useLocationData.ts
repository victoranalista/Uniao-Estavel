import { useState, useEffect } from 'react';
import {
  fetchStatesFromIBGE,
  fetchCitiesFromIBGE
} from '../utils/ibge-service';

export const useStates = () => {
  const [states, setStates] = useState<string[]>([]);
  const [isStatesLoading, setIsStatesLoading] = useState(true);
  useEffect(() => {
    const loadStates = async () => {
      setIsStatesLoading(true);
      const statesData = await fetchStatesFromIBGE();
      setStates(statesData);
      setIsStatesLoading(false);
    };
    loadStates();
  }, []);
  return { states, isStatesLoading };
};

export const useFilteredCities = (selectedState: string) => {
  const [cities, setCities] = useState<string[]>([]);
  const [isCitiesLoading, setIsCitiesLoading] = useState(false);
  useEffect(() => {
    if (!selectedState) {
      setCities([]);
      return;
    }
    const loadCities = async () => {
      setIsCitiesLoading(true);
      const citiesData = await fetchCitiesFromIBGE(selectedState);
      setCities(citiesData);
      setIsCitiesLoading(false);
    };
    loadCities();
  }, [selectedState]);
  return { cities, isCitiesLoading };
};
