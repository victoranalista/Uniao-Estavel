"use client";

import { useState, useEffect } from 'react';
import { getCitiesByState } from '@/app/dashboard/services/location-service';

interface UseFilteredCitiesReturn {
  cities: string[];
  isLoading: boolean;
}

export const useFilteredCities = (state: string): UseFilteredCitiesReturn => {
  const [cities, setCities] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!state) {
      setCities([]);
      return;
    }
    setIsLoading(true);
    try {
      const citiesData = getCitiesByState(state);
      setCities(citiesData);
    } catch (error) {
      console.error('Error loading cities:', error);
      setCities([]);
    } finally {
      setIsLoading(false);
    }
  }, [state]);

  return { cities, isLoading };
};

import { getStates } from '@/app/dashboard/services/location-service';

interface UseStatesReturn {
  states: string[];
  isLoading: boolean;
}

export const useStates = (): UseStatesReturn => {
  const [states, setStates] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStates = () => {
      try {
        const statesData = getStates();
        setStates(statesData);
      } catch (error) {
        console.error('Error loading states:', error);
        setStates([]);
      } finally {
        setIsLoading(false);
      }
    };
    loadStates();
  }, []);

  return { states, isLoading };
};