import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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
    const body = await request.json();
    const declaration = await prisma.declaration.update({
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
            ...body.firstPerson,
            birthDate: new Date(body.firstPerson.birthDate),
            divorceDate: body.firstPerson.divorceDate ? new Date(body.firstPerson.divorceDate) : null,
          },
        },
        secondPerson: {
          update: {
            ...body.secondPerson,
            birthDate: new Date(body.secondPerson.birthDate),
            divorceDate: body.secondPerson.divorceDate ? new Date(body.secondPerson.divorceDate) : null,
          },
        },
      },
      include: {
        firstPerson: true,
        secondPerson: true,
      },
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