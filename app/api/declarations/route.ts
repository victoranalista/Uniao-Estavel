import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const declarationSchema = z.object({
  date: z.string().transform(str => new Date(str)),
  city: z.string(),
  state: z.string(),
  unionStartDate: z.string().transform(str => new Date(str)),
  propertyRegime: z.string(),
  registrarName: z.string(),
  pactDate: z.string().optional().transform(str => str ? new Date(str) : undefined),
  pactOffice: z.string().optional(),
  pactBook: z.string().optional(),
  pactPage: z.string().optional(),
  pactTerm: z.string().optional(),
  firstPerson: z.object({
    name: z.string(),
    nationality: z.string(),
    civilStatus: z.string(),
    birthDate: z.string().transform(str => new Date(str)),
    birthPlace: z.string(),
    profession: z.string(),
    rg: z.string(),
    cpf: z.string(),
    address: z.string(),
    email: z.string().email(),
    phone: z.string(),
    fatherName: z.string(),
    motherName: z.string(),
    registryOffice: z.string(),
    registryBook: z.string(),
    registryPage: z.string(),
    registryTerm: z.string(),
    divorceDate: z.string().optional().transform(str => str ? new Date(str) : undefined),
    newName: z.string().optional()
  }),
  secondPerson: z.object({
    name: z.string(),
    nationality: z.string(),
    civilStatus: z.string(),
    birthDate: z.string().transform(str => new Date(str)),
    birthPlace: z.string(),
    profession: z.string(),
    rg: z.string(),
    cpf: z.string(),
    address: z.string(),
    email: z.string().email(),
    phone: z.string(),
    fatherName: z.string(),
    motherName: z.string(),
    registryOffice: z.string(),
    registryBook: z.string(),
    registryPage: z.string(),
    registryTerm: z.string(),
    divorceDate: z.string().optional().transform(str => str ? new Date(str) : undefined),
    newName: z.string().optional()
  })
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = declarationSchema.parse(body);

    const declaration = await prisma.$transaction(async (tx) => {
      // Create or update first person
      const firstPerson = await tx.person.upsert({
        where: { cpf: data.firstPerson.cpf },
        update: data.firstPerson,
        create: data.firstPerson,
      });

      // Create or update second person
      const secondPerson = await tx.person.upsert({
        where: { cpf: data.secondPerson.cpf },
        update: data.secondPerson,
        create: data.secondPerson,
      });

      // Create declaration
      return tx.declaration.create({
        data: {
          date: data.date,
          city: data.city,
          state: data.state,
          unionStartDate: data.unionStartDate,
          propertyRegime: data.propertyRegime,
          registrarName: data.registrarName,
          pactDate: data.pactDate,
          pactOffice: data.pactOffice,
          pactBook: data.pactBook,
          pactPage: data.pactPage,
          pactTerm: data.pactTerm,
          firstPersonId: firstPerson.id,
          secondPersonId: secondPerson.id,
        },
        include: {
          firstPerson: true,
          secondPerson: true,
        },
      });
    });

    return NextResponse.json(declaration);
  } catch (error) {
    console.error('Failed to create declaration:', error);
    return NextResponse.json(
      { error: 'Failed to create declaration' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.toLowerCase() || '';

    const declarations = await prisma.declaration.findMany({
      where: {
        OR: [
          { firstPerson: { name: { contains: search, mode: 'insensitive' } } },
          { secondPerson: { name: { contains: search, mode: 'insensitive' } } },
        ],
      },
      include: {
        firstPerson: true,
        secondPerson: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(declarations);
  } catch (error) {
    console.error('Failed to fetch declarations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch declarations' },
      { status: 500 }
    );
  }
}