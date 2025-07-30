function isValidtaxpayerIdOrCnpj(input: string): boolean {
  const cleanInput = input.replace(/[^\d]/g, '');
  if (cleanInput.length === 11) return validatetaxpayerId(cleanInput);
  else if (cleanInput.length === 14) return validateCnpj(cleanInput);
  return false;
}

function validatetaxpayerId(taxpayerId: string): boolean {
  if (/^(\d)\1+$/.test(taxpayerId)) return false;
  let sum = 0;
  let remainder;
  for (let i = 1; i <= 9; i++) sum += parseInt(taxpayerId[i - 1]) * (11 - i);
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(taxpayerId[9])) return false;
  sum = 0;
  for (let i = 1; i <= 10; i++) sum += parseInt(taxpayerId[i - 1]) * (12 - i);
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  return remainder === parseInt(taxpayerId[10]);
}

function validateCnpj(cnpj: string): boolean {
  if (/^(\d)\1+$/.test(cnpj)) return false;
  let size = cnpj.length - 2;
  let numbers = cnpj.substring(0, size);
  let digits = cnpj.substring(size);
  let sum = 0;
  let pos = size - 7;
  for (let i = size; i >= 1; i--) sum += parseInt(numbers[size - i]) * pos--;
  if (pos < 2) pos = 9;
  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits[0])) return false;
  size += 1;
  numbers = cnpj.substring(0, size);
  sum = 0;
  pos = size - 7;
  for (let i = size; i >= 1; i--) sum += parseInt(numbers[size - i]) * pos--;
  if (pos < 2) pos = 9;
  result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  return result === parseInt(digits[1]);
}

export { isValidtaxpayerIdOrCnpj, validatetaxpayerId, validateCnpj };
