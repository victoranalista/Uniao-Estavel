import { GenerateDeclarationUseCase } from '@/src/domain/usecases/GenerateDeclaration';
import { Declaration } from '@/domain/entities/Declaration';
import PDFDocument from 'pdfkit';
import { getNextBookNumbers } from '@/utils/bookControl';
import { OFICIAIS_REGISTRADORES } from '@/utils/constants';

export class PDFGenerator implements GenerateDeclarationUseCase {
  private formatDate(date: string): string {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }
  private getPropertyRegimeText(regime: string): string {
    const regimes = {
      COMUNHAO_PARCIAL: 'COMUNHÃO PARCIAL DE BENS, de forma que apenas os bens adquiridos onerosamente durante a constância da união pertencem a ambos os companheiros, em partes iguais, cabendo a administração a ambos',
      SEPARACAO_TOTAL: 'SEPARAÇÃO TOTAL DE BENS de forma que os bens não se comunicam, sendo mantidos os patrimônios individuais, separados e independentes',
      PARTICIPACAO_FINAL: 'PARTICIPAÇÃO FINAL NOS AQUESTOS de forma que cada parte conserva seu próprio patrimônio, sendo que, após a dissolução da união, cada um tem direito à metade dos bens adquiridos onerosamente durante a convivência',
      COMUNHAO_UNIVERSAL: 'COMUNHÃO UNIVERSAL DE BENS de forma que todos bens, adquiridos antes ou durante a união, onerosos ou gratuitos, se comunicam integralmente'
    };
    return regimes[regime as keyof typeof regimes];
  }
  async execute(declaration: Declaration, seal: string): Promise<Uint8Array> {
    const { book, page, term } = getNextBookNumbers();
    const doc = new PDFDocument({
      size: 'A4',
      margins: {
        top: 50,
        bottom: 50,
        left: 50,
        right: 50
      }
    });
    const chunks: Uint8Array[] = [];
    const selectedOfficialFunction = OFICIAIS_REGISTRADORES[declaration.registrarName] || 'Oficial Registrador';
    const registrarFunction =
  OFICIAIS_REGISTRADORES[declaration.registrarName] || 'Oficial Registrador(a)';

    return new Promise((resolve, reject) => {
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => {
        const result = new Uint8Array(Buffer.concat(chunks));
        resolve(result);
      });
      doc.on('error', reject);
      doc.fontSize(12)
      .font('Helvetica-Bold')
      .text(`Livro: ${book}                                              `          , { continued: true })  
      .text(`Folha: ${page}                        `, { continued:  true }) 
      .text(`Termo: ${term}`, 
        { align: 'right' }) 
      .moveDown();
      doc.moveDown();      
      doc.fontSize(16)
         .font('Helvetica-Bold')
         .text('TERMO DECLARATÓRIO DE UNIÃO ESTÁVEL', { align: 'center' })
         .moveDown();
     
      doc.fontSize(12)
         .font('Helvetica')
         .text(this.generateDeclarationText(declaration), {
           align: 'justify',
           lineGap: 2
         });
      doc.moveDown(3)
      .fontSize(11)
         .font('Helvetica-Bold')
         .text(declaration.registrarName, { align: 'center'})
         .fontSize(10)
         .font('Helvetica')
         .text(`${selectedOfficialFunction}`, { align: 'center' });

      doc.moveDown(3) 
      .fontSize(11)
      .font('Helvetica-Bold')
      .text(`${declaration.firstPerson.name}`, { continued:  true, align: 'left' }) 
      .text(`${declaration.secondPerson.name}`, { align: 'right' });

      doc.moveDown(6)
       .fontSize(24)
       .font('Helvetica-Bold')
       .text('CERTIDÃO', { align: 'center' })
       .moveDown();

      doc.moveDown(2)
         .fontSize(12)
         .font('Helvetica')
         .text(`Certifica-se que a presente certidão reprogáfica reproduz, de forma integral e fiel, o conteúdo do Termo Declaratório de União Estável, lavrado em ${this.formatDate(declaration.date)}, no Livro ${book}, Folha ${page}, Termo ${term}. Após rigorosa conferência e observância dos procedimentos estabelecidos, foi realizada a reprodução exata dos elementos constantes no ato, garantindo a autenticidade, integridade e exatidão das informações aqui transcritas. É o que consta. Eu, ${declaration.registrarName},  ${registrarFunction}, conferi e assinei. Selo: ${seal}. Para consultar o selo, acesse o site: www.tjdft.jus.br.`, { align: 'justify' });
      doc.end();3
    });
  }
  private generateDeclarationText(declaration: Declaration): string {
    const registrarFunction =
  OFICIAIS_REGISTRADORES[declaration.registrarName] || 'Oficial Registrador(a)';
    return `Aos ${this.formatDate(declaration.date)}, nesta cidade de Brasília/DF, na sede do Cartório Colorado - 8º Ofício | Registro Civil. Títulos e Documentos. Pessoas Jurídicas | DF, perante mim, ${registrarFunction}, ${declaration.registrarName}, compareceram as partes: ${declaration.firstPerson.name}, ${declaration.firstPerson.nationality}, ${declaration.firstPerson.civilStatus}, nascido em ${this.formatDate(declaration.firstPerson.birthDate)}, natural de ${declaration.firstPerson.birthPlace}, ${declaration.firstPerson.profession}, portador do RG nº ${declaration.firstPerson.rg} e inscrito no CPF nº ${declaration.firstPerson.cpf}, residente e domiciliado em ${declaration.firstPerson.address}, e-mail ${declaration.firstPerson.email}, telefone ${declaration.firstPerson.phone}, filho de ${declaration.firstPerson.fatherName} e ${declaration.firstPerson.motherName}, com dados do registro de ${declaration.firstPerson.typeRegistry} registrado(a) no Cartório ${declaration.firstPerson.registryOffice}, Livro ${declaration.firstPerson.registryBook}, Folha ${declaration.firstPerson.registryPage} e Termo ${declaration.firstPerson.registryTerm}${declaration.firstPerson.divorceDate ? `, com data do divórcio em ${this.formatDate(declaration.firstPerson.divorceDate)}` : ''}; ${declaration.secondPerson.name}, de nacionalidade ${declaration.secondPerson.nationality}, ${declaration.secondPerson.civilStatus}, nascido em ${this.formatDate(declaration.secondPerson.birthDate)}, natural de ${declaration.secondPerson.birthPlace}, ${declaration.secondPerson.profession}, portador do RG nº ${declaration.secondPerson.rg} e inscrito no CPF nº ${declaration.secondPerson.cpf}, residente e domiciliado em ${declaration.secondPerson.address}, e-mail ${declaration.secondPerson.email}, telefone ${declaration.secondPerson.phone}, filho de ${declaration.secondPerson.fatherName} e ${declaration.secondPerson.motherName}, com dados do registro de ${declaration.firstPerson.typeRegistry} registrado(a) no Cartório ${declaration.secondPerson.registryOffice}, Livro ${declaration.secondPerson.registryBook}, Folha ${declaration.secondPerson.registryPage} e Termo ${declaration.secondPerson.registryTerm}${declaration.secondPerson.divorceDate ? `, com data do divórcio em ${this.formatDate(declaration.secondPerson.divorceDate)}` : ''}. As partes acima identificadas, maiores e capazes, foram reconhecidas e identificadas por mim, Oficial, por meio dos documentos apresentados, os quais foram devidamente conferidos e arquivados nesta Serventia, e de cuja capacidade jurídica dou fé. Os(as) declarantes afirmam que convivem em união estável nos termos do art. 1.723 do Código Civil, desde ${this.formatDate(declaration.unionStartDate)}, com o objetivo de constituição de família, caracterizada pela convivência pública, contínua e duradoura, alicerçada no respeito e na assistência mútua. Aplica-se às relações patrimoniais o regime de ${this.getPropertyRegimeText(declaration.propertyRegime)}${declaration.pactDate ? `, em conformidade a Escritura Pública de Pacto ante União Estável, lavrada em ${this.formatDate(declaration.pactDate)}, pelo ${declaration.pactOffice}, no livro ${declaration.pactBook}, folha ${declaration.pactPage}, termo/protocolo ${declaration.pactTerm}` : ''}. ${declaration.firstPerson.newName || declaration.secondPerson.newName ? `As partes optaram por alterar os nomes, passando a serem identificadas como ${declaration.firstPerson.newName || declaration.firstPerson.name} e ${declaration.secondPerson.newName || declaration.secondPerson.name}, respectivamente.` : ''}Indagados sobre a existência de impedimentos, declararam que não há incidência de qualquer impedimento previsto no art. 1.521 do Código Civil Brasileiro. Foram ainda informados sobre as disposições do art. 1.727 do Código Civil, acerca do concubinato, e sobre a possibilidade de registro facultativo no Livro "E" do 1º Ofício de Registro Civil. Por se acharem justos e acordados, solicitaram-me a lavratura deste termo, que, após lido e achado conforme, assinam. Este termo foi elaborado nos termos dos artigos 1.723 a 1.727 do Código Civil, §3º do art. 515-L e arts. 537 a 546 do Provimento 149 do CNJ.

Eu, ${declaration.registrarName}, ${registrarFunction}, lavrei, conferi, li e encerro presente ato colhendo as devidas assinaturas. 

Brasília/DF, ${this.formatDate(declaration.date)}`;
  }}