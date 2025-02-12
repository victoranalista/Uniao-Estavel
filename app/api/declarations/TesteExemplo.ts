import { NextResponse } from 'next/server';

// This would typically come from a database
const mockDeclarations = [
  {
    id: "1",
    unionStartDate: "2023-01-01",
    firstPerson: {
      name: "João Silva Alves de Sousa",
      nationality: "Brasileira",
      civilStatus: "Solteiro(a)",
      birthDate: "15/05/1999",
      birthPlace: "Brasília",
      profession: "Engenheiro",
      rg: "1234567",
      cpf: "12345678900",
      address: "Rua A, 123",
      email: "joao@email.com",
      phone: "61988888888",
      fatherName: "José Silva",
      motherName: "Maria Silva",
      registryOffice: "1º Ofício",
      registryBook: "A-1",
      registryPage: "001",
      registryTerm: "001"
    },
    secondPerson: {
      name: "Maria Santos Alves",
      nationality: "Brasileira",
      civilStatus: "Solteiro(a)",
      birthDate: "15-05-1999",
      birthPlace: "Brasília",
      profession: "Advogada",
      rg: "7654321",
      cpf: "98765432100",
      address: "Rua B, 456",
      email: "maria@email.com",
      phone: "6199999-9999",
      fatherName: "João Santos",
      motherName: "Ana Santos",
      registryOffice: "1º Ofício",
      registryBook: "A-1",
      registryPage: "002",
      registryTerm: "002"
    }
  }
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search') || '';

  try {
    const filteredDeclarations = mockDeclarations.filter(declaration => 
      declaration.firstPerson.name.toLowerCase().includes(search.toLowerCase()) ||
      declaration.secondPerson.name.toLowerCase().includes(search.toLowerCase())
    );

    return NextResponse.json(filteredDeclarations);
  } catch (error) {
    console.error('Error fetching declarations:', error);
    return NextResponse.json({ error: 'Failed to fetch declarations' }, { status: 500 });
  }
}