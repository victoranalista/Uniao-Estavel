'use server';

import { z } from 'zod';
import { validatetaxpayerId } from '@/utils/validators';
import { getNextBookNumbers } from '@/utils/bookControl';
import { OFICIAIS_REGISTRADORES } from '@/utils/constants';
import { PDFDocument, rgb, StandardFonts, PDFImage } from 'pdf-lib';
import fs from 'fs';
import path from 'path';

const declarationSchema = z.object({
  city: z.string(),
  state: z.string(),
  stamp: z.string().optional(),
  firstPerson: z.object({
    name: z.string(),
    cpf: z.string().refine(validatetaxpayerId),
    nationality: z.string(),
    civilStatus: z.string(),
    birthDate: z.string(),
    birthPlace: z.string(),
    profession: z.string(),
    rg: z.string(),
    address: z.string(),
    email: z.email(),
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
  }),
  secondPerson: z.object({
    name: z.string(),
    cpf: z.string().refine(validatetaxpayerId),
    nationality: z.string(),
    civilStatus: z.string(),
    birthDate: z.string(),
    birthPlace: z.string(),
    profession: z.string(),
    rg: z.string(),
    address: z.string(),
    email: z.email(),
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
  }),
  unionStartDate: z.string(),
  propertyRegime: z.enum(['COMUNHAO_PARCIAL', 'SEPARACAO_TOTAL', 'PARTICIPACAO_FINAL', 'COMUNHAO_UNIVERSAL']),
  registrarName: z.string(),
  pactDate: z.string().optional(),
  pactOffice: z.string().optional(),
  pactBook: z.string().optional(),
  pactPage: z.string().optional(),
  pactTerm: z.string().optional(),
});

const getDefaultSeal = (): string => 'N/A';

const getCurrentDate = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatDate = (date: string): string => new Date(date).toLocaleDateString('pt-BR');

const formatDateExtended = (date: string): string => {
  const dateObj = new Date(date);
  const day = dateObj.getDate();
  const month = dateObj.toLocaleDateString('pt-BR', { month: 'long' });
  const year = dateObj.getFullYear();
  const dayWords = {
    1: 'primeiro', 2: 'dois', 3: 'três', 4: 'quatro', 5: 'cinco', 6: 'seis', 7: 'sete', 8: 'oito', 9: 'nove', 10: 'dez',
    11: 'onze', 12: 'doze', 13: 'treze', 14: 'quatorze', 15: 'quinze', 16: 'dezesseis', 17: 'dezessete', 18: 'dezoito', 19: 'dezenove', 20: 'vinte',
    21: 'vinte e um', 22: 'vinte e dois', 23: 'vinte e três', 24: 'vinte e quatro', 25: 'vinte e cinco', 26: 'vinte e seis', 27: 'vinte e sete', 28: 'vinte e oito', 29: 'vinte e nove', 30: 'trinta', 31: 'trinta e um'
  };
  const yearWords = year === 2025 ? 'dois mil e vinte e cinco' : year.toString();
  return `${dayWords[day as keyof typeof dayWords]} dias do mês de ${month} do ano de ${yearWords} (**${dateObj.toLocaleDateString('pt-BR')}**)`;
};

const getPropertyRegimeText = (regime: string): string => {
  const regimes = {
    COMUNHAO_PARCIAL: '**COMUNHÃO PARCIAL DE BENS**, nos termos do artigo 1.725 do Código Civil, de modo que todos os bens adquiridos onerosamente durante a constância da união pertencerão a ambos em partes iguais, cabendo sua administração indistintamente a ambos os companheiros',
    SEPARACAO_TOTAL: '**SEPARAÇÃO TOTAL DE BENS**, de forma que os bens não se comunicam, sendo mantidos os patrimônios individuais, separados e independentes',
    PARTICIPACAO_FINAL: '**PARTICIPAÇÃO FINAL NOS AQUESTOS**, de forma que cada parte conserva seu próprio patrimônio, sendo que, após a dissolução da união, cada um tem direito à metade dos bens adquiridos onerosamente durante a convivência',
    COMUNHAO_UNIVERSAL: '**COMUNHÃO UNIVERSAL DE BENS**, de forma que todos bens, adquiridos antes ou durante a união, onerosos ou gratuitos, se comunicam integralmente'
  };
  return regimes[regime as keyof typeof regimes];
};

const parseFormattedText = (text: string): Array<{text: string, bold: boolean}> => {
  const parts: Array<{text: string, bold: boolean}> = [];
  let currentIndex = 0;
  while (currentIndex < text.length) {
    const boldStart = text.indexOf('**', currentIndex);
    if (boldStart === -1) {
      if (currentIndex < text.length) {
        parts.push({text: text.substring(currentIndex), bold: false});
      }
      break;
    }
    if (boldStart > currentIndex) {
      parts.push({text: text.substring(currentIndex, boldStart), bold: false});
    }
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

const wrapFormattedText = (formattedParts: Array<{text: string, bold: boolean}>, maxWidth: number, fontSize: number, normalFont: any, boldFont: any): Array<Array<{text: string, bold: boolean}>> => {
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
        if (i > 0 && currentLine.length > 0) {
          currentLine.push({text: ' ', bold: part.bold});
        }
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
  if (currentLine.length > 0) {
    lines.push(currentLine);
  }
  return lines;
};

const generateDeclarationText = (declaration: z.infer<typeof declarationSchema>): string => {
  const currentDate = getCurrentDate();
  const registrarFunction = OFICIAIS_REGISTRADORES[declaration.registrarName] || 'Oficial Auxiliar';
  return `Aos ${formatDateExtended(currentDate)}, na cidade de Brasília, Distrito Federal, por videoconferência, perante mim, ${declaration.registrarName}, ${registrarFunction} do **Cartório Colorado - 8º Ofício de Registro Civil, Títulos e Documentos e Pessoas Jurídicas do Distrito Federal**, compareceram como **DECLARANTES:** 1. **${declaration.firstPerson.name.toUpperCase()}**, ${declaration.firstPerson.nationality}, ${declaration.firstPerson.civilStatus}, nascido em ${formatDate(declaration.firstPerson.birthDate)}, natural de ${declaration.firstPerson.birthPlace}, profissionalmente identificado como ${declaration.firstPerson.profession}, portador da Carteira de Identidade nº ${declaration.firstPerson.rg}, inscrita no Cadastro de Pessoas Físicas (CPF) sob o nº ${declaration.firstPerson.cpf}, residente e domiciliado em ${declaration.firstPerson.address}, endereço eletrônico ${declaration.firstPerson.email}, telefone ${declaration.firstPerson.phone}, filho de ${declaration.firstPerson.fatherName} e ${declaration.firstPerson.motherName} e 2. **${declaration.secondPerson.name.toUpperCase()}**, ${declaration.secondPerson.nationality}, ${declaration.secondPerson.civilStatus}, nascida em ${formatDate(declaration.secondPerson.birthDate)}, natural de ${declaration.secondPerson.birthPlace}, profissionalmente identificado como ${declaration.secondPerson.profession}, portadora da Carteira de Identidade nº ${declaration.secondPerson.rg}, inscrita no Cadastro de Pessoas Físicas (CPF) sob o nº ${declaration.secondPerson.cpf}, residente e domiciliado em ${declaration.secondPerson.address}, endereço eletrônico ${declaration.secondPerson.email}, telefone ${declaration.secondPerson.phone}, filha de ${declaration.secondPerson.fatherName} e ${declaration.secondPerson.motherName}. **CAPACIDADE.** Os declarantes, **maiores, capazes e juridicamente aptos**, foram reconhecidos por mim, bem como pelo IdRC (Sistema de Autenticação Eletrônica do Registro Civil), em consonância com o art. 228-B, caput e parágrafo único, do provimento CNJ 149/2023. Procedi à verificação da **capacidade de fato e da livre manifestação de vontade dos declarantes**, não constatando qualquer indício de coação, erro, dolo ou qualquer outra circunstância que pudesse comprometer a legalidade deste ato. **DECLARAÇÃO.** Dessa forma, os declarantes **manifestam e fazem constar** neste instrumento a existência de sua **união estável**, nos termos do **artigo 1.723 do Código Civil Brasileiro**, declarando que: a) convivem de **forma pública, contínua, duradoura e com o objetivo de constituição de família** desde o dia **${formatDate(declaration.unionStartDate)}**, sendo sua relação pautada na reciprocidade, respeito mútuo, lealdade e assistência recíproca; b) optam, para reger suas relações patrimoniais, pelo regime da ${getPropertyRegimeText(declaration.propertyRegime)}; c) declaram, sob as penas da lei, **não haver qualquer impedimento para a formalização desta união**, conforme previsto no artigo 1.521 do Código Civil; d) foram informadas quanto às disposições do **artigo 1.727 do Código Civil**, que diferencia a união estável do concubinato, bem como sobre a possibilidade facultativa de registro deste termo no Livro "E" do 1º Ofício de Registro Civil do domicílio do casal, para fins de publicidade e efeitos erga omnes; e) **não há termo declaratório de união estável anterior** em nome de qualquer das declarantes; **CRC.** Procedi à consulta na Central de Informações do Registro Civil das Pessoas Naturais (CRC), não sendo localizado qualquer termo declaratório de união estável pré-existente em nome dos declarantes. **LAVRATURA.** Diante da manifestação expressa de vontade dos companheiros e por se acharem justos e acordados, solicitaram-me a lavratura do presente termo, que, após lido, conferido e considerado conforme, assinam. Este instrumento é lavrado com fundamento nos **artigos 1.723 a 1.727 do Código Civil Brasileiro, nos artigos 537 a 546 do Provimento nº 149 do Conselho Nacional de Justiça (CNJ) e no §3º do artigo 515-L do mesmo provimento**, servindo como **prova jurídica plena da relação aqui declarada**, e devidamente arquivado na pasta eletrônica referente ao Termo de União Estável **nº {TERMO}** desta Serventia. Selo Digital: {SELO}. Para consultar o selo, acesse: tjdft.jus.br. E, para que produza os efeitos legais cabíveis, firmam o presente termo, o qual tem valor jurídico de certidão, conforme art. 538, §1º do Provimento CNJ 149/2023. Brasília/DF, **${formatDate(currentDate)}**`;
};

export const generatePdfAction = async (declarationData: z.infer<typeof declarationSchema>) => {
  try {
    const { book, page, term } = await getNextBookNumbers();
    const finalSeal = declarationData.stamp || getDefaultSeal();
    const registrarFunction = OFICIAIS_REGISTRADORES[declarationData.registrarName] || 'Oficial Auxiliar';
    const pdfDoc = await PDFDocument.create();
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    let backgroundImage: PDFImage | undefined;
    try {
      const imagePath = path.join(process.cwd(), 'public', 'fundo.png');
      const imageBytes = fs.readFileSync(imagePath);
      backgroundImage = await pdfDoc.embedPng(imageBytes);
    } catch (error) {
      console.warn('Não foi possível carregar a imagem de fundo:', error);
    }
    const addPageWithBackground = () => {
      const page = pdfDoc.addPage([595.28, 841.89]);
      if (backgroundImage) {
        const { width: pageWidth, height: pageHeight } = page.getSize();
        page.drawImage(backgroundImage, {
          x: 0,
          y: 0,
          width: pageWidth,
          height: pageHeight,
        });
      }
      return page;
    };
    const firstPage = addPageWithBackground();
    const { width: pageWidth, height: pageHeight } = firstPage.getSize();
    const margin = 57;
    const maxWidth = pageWidth - margin * 2;
    const SIGNATURE_AREA_HEIGHT = 120;
    const MARGIN_BOTTOM = 50;
    let currentY = pageHeight - 80;
    let currentPage = firstPage;
    const addNewPageIfNeeded = (requiredSpace: number) => {
      if (currentY - requiredSpace < MARGIN_BOTTOM + SIGNATURE_AREA_HEIGHT) {
        currentPage = addPageWithBackground();
        currentY = pageHeight - 130;
        currentPage.drawText(`Livro: ${book}`, {
          x: margin,
          y: currentY,
          size: 11,
          font: helveticaBold,
          color: rgb(0, 0, 0),
        });
        currentPage.drawText(`Termo: ${term}`, {
          x: pageWidth - margin - 80,
          y: currentY,
          size: 11,
          font: helveticaBold,
          color: rgb(0, 0, 0),
        });
        currentY -= 50;
      }
    };
    currentY -= 30;
    currentPage.drawText(`Livro: ${book}`, {
      x: margin,
      y: currentY,
      size: 11,
      font: helveticaBold,
      color: rgb(0, 0, 0),
    });
    currentPage.drawText(`Termo: ${term}`, {
      x: pageWidth - margin - 80,
      y: currentY,
      size: 11,
      font: helveticaBold,
      color: rgb(0, 0, 0),
    });
    currentY -= 50;
    currentPage.drawText('TERMO DECLARATÓRIO DE UNIÃO ESTÁVEL', {
      x: pageWidth / 2 - 140,
      y: currentY,
      size: 14,
      font: helveticaBold,
      color: rgb(0, 0, 0),
    });
    currentY -= 50;
    const declarationText = generateDeclarationText(declarationData)
      .replace('{TERMO}', term.toString())
      .replace('{SELO}', finalSeal);
    const formattedParts = parseFormattedText(declarationText);
    const textLines = wrapFormattedText(formattedParts, maxWidth, 11, helveticaFont, helveticaBold);
    for (let i = 0; i < textLines.length; i++) {
      const line = textLines[i];
      const isLastLine = i === textLines.length - 1;
      const remainingLines = textLines.length - i;
      const spacesForRemainingText = remainingLines * 18;
      if (isLastLine) {
        addNewPageIfNeeded(spacesForRemainingText + SIGNATURE_AREA_HEIGHT);
      } else {
        addNewPageIfNeeded(18);
      }
      if (line.length > 1 && !isLastLine) {
        let totalTextWidth = 0;
        let spaceCount = 0;
        for (let j = 0; j < line.length; j++) {
          const part = line[j];
          const font = part.bold ? helveticaBold : helveticaFont;
          totalTextWidth += font.widthOfTextAtSize(part.text, 11);
          if (part.text === ' ') spaceCount++;
        }
        const remainingSpace = maxWidth - totalTextWidth;
        const extraSpacePerGap = spaceCount > 0 ? remainingSpace / spaceCount : 0;
        let x = margin;
        for (const part of line) {
          const font = part.bold ? helveticaBold : helveticaFont;
          currentPage.drawText(part.text, {
            x: x,
            y: currentY,
            size: 11,
            font: font,
            color: rgb(0, 0, 0),
          });
          const partWidth = font.widthOfTextAtSize(part.text, 11);
          x += partWidth;
          if (part.text === ' ') {
            x += extraSpacePerGap;
          }
        }
      } else {
        let x = margin;
        for (const part of line) {
          const font = part.bold ? helveticaBold : helveticaFont;
          currentPage.drawText(part.text, {
            x: x,
            y: currentY,
            size: 11,
            font: font,
            color: rgb(0, 0, 0),
          });
          x += font.widthOfTextAtSize(part.text, 11);
        }
        if (isLastLine) {
          const dashWidth = helveticaFont.widthOfTextAtSize('-', 11);
          const dashesNeeded = Math.floor((pageWidth - margin - x) / dashWidth);
          if (dashesNeeded > 0) {
            const dashes = '-'.repeat(dashesNeeded);
            currentPage.drawText(dashes, {
              x: x,
              y: currentY,
              size: 11,
              font: helveticaFont,
              color: rgb(0, 0, 0),
            });
          }
        }
      }
      currentY -= 18;
    }
    currentY -= 50;
    const firstPersonName = declarationData.firstPerson.name.toUpperCase();
    const firstPersonWidth = helveticaBold.widthOfTextAtSize(firstPersonName, 11);
    currentPage.drawText(firstPersonName, {
      x: (pageWidth - firstPersonWidth) / 2,
      y: currentY,
      size: 11,
      font: helveticaBold,
      color: rgb(0, 0, 0),
    });
    currentY -= 60;
    const secondPersonName = declarationData.secondPerson.name.toUpperCase();
    const secondPersonWidth = helveticaBold.widthOfTextAtSize(secondPersonName, 11);
    currentPage.drawText(secondPersonName, {
      x: (pageWidth - secondPersonWidth) / 2,
      y: currentY,
      size: 11,
      font: helveticaBold,
      color: rgb(0, 0, 0),
    });
    currentY -= 60;
    const registrarNameText = declarationData.registrarName.toUpperCase();
    const registrarNameWidth = helveticaBold.widthOfTextAtSize(registrarNameText, 11);
    currentPage.drawText(registrarNameText, {
      x: (pageWidth - registrarNameWidth) / 2,
      y: currentY,
      size: 11,
      font: helveticaBold,
      color: rgb(0, 0, 0),
    });
    currentY -= 20;
    const registrarFunctionWidth = helveticaFont.widthOfTextAtSize(registrarFunction, 10);
    currentPage.drawText(registrarFunction, {
      x: (pageWidth - registrarFunctionWidth) / 2,
      y: currentY,
      size: 10,
      font: helveticaFont,
      color: rgb(0, 0, 0),
    });
    const pdfBytes = await pdfDoc.save();
    const pdfBase64 = Buffer.from(pdfBytes).toString('base64');
    return { 
      success: true, 
      pdfContent: pdfBase64,
      filename: `termo-uniao-estavel-${book}-${term}.pdf`,
      contentType: 'application/pdf'
    };
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    return { success: false, error: 'Erro ao gerar PDF' };
  }
};