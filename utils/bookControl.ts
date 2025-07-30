import { prisma } from '@/lib/prisma';

interface BookControl {
  currentBook: number;
  currentPage: number;
  currentTerm: number;
}

const getBookControlFromDB = async (): Promise<BookControl> => {
  const control = await prisma.bookControl.findFirst();
  if (!control) {
    return {
      currentBook: 1,
      currentPage: 1,
      currentTerm: 203
    };
  }
  return {
    currentBook: control.currentBook,
    currentPage: control.currentPage,
    currentTerm: control.currentTerm
  };
};

const updateBookControlInDB = async (control: BookControl): Promise<void> => {
  await prisma.bookControl.upsert({
    where: { id: 1 },
    update: {
      currentBook: control.currentBook,
      currentPage: control.currentPage,
      currentTerm: control.currentTerm
    },
    create: {
      id: 1,
      currentBook: control.currentBook,
      currentPage: control.currentPage,
      currentTerm: control.currentTerm
    }
  });
};

export const getNextBookNumbers = async (): Promise<{ book: string; page: string; term: string }> => {
  const control = await getBookControlFromDB();
  const result = {
    book: `UE-${control.currentBook}`,
    page: control.currentPage.toString().padStart(2, '0'),
    term: control.currentTerm.toString()
  };
  control.currentTerm++;
  if (control.currentPage >= 300) {
    control.currentBook++;
    control.currentPage = 1;
  } else {
    control.currentPage++;
  }
  await updateBookControlInDB(control);
  return result;
};

export const parseXMLSeals = (xmlContent: string): string[] => {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlContent, 'text/xml');
  const selos = xmlDoc.getElementsByTagName('selo');
  return Array.from(selos).map(selo => selo.getAttribute('id') || '');
};