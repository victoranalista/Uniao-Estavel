'use server';

import { generatePdfAction } from '@/lib/pdf-generator';
import type { ActionResult } from '@/types/declarations';

type PdfData = {
  city: string;
  state: string;
  stamp?: string;
  firstPerson: {
    name: string;
    cpf: string;
    nationality: string;
    civilStatus: string;
    birthDate: string;
    birthPlace: string;
    profession: string;
    rg: string;
    address: string;
    email: string;
    phone: string;
    fatherName: string;
    motherName: string;
    registryOffice: string;
    registryBook: string;
    registryPage: string;
    registryTerm: string;
    typeRegistry: string;
    divorceDate?: string;
    newName?: string;
  };
  secondPerson: {
    name: string;
    cpf: string;
    nationality: string;
    civilStatus: string;
    birthDate: string;
    birthPlace: string;
    profession: string;
    rg: string;
    address: string;
    email: string;
    phone: string;
    fatherName: string;
    motherName: string;
    registryOffice: string;
    registryBook: string;
    registryPage: string;
    registryTerm: string;
    typeRegistry: string;
    divorceDate?: string;
    newName?: string;
  };
  unionStartDate: string;
  propertyRegime: 'COMUNHAO_PARCIAL' | 'SEPARACAO_TOTAL' | 'PARTICIPACAO_FINAL' | 'COMUNHAO_UNIVERSAL';
  registrarName: string;
  pactDate?: string;
  pactOffice?: string;
  pactBook?: string;
  pactPage?: string;
  pactTerm?: string;
};

export const generateDeclarationPdf = async (pdfData: PdfData): Promise<ActionResult<{ pdfContent: string; filename: string }>> => {
  if (!pdfData.registrarName) {
    return { success: false, error: 'Nome do registrador é obrigatório.' };
  }
  
  const result = await generatePdfAction(pdfData);
  
  if (!result.success) {
    return { success: false, error: result.error || 'Erro ao gerar PDF' };
  }
  
  return {
    success: true,
    data: {
      pdfContent: result.pdfContent!,
      filename: result.filename!
    }
  };
};