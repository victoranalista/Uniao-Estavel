'use server';
import { z } from 'zod';
import { validatetaxpayerId } from '@/utils/validators';
import { getNextBookNumbers } from '@/utils/bookControl';
import { OFICIAIS_REGISTRADORES } from '@/utils/constants';
import { PDFDocument, rgb, StandardFonts, PDFImage, PDFPage } from 'pdf-lib';
import fs from 'fs/promises';
import path from 'path';

const personSchema = z.object({
  name: z.string(),
  taxpayerId: z.string().refine(validatetaxpayerId, 'CPF inválido'),
  nationality: z.string(),
  civilStatus: z.string(),
  birthDate: z.string(),
  birthPlace: z.string(),
  profession: z.string(),
  rg: z.string(),
  address: z.string(),
  email: z.email().optional(),
  phone: z.string(),
  fatherName: z.string(),
  motherName: z.string(),
  registryOffice: z.string(),
  registryBook: z.string(),
  registryPage: z.string(),
  registryTerm: z.string(),
  typeRegistry: z.string(),
  divorceDate: z.string().optional(),
  newName: z.string().optional(),
});

const declarationSchema = z.object({
  city: z.string(),
  state: z.string(),
  stamp: z.string().optional(),
  firstPerson: personSchema,
  secondPerson: personSchema,
  unionStartDate: z.string(),
  propertyRegime: z.enum(['COMUNHAO_PARCIAL', 'SEPARACAO_TOTAL', 'PARTICIPACAO_FINAL', 'COMUNHAO_UNIVERSAL']),
  registrarName: z.string(),
  pactDate: z.string().optional(),
  pactOffice: z.string().optional(),
  pactBook: z.string().optional(),
  pactPage: z.string().optional(),
  pactTerm: z.string().optional(),
  averbations: z.array(z.object({
    description: z.string(),
    date: z.date(),
    updatedBy: z.string()
  })).optional(),
});

type DeclarationData = z.infer<typeof declarationSchema>;

const getDefaultSeal = () => 'N/A';

const getCurrentDate = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatDate = (date: string | Date) => {
  const dateObj = date instanceof Date ? date : new Date(date);
  return dateObj.toLocaleDateString('pt-BR');
};

const formatDateExtended = (date: string) => {
  const dateObj = new Date(date);
  const day = dateObj.getDate();
  const month = dateObj.toLocaleDateString('pt-BR', { month: 'long' });
  const year = dateObj.getFullYear();
  const dayWords: Record<number, string> = {
    1: 'primeiro', 2: 'dois', 3: 'três', 4: 'quatro', 5: 'cinco',
    6: 'seis', 7: 'sete', 8: 'oito', 9: 'nove', 10: 'dez',
    11: 'onze', 12: 'doze', 13: 'treze', 14: 'quatorze', 15: 'quinze',
    16: 'dezesseis', 17: 'dezessete', 18: 'dezoito', 19: 'dezenove', 20: 'vinte',
    21: 'vinte e um', 22: 'vinte e dois', 23: 'vinte e três', 24: 'vinte e quatro',
    25: 'vinte e cinco', 26: 'vinte e seis', 27: 'vinte e sete', 28: 'vinte e oito',
    29: 'vinte e nove', 30: 'trinta', 31: 'trinta e um'
  };
  const yearWords = year === 2025 ? 'dois mil e vinte e cinco' : year.toString();
  return `${dayWords[day]} dias do mês de ${month} do ano de ${yearWords} (**${formatDate(dateObj)}**)`;
};

const getPropertyRegimeText = (regime: string) => {
  const regimes: Record<string, string> = {
    COMUNHAO_PARCIAL: '**COMUNHÃO PARCIAL DE BENS**, nos termos do artigo 1.725 do Código Civil, de modo que todos os bens adquiridos onerosamente durante a constância da união pertencerão a ambos em partes iguais, cabendo sua administração indistintamente a ambos os companheiros',
    SEPARACAO_TOTAL: '**SEPARAÇÃO TOTAL DE BENS**, de forma que os bens não se comunicam, sendo mantidos os patrimônios individuais, separados e independentes',
    PARTICIPACAO_FINAL: '**PARTICIPAÇÃO FINAL NOS AQUESTOS**, de forma que cada parte conserva seu próprio patrimônio, sendo que, após a dissolução da união, cada um tem direito à metade dos bens adquiridos onerosamente durante a convivência',
    COMUNHAO_UNIVERSAL: '**COMUNHÃO UNIVERSAL DE BENS**, de forma que todos bens, adquiridos antes ou durante a união, onerosos ou gratuitos, se comunicam integralmente'
  };
  return regimes[regime];
};

const parseFormattedText = (text: string) => {
  const parts: Array<{text: string, bold: boolean}> = [];
  let currentIndex = 0;
  while (currentIndex < text.length) {
    const boldStart = text.indexOf('**', currentIndex);
    if (boldStart === -1) {
      if (currentIndex < text.length) parts.push({text: text.substring(currentIndex), bold: false});
      break;
    }
    if (boldStart > currentIndex) parts.push({text: text.substring(currentIndex, boldStart), bold: false});
    const boldEnd = text.indexOf('**', boldStart + 2);
    if (boldEnd === -1) {
      parts.push({text: text.substring(boldStart + 2), bold: true});
      break;
    }
    parts.push({text: text.substring(boldStart + 2, boldEnd), bold: true});
    currentIndex = boldEnd + 2;
  }
  return parts;
};

const wrapFormattedText = (formattedParts: Array<{text: string, bold: boolean}>, maxWidth: number, fontSize: number, normalFont: any, boldFont: any) => {
  const lines: Array<Array<{text: string, bold: boolean}>> = [];
  let currentLine: Array<{text: string, bold: boolean}> = [];
  let currentLineWidth = 0;
  for (const part of formattedParts) {
    const words = part.text.split(' ');
    const font = part.bold ? boldFont : normalFont;
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const wordWidth = font.widthOfTextAtSize(word, fontSize);
      const spaceWidth = i > 0 ? font.widthOfTextAtSize(' ', fontSize) : 0;
      if (currentLineWidth + spaceWidth + wordWidth <= maxWidth) {
        if (i > 0 && currentLine.length > 0) currentLine.push({text: ' ', bold: part.bold});
        currentLine.push({text: word, bold: part.bold});
        currentLineWidth += spaceWidth + wordWidth;
      } else {
        if (currentLine.length > 0) {
          lines.push(currentLine);
          currentLine = [];
          currentLineWidth = 0;
        }
        currentLine.push({text: word, bold: part.bold});
        currentLineWidth = wordWidth;
      }
    }
  }
  if (currentLine.length > 0) lines.push(currentLine);
  return lines;
};

const buildDeclarationText = (declaration: DeclarationData) => {
  const currentDate = getCurrentDate();
  const registrarFunction = OFICIAIS_REGISTRADORES[declaration.registrarName] || 'Oficial Auxiliar';
  const averbations = declaration.averbations?.map(av => `- ${av.description} em ${formatDate(av.date)} (por ${av.updatedBy})`).join('\n') || '';
  
  return `Aos ${formatDateExtended(currentDate)}, na cidade de Brasília, Distrito Federal, por videoconferência, perante mim, ${declaration.registrarName}, ${registrarFunction} do **Cartório Colorado - 8º Ofício de Registro Civil, Títulos e Documentos e Pessoas Jurídicas do Distrito Federal**, compareceram como **DECLARANTES:** 1. **${declaration.firstPerson.name.toUpperCase()}**, ${declaration.firstPerson.nationality}, ${declaration.firstPerson.civilStatus}, nascido em ${formatDate(declaration.firstPerson.birthDate)}, natural de ${declaration.firstPerson.birthPlace}, profissionalmente identificado como ${declaration.firstPerson.profession}, portador da Carteira de Identidade nº ${declaration.firstPerson.rg}, inscrita no Cadastro de Pessoas Físicas (CPF) sob o nº ${declaration.firstPerson.taxpayerId}, residente e domiciliado em ${declaration.firstPerson.address}, endereço eletrônico ${declaration.firstPerson.email}, telefone ${declaration.firstPerson.phone}, filho de ${declaration.firstPerson.fatherName} e ${declaration.firstPerson.motherName} e 2. **${declaration.secondPerson.name.toUpperCase()}**, ${declaration.secondPerson.nationality}, ${declaration.secondPerson.civilStatus}, nascida em ${formatDate(declaration.secondPerson.birthDate)}, natural de ${declaration.secondPerson.birthPlace}, profissionalmente identificado como ${declaration.secondPerson.profession}, portadora da Carteira de Identidade nº ${declaration.secondPerson.rg}, inscrita no Cadastro de Pessoas Físicas (CPF) sob o nº ${declaration.secondPerson.taxpayerId}, residente e domiciliado em ${declaration.secondPerson.address}, endereço eletrônico ${declaration.secondPerson.email}, telefone ${declaration.secondPerson.phone}, filha de ${declaration.secondPerson.fatherName} e ${declaration.secondPerson.motherName}. **CAPACIDADE.** Os declarantes, **maiores, capazes e juridicamente aptos**, foram reconhecidos por mim, bem como pelo IdRC (Sistema de Autenticação Eletrônica do Registro Civil), em consonância com o art. 228-B, caput e parágrafo único, do provimento CNJ 149/2023. Procedi à verificação da **capacidade de fato e da livre manifestação de vontade dos declarantes**, não constatando qualquer indício de coação, erro, dolo ou qualquer outra circunstância que pudesse comprometer a legalidade deste ato. **DECLARAÇÃO.** Dessa forma, os declarantes **manifestam e fazem constar** neste instrumento a existência de sua **união estável**, nos termos do **artigo 1.723 do Código Civil Brasileiro**, declarando que: a) convivem de **forma pública, contínua, duradoura e com o objetivo de constituição de família** desde o dia **${formatDate(declaration.unionStartDate)}**, sendo sua relação pautada na reciprocidade, respeito mútuo, lealdade e assistência recíproca; b) optam, para reger suas relações patrimoniais, pelo regime da ${getPropertyRegimeText(declaration.propertyRegime)}; c) declaram, sob as penas da lei, **não haver qualquer impedimento para a formalização desta união**, conforme previsto no artigo 1.521 do Código Civil; d) foram informadas quanto às disposições do **artigo 1.727 do Código Civil**, que diferencia a união estável do concubinato, bem como sobre a possibilidade facultativa de registro deste termo no Livro "E" do 1º Ofício de Registro Civil do domicílio do casal, para fins de publicidade e efeitos erga omnes; e) **não há termo declaratório de união estável anterior** em nome de qualquer das declarantes; **CRC.** Procedi à consulta na Central de Informações do Registro Civil das Pessoas Naturais (CRC), não sendo localizado qualquer termo declaratório de união estável pré-existente em nome dos declarantes. **LAVRATURA.** Diante da manifestação expressa de vontade dos companheiros e por se acharem justos e acordados, solicitaram-me a lavratura do presente termo, que, após lido, conferido e considerado conforme, assinam. Este instrumento é lavrado com fundamento nos **artigos 1.723 a 1.727 do Código Civil Brasileiro, nos artigos 537 a 546 do Provimento nº 149 do Conselho Nacional de Justiça (CNJ) e no §3º do artigo 515-L do mesmo provimento**, servindo como **prova jurídica plena da relação aqui declarada**, e devidamente arquivado na pasta eletrônica referente ao Termo de União Estável **nº {TERMO}** desta Serventia. Selo Digital: {SELO}. Para consultar o selo, acesse: tjdft.jus.br. E, para que produza os efeitos legais cabíveis, firmam o presente termo, o qual tem valor jurídico de certidão, conforme art. 538, §1º do Provimento CNJ 149/2023. Brasília/DF, **${formatDate(currentDate)}**${averbations ? `\n\n**AVERBAÇÕES:**\n${averbations}` : ''}`;
};

const loadBackgroundImage = async (pdfDoc: PDFDocument) => {
  try {
    const imagePath = path.join(process.cwd(), 'public', 'fundo.png');
    const imageBytes = await fs.readFile(imagePath);
    return await pdfDoc.embedPng(imageBytes);
  } catch {
    return null;
  }
};

const createPageWithBackground = (pdfDoc: PDFDocument, backgroundImage: PDFImage | null) => {
  const page = pdfDoc.addPage([595.28, 841.89]);
  if (backgroundImage) {
    const { width: pageWidth, height: pageHeight } = page.getSize();
    page.drawImage(backgroundImage, { x: 0, y: 0, width: pageWidth, height: pageHeight });
  }
  return page;
};

const drawHeader = (page: PDFPage, book: string, term: string, helveticaBold: any, showTitle = true) => {
  const { width: pageWidth } = page.getSize();
  const margin = 57;
  let currentY = page.getSize().height - 80;
  
  page.drawText(`Livro: ${book}`, { x: margin, y: currentY, size: 11, font: helveticaBold, color: rgb(0, 0, 0) });
  page.drawText(`Termo: ${term}`, { x: pageWidth - margin - 80, y: currentY, size: 11, font: helveticaBold, color: rgb(0, 0, 0) });
  
  if (showTitle) {
    currentY -= 30;
    const title = 'TERMO DECLARATÓRIO DE UNIÃO ESTÁVEL';
    const titleWidth = helveticaBold.widthOfTextAtSize(title, 14);
    page.drawText(title, { x: (pageWidth - titleWidth) / 2, y: currentY, size: 14, font: helveticaBold, color: rgb(0, 0, 0) });
    return currentY - 25;
  }
  
  return currentY - 50;
};

const drawTextLine = (page: PDFPage, line: Array<{text: string, bold: boolean}>, x: number, y: number, helveticaFont: any, helveticaBold: any) => {
  let currentX = x;
  for (const part of line) {
    const font = part.bold ? helveticaBold : helveticaFont;
    page.drawText(part.text, { x: currentX, y, size: 11, font, color: rgb(0, 0, 0) });
    currentX += font.widthOfTextAtSize(part.text, 11);
  }
};

const drawJustifiedText = (page: PDFPage, line: Array<{text: string, bold: boolean}>, margin: number, y: number, maxWidth: number, helveticaFont: any, helveticaBold: any) => {
  let totalTextWidth = 0;
  let spaceCount = 0;
  
  for (const part of line) {
    const font = part.bold ? helveticaBold : helveticaFont;
    totalTextWidth += font.widthOfTextAtSize(part.text, 11);
    if (part.text === ' ') spaceCount++;
  }
  
  const remainingSpace = maxWidth - totalTextWidth;
  const extraSpacePerGap = spaceCount > 0 ? remainingSpace / spaceCount : 0;
  
  let x = margin;
  for (const part of line) {
    const font = part.bold ? helveticaBold : helveticaFont;
    page.drawText(part.text, { x, y, size: 11, font, color: rgb(0, 0, 0) });
    const partWidth = font.widthOfTextAtSize(part.text, 11);
    x += partWidth;
    if (part.text === ' ') x += extraSpacePerGap;
  }
};

const drawSignatures = (page: PDFPage, declaration: DeclarationData, registrarFunction: string, helveticaFont: any, helveticaBold: any, startY: number) => {
  const { width: pageWidth } = page.getSize();
  let currentY = startY - 30;
  
  const firstPersonName = declaration.firstPerson.name.toUpperCase();
  const firstPersonWidth = helveticaBold.widthOfTextAtSize(firstPersonName, 11);
  page.drawText(firstPersonName, { x: (pageWidth - firstPersonWidth) / 2, y: currentY, size: 11, font: helveticaBold, color: rgb(0, 0, 0) });
  
  currentY -= 60;
  
  const secondPersonName = declaration.secondPerson.name.toUpperCase();
  const secondPersonWidth = helveticaBold.widthOfTextAtSize(secondPersonName, 11);
  page.drawText(secondPersonName, { x: (pageWidth - secondPersonWidth) / 2, y: currentY, size: 11, font: helveticaBold, color: rgb(0, 0, 0) });
  
  currentY -= 60;
  
  const registrarNameText = declaration.registrarName.toUpperCase();
  const registrarNameWidth = helveticaBold.widthOfTextAtSize(registrarNameText, 11);
  page.drawText(registrarNameText, { x: (pageWidth - registrarNameWidth) / 2, y: currentY, size: 11, font: helveticaBold, color: rgb(0, 0, 0) });
  
  currentY -= 15;
  
  const registrarFunctionWidth = helveticaFont.widthOfTextAtSize(registrarFunction, 10);
  page.drawText(registrarFunction, { x: (pageWidth - registrarFunctionWidth) / 2, y: currentY, size: 10, font: helveticaFont, color: rgb(0, 0, 0) });
};

const calculateLineWidth = (line: Array<{text: string, bold: boolean}>, fonts: { helveticaFont: any; helveticaBold: any }) => {
  return line.reduce((width, part) => {
    const font = part.bold ? fonts.helveticaBold : fonts.helveticaFont;
    return width + font.widthOfTextAtSize(part.text, 11);
  }, 0);
};

const drawEndLineDashes = (page: PDFPage, line: Array<{text: string, bold: boolean}>, currentY: number, config: { margin: number; pageWidth: number }, fonts: { helveticaFont: any; helveticaBold: any }) => {
  const lineWidth = calculateLineWidth(line, fonts);
  const dashWidth = fonts.helveticaFont.widthOfTextAtSize('-', 11);
  const maxWidth = config.pageWidth - config.margin * 2;
  const dashesNeeded = Math.floor((maxWidth - lineWidth) / dashWidth);
  if (dashesNeeded > 0) {
    const dashes = '-'.repeat(dashesNeeded);
    page.drawText(dashes, { x: config.margin + lineWidth, y: currentY, size: 11, font: fonts.helveticaFont, color: rgb(0, 0, 0) });
  }
};

const drawSingleLine = (page: PDFPage, line: Array<{text: string, bold: boolean}>, currentY: number, config: { margin: number; pageWidth: number; lineHeight: number }, fonts: { helveticaFont: any; helveticaBold: any }, isLastLine: boolean) => {
  if (line.length > 1 && !isLastLine) {
    drawJustifiedText(page, line, config.margin, currentY, config.pageWidth - config.margin * 2, fonts.helveticaFont, fonts.helveticaBold);
  } else {
    drawTextLine(page, line, config.margin, currentY, fonts.helveticaFont, fonts.helveticaBold);
    if (isLastLine) drawEndLineDashes(page, line, currentY, config, fonts);
  }
  return currentY - config.lineHeight;
};

const shouldCreateNewPage = (currentY: number, config: { lineHeight: number; marginBottom: number; signatureAreaHeight: number }) => {
  return currentY - config.lineHeight < config.marginBottom + config.signatureAreaHeight;
};

const drawTextContent = (page: PDFPage, textLines: Array<Array<{text: string, bold: boolean}>>, config: { pageWidth: number; margin: number; lineHeight: number; marginBottom: number; signatureAreaHeight: number }, fonts: { helveticaFont: any; helveticaBold: any }, pdfDoc: PDFDocument, backgroundImage: PDFImage | null, book: string, term: string) => {
  let currentY = page.getSize().height - 155;
  let currentPage = page;
  for (let i = 0; i < textLines.length; i++) {
    const line = textLines[i];
    const isLastLine = i === textLines.length - 1;
    if (shouldCreateNewPage(currentY, config)) {
      currentPage = createPageWithBackground(pdfDoc, backgroundImage);
      currentY = drawHeader(currentPage, book, term, fonts.helveticaBold, false);
    }
    currentY = drawSingleLine(currentPage, line, currentY, config, fonts, isLastLine);
  }
  return { finalPage: currentPage, finalY: currentY };
};

const buildCompletePdf = async (pdfDoc: PDFDocument, fonts: { helveticaFont: any; helveticaBold: any }, backgroundImage: PDFImage | null, validatedData: DeclarationData, config: { pageWidth: number; pageHeight: number; margin: number; lineHeight: number; signatureAreaHeight: number; marginBottom: number }, book: string, term: number, finalSeal: string, registrarFunction: string) => {
  const maxWidth = config.pageWidth - config.margin * 2;
  let currentPage = createPageWithBackground(pdfDoc, backgroundImage);
  let currentY = drawHeader(currentPage, book, term.toString(), fonts.helveticaBold);
  const declarationText = buildDeclarationText(validatedData).replace('{TERMO}', term.toString()).replace('{SELO}', finalSeal);
  const formattedParts = parseFormattedText(declarationText);
  const textLines = wrapFormattedText(formattedParts, maxWidth, 11, fonts.helveticaFont, fonts.helveticaBold);
  const { finalPage, finalY } = drawTextContent(currentPage, textLines, config, fonts, pdfDoc, backgroundImage, book, term.toString());
  drawSignatures(finalPage, validatedData, registrarFunction, fonts.helveticaFont, fonts.helveticaBold, finalY);
  return await finalizePdf(pdfDoc, book, term);
};

const validatePdfData = (data: unknown) => {
  const result = declarationSchema.safeParse(data);
  if (!result.success) throw new Error(`Dados inválidos: ${result.error.message}`);
  return result.data;
};

const getFinalSeal = (data: DeclarationData) => data.stamp || getDefaultSeal();

const getRegistrarFunction = (registrarName: string) => OFICIAIS_REGISTRADORES[registrarName] || 'Oficial Auxiliar';

const createPdfDocument = async () => await PDFDocument.create();

const embedFonts = async (pdfDoc: PDFDocument) => {
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  return { helveticaFont, helveticaBold };
};

const createPdfConfig = () => ({
  pageWidth: 595.28,
  pageHeight: 841.89,
  margin: 57,
  lineHeight: 16,
  signatureAreaHeight: 80,
  marginBottom: 50
});

const finalizePdf = async (pdfDoc: PDFDocument, book: string, term: number) => {
  const pdfBytes = await pdfDoc.save();
  const pdfBase64 = Buffer.from(pdfBytes).toString('base64');
  return { 
    success: true, 
    pdfContent: pdfBase64,
    filename: `termo-uniao-estavel-${book}-${term}.pdf`,
    contentType: 'application/pdf'
  };
};

export const generatePdfAction = async (declarationData: unknown) => {
  try {
    const validatedData = validatePdfData(declarationData);
    const { book, term } = await getNextBookNumbers();
    const finalSeal = getFinalSeal(validatedData);
    const registrarFunction = getRegistrarFunction(validatedData.registrarName);
    const pdfDoc = await createPdfDocument();
    const fonts = await embedFonts(pdfDoc);
    const backgroundImage = await loadBackgroundImage(pdfDoc);
    const pdfConfig = createPdfConfig();
    return await buildCompletePdf(pdfDoc, fonts, backgroundImage, validatedData, pdfConfig, book, Number(term), finalSeal, registrarFunction);
  } catch (error) {
    console.error('PDF Generation Error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Erro ao gerar PDF' };
  }
};

export const generateSecondCopyPdfAction = async (declarationData: unknown, existingBook: string, existingTerm: string) => {
  try {
    const validatedData = validatePdfData(declarationData);
    const finalSeal = getFinalSeal(validatedData);
    const registrarFunction = getRegistrarFunction(validatedData.registrarName);
    const pdfDoc = await createPdfDocument();
    const fonts = await embedFonts(pdfDoc);
    const backgroundImage = await loadBackgroundImage(pdfDoc);
    const pdfConfig = createPdfConfig();
    return await buildCompletePdf(pdfDoc, fonts, backgroundImage, validatedData, pdfConfig, existingBook, Number(existingTerm), finalSeal, registrarFunction);
  } catch (error) {
    console.error('Second Copy PDF Generation Error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Erro ao gerar segunda via do PDF' };
  }
};