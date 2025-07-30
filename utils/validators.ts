export function validatetaxpayerId(taxpayerId: string): boolean {
  taxpayerId = taxpayerId.replace(/[^\d]/g, '');

  if (taxpayerId.length !== 11) return false;

  if (/^(\d)\1+$/.test(taxpayerId)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(taxpayerId.charAt(i)) * (10 - i);
  }

  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(taxpayerId.charAt(9))) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(taxpayerId.charAt(i)) * (11 - i);
  }

  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(taxpayerId.charAt(10))) return false;

  return true;
}