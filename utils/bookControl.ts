interface BookControl {
    currentBook: number;
    currentPage: number;
    currentTerm: number;
  }
  let bookControl: BookControl = {
    currentBook: 1,
    currentPage: 1,
    currentTerm: 1
  };
  export function getNextBookNumbers(): { book: string; page: string; term: string } {
    const result = {
      book: `UE-${bookControl.currentBook}`,
      page: bookControl.currentPage.toString().padStart(2, '0'),
      term: bookControl.currentTerm.toString().padStart(2, '0')
    };
    bookControl.currentTerm++;
    if (bookControl.currentPage >= 300) {
      bookControl.currentBook++;
      bookControl.currentPage = 1;
    } else {
      bookControl.currentPage++;
    }
    return result;
  }
  export function parseXMLSeals(xmlContent: string): string[] {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlContent, 'text/xml');
    const selos = xmlDoc.getElementsByTagName('selo');
    return Array.from(selos).map(selo => selo.getAttribute('id') || '');
  }