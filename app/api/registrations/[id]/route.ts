import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth/next";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const declaration = await prisma.declaration.findUnique({
      where: { id: params.id },
      include: {
        firstPerson: true,
        secondPerson: true,
        history: {
          orderBy: {
            updatedAt: 'desc'
          }
        }
      },
    });

    if (!declaration) {
      return NextResponse.json(
        { error: 'Declaration not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(declaration);
  } catch (error) {
    console.error('Failed to fetch declaration:', error);
    return NextResponse.json(
      { error: 'Failed to fetch declaration' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    const declaration = await prisma.$transaction(async (tx) => {
      // Update the declaration
      const updatedDeclaration = await tx.declaration.update({
        where: { id: params.id },
        data: {
          date: new Date(body.date),
          city: body.city,
          state: body.state,
          unionStartDate: new Date(body.unionStartDate),
          propertyRegime: body.propertyRegime,
          registrarName: body.registrarName,
          pactDate: body.pactDate ? new Date(body.pactDate) : null,
          pactOffice: body.pactOffice,
          pactBook: body.pactBook,
          pactPage: body.pactPage,
          pactTerm: body.pactTerm,
          firstPerson: {
            update: {
              name: body.firstPerson.name,
              nationality: body.firstPerson.nationality,
              civilStatus: body.firstPerson.civilStatus,
              birthDate: new Date(body.firstPerson.birthDate),
              birthPlace: body.firstPerson.birthPlace,
              profession: body.firstPerson.profession,
              rg: body.firstPerson.rg,
              cpf: body.firstPerson.cpf,
              address: body.firstPerson.address,
              email: body.firstPerson.email,
              phone: body.firstPerson.phone,
              fatherName: body.firstPerson.fatherName,
              motherName: body.firstPerson.motherName,
              registryOffice: body.firstPerson.registryOffice,
              registryBook: body.firstPerson.registryBook,
              registryPage: body.firstPerson.registryPage,
              registryTerm: body.firstPerson.registryTerm,
              divorceDate: body.firstPerson.divorceDate ? new Date(body.firstPerson.divorceDate) : null,
              newName: body.firstPerson.newName,
            },
          },
          secondPerson: {
            update: {
              name: body.secondPerson.name,
              nationality: body.secondPerson.nationality,
              civilStatus: body.secondPerson.civilStatus,
              birthDate: new Date(body.secondPerson.birthDate),
              birthPlace: body.secondPerson.birthPlace,
              profession: body.secondPerson.profession,
              rg: body.secondPerson.rg,
              cpf: body.secondPerson.cpf,
              address: body.secondPerson.address,
              email: body.secondPerson.email,
              phone: body.secondPerson.phone,
              fatherName: body.secondPerson.fatherName,
              motherName: body.secondPerson.motherName,
              registryOffice: body.secondPerson.registryOffice,
              registryBook: body.secondPerson.registryBook,
              registryPage: body.secondPerson.registryPage,
              registryTerm: body.secondPerson.registryTerm,
              divorceDate: body.secondPerson.divorceDate ? new Date(body.secondPerson.divorceDate) : null,
              newName: body.secondPerson.newName,
            },
          },
        },
        include: {
          firstPerson: true,
          secondPerson: true,
        },
      });

      // Create history entry
      await tx.declarationHistory.create({
        data: {
          declarationId: params.id,
          type: 'UPDATE',
          description: 'Registro atualizado',
          averbation: body.averbation,
          updatedBy: session.user.email || 'Unknown',
        },
      });

      return updatedDeclaration;
    });

    return NextResponse.json(declaration);
  } catch (error) {
    console.error('Failed to update declaration:', error);
    return NextResponse.json(
      { error: 'Failed to update declaration' },
      { status: 500 }
    );
  }
}
