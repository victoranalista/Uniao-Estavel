export const downloadPdf = (pdfBase64: string, filename: string): void => {
  const byteCharacters = atob(pdfBase64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], { type: 'application/pdf' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

export const createFormData = (data: any): FormData => {
  const formData = new FormData();
  formData.append('date', data.date);
  formData.append('city', data.city);
  formData.append('state', data.state);
  formData.append('unionStartDate', data.unionStartDate);
  formData.append('propertyRegime', data.propertyRegime);
  formData.append('registrarName', data.registrarName);
  if (data.stamp) formData.append('stamp', data.stamp);
  if (data.pactDate) formData.append('pactDate', data.pactDate);
  if (data.pactOffice) formData.append('pactOffice', data.pactOffice);
  if (data.pactBook) formData.append('pactBook', data.pactBook);
  if (data.pactPage) formData.append('pactPage', data.pactPage);
  if (data.pactTerm) formData.append('pactTerm', data.pactTerm);
  
  Object.entries(data.firstPerson).forEach(([key, value]) => {
    if (value) {
      formData.append(`firstPerson${key.charAt(0).toUpperCase() + key.slice(1)}`, value as string);
    }
  });
  
  Object.entries(data.secondPerson).forEach(([key, value]) => {
    if (value) {
      formData.append(`secondPerson${key.charAt(0).toUpperCase() + key.slice(1)}`, value as string);
    }
  });
  
  return formData;
};