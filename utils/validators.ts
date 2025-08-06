const calculateFirstDigit = (taxpayerId: string): number => {
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(taxpayerId.charAt(i)) * (10 - i);
  }
  const remainder = (sum * 10) % 11;
  return remainder >= 10 ? 0 : remainder;
};

const calculateSecondDigit = (taxpayerId: string): number => {
  let sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(taxpayerId.charAt(i)) * (11 - i);
  }
  const remainder = (sum * 10) % 11;
  return remainder >= 10 ? 0 : remainder;
};

export function validatetaxpayerId(taxpayerId: string): boolean {
  const cleanTaxId = taxpayerId.replace(/\D/g, '');
  if (cleanTaxId.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cleanTaxId)) return false;
  const firstDigit = calculateFirstDigit(cleanTaxId);
  if (firstDigit !== parseInt(cleanTaxId.charAt(9))) return false;
  const secondDigit = calculateSecondDigit(cleanTaxId);
  return secondDigit === parseInt(cleanTaxId.charAt(10));
}
