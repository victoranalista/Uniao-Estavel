import { useState, useEffect } from 'react';
import { buscarEstados } from '@/utils/constants';

export const useStates = () => {
  const [states, setStates] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const loadStates = async () => {
      setIsLoading(true);
      const estadosList = await buscarEstados();
      setStates(estadosList);
      setIsLoading(false);
    };
    loadStates();
  }, []);
  
  return { states, isLoading };
};