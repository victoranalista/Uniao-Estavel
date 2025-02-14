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
      const updatedDeclaration = await tx.declaration.update({
        where: { id: params.id },
        data: {
          date: body.date,
          city: body.city,
          state: body.state,
          unionStartDate: body.unionStartDate,
          propertyRegime: body.propertyRegime,
          registrarName: body.registrarName,
          pactDate: body.pactDate ? new Date(body.pactDate) : null,
          pactOffice: body.pactOffice,
          pactBook: body.pactBook,
          pactPage: body.pactPage,
          pactTerm: body.pactTerm,
          firstPerson: {
            update: {
              ...body.firstPerson,
              birthDate: body.firstPerson.birthDate,
              divorceDate: body.firstPerson.divorceDate
            },
          },
          secondPerson: {
            update: {
              ...body.secondPerson,
              birthDate: body.secondPerson.birthDate,
              divorceDate: body.secondPerson.divorceDate
            },
          },
        },
        include: {
          firstPerson: true,
          secondPerson: true,
        },
      });


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
