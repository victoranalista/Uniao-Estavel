import { prisma } from '@/lib/prisma';

interface BookNumbers {
  book: string;
  term: string;
}

const incrementTermAtomic = async () => {
  const result = await prisma.$transaction(async (tx) => {
    const control = await tx.bookControl.findFirst();
    if (!control) {
      const newControl = await tx.bookControl.create({
        data: {
          id: 1,
          currentBook: 1,
          currentTerm: 203
        }
      });
      return {
        book: `UE-${newControl.currentBook}`,
        term: newControl.currentTerm.toString()
      };
    }
    const updatedControl = await tx.bookControl.update({
      where: { id: control.id },
      data: {
        currentTerm: control.currentTerm + 1
      }
    });

    return {
      book: `UE-${updatedControl.currentBook}`,
      term: control.currentTerm.toString()
    };
  });
  return result;
};

export const getNextBookNumbers = async (): Promise<BookNumbers> => {
  return await incrementTermAtomic();
};

export const parseXMLSeals = (xmlContent: string): string[] => {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlContent, 'text/xml');
  const selos = xmlDoc.getElementsByTagName('selo');
  return Array.from(selos).map((selo) => selo.getAttribute('id') || '');
};
