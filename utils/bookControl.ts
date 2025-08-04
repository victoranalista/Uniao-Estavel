import { prisma } from '@/lib/prisma';

interface BookControl {
  currentBook: number;
  currentTerm: number;
}

const getBookControlFromDB = async (): Promise<BookControl> => {
  const control = await prisma.bookControl.findFirst();
  if (!control) {
    return {
      currentBook: 1,
      currentTerm: 203
    };
  }
  return {
    currentBook: control.currentBook,
    currentTerm: control.currentTerm
  };
};

const updateBookControlInDB = async (control: BookControl): Promise<void> => {
  await prisma.bookControl.upsert({
    where: { id: 1 },
    update: {
      currentBook: control.currentBook,
      currentTerm: control.currentTerm
    },
    create: {
      id: 1,
      currentBook: control.currentBook,
      currentTerm: control.currentTerm
    }
  });
};

export const getNextBookNumbers = async (): Promise<{ book: string; term: string }> => {
  const control = await getBookControlFromDB();
  const result = {
    book: `UE-${control.currentBook}`,
    term: control.currentTerm.toString()
  };
  control.currentTerm++;
  await updateBookControlInDB(control);
  return result;
};

export const parseXMLSeals = (xmlContent: string): string[] => {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlContent, 'text/xml');
  const selos = xmlDoc.getElementsByTagName('selo');
  return Array.from(selos).map(selo => selo.getAttribute('id') || '');
};