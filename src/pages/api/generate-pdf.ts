import { NextApiRequest, NextApiResponse } from 'next';
import { PDFGenerator } from '@/src/infra/pdf/PDFGenerator';
import { Declaration } from '@/domain/entities/Declaration';

// Função fictícia para pegar o próximo selo disponível
//const getSealFromDatabase = async (): Promise<string | null> => {
  // Aqui você deve implementar a lógica de como pegar o selo no banco de dados ou XML
  // Vamos supor que o primeiro selo disponível será retornado

 // const seal = await someSealRetrievalLogic(); // Exemplo de busca no banco de dados
 // return seal ? seal.id : null;
  // Aqui poderiam estar os selos que você tem no banco de dados, com o banco de dados coloca esse código e inutliza esse outro abaixo 

 const getSealFromDatabase = async (): Promise<string | null> => {
  // Simula a busca no banco de dados ou XML
  // Substitua esse código pela sua lógica real de consulta no banco de dados
  // Aqui estamos apenas retornando um selo de exemplo
  const seals = [
    { id: 'TJDFT20190420022000HDIE' },
    { id: 'TJDFT20190420021999PBVE' },
    { id: 'TJDFT20190420021998KXYT' },
    // Aqui poderiam estar os selos que você tem no banco de dados
  ];
  
  // Simulando que pegamos o primeiro selo disponível (ou retornando null se não houver selo)
  const nextSeal = seals.length > 0 ? seals[0].id : null;
  return nextSeal;
};

// Função fictícia para pegar a quantidade de selos restantes
const getRemainingSeals = async (): Promise<number> => {
  // Aqui você pode implementar a lógica real de quantos selos ainda restam no banco de dados
  return 50; // Exemplo: Retorna um número fictício de selos restantes
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Obtém o selo disponível
    const seal = await getSealFromDatabase();

    // Se não houver selo disponível, definimos como "N/A"
    const sealToUse = seal || 'N/A';

    // Verifica quantos selos ainda restam
    const remainingSeals = await getRemainingSeals();

    // Alerta quando restar 100 ou menos selos
    const alert = remainingSeals <= 100 ? 'Warning: Only 100 seals left' : '';

    const declaration = req.body as Declaration;
    const pdfGenerator = new PDFGenerator();
    const pdfBuffer = await pdfGenerator.execute(declaration, sealToUse);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=declaracao.pdf');
    res.send(Buffer.from(pdfBuffer));

    // Retorna o alerta junto com o PDF, se houver
    if (alert) {
      return res.status(200).json({ alert, pdfBuffer });
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error generating PDF' });
  }
}