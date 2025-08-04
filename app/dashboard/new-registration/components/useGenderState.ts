import { useState } from 'react';
import { GenderState } from '../types';

export const useGenderState = (initialGender: 'M' | 'F' = 'M'): GenderState => {
  const [gender, setGender] = useState<'M' | 'F'>(initialGender);

  const toggleGender = () => {
    setGender(prev => prev === 'M' ? 'F' : 'M');
  };

  return { gender, toggleGender };
};