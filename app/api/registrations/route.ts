import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const registrationSchema = z.object({
  date: z.string(),
  city: z.string(),
  state: z.string(),
  firstPerson: z.object({
    name: z.string(),
    nationality: z.string(),
    civilStatus: z.string(),
    birthDate: z.string(),
    birthPlace: z.string(),
    profession: z.string(),
    rg: z.string(),
    cpf: z.string(),
    address: z.string(),
    email: z.string(),
    phone: z.string(),
    fatherName: z.string(),
    motherName: z.string(),
    registryOffice: z.string(),
    registryBook: z.string(),
    registryPage: z.string(),
    registryTerm: z.string(),
    divorceDate: z.string().optional(),
    newName: z.string().optional(),
  }),
  secondPerson: z.object({
    name: z.string(),
    nationality: z.string(),
    civilStatus: z.string(),
    birthDate: z.string(),
    birthPlace: z.string(),
    profession: z.string(),
    rg: z.string(),
    cpf: z.string(),
    address: z.string(),
    email: z.string(),
    phone: z.string(),
    fatherName: z.string(),
    motherName: z.string(),
    registryOffice: z.string(),
    registryBook: z.string(),
    registryPage: z.string(),
    registryTerm: z.string(),
    divorceDate: z.string().optional(),
    newName: z.string().optional(),
  }),
  unionStartDate: z.string(),
  propertyRegime: z.string(),
  registrarName: z.string(),
  pactDate: z.string().optional(),
  pactOffice: z.string().optional(),
  pactBook: z.string().optional(),
  pactPage: z.string().optional(),
  pactTerm: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = registrationSchema.parse(body);

    const registration = await prisma.$transaction(async (tx) => {
      // Create or update first person
      const firstPerson = await tx.person.upsert({
        where: { cpf: data.firstPerson.cpf },
        update: {
          ...data.firstPerson,
          birthDate: new Date(data.firstPerson.birthDate),
          divorceDate: data.firstPerson.divorceDate ? new Date(data.firstPerson.divorceDate) : null,
        },
        create: {
          ...data.firstPerson,
          birthDate: new Date(data.firstPerson.birthDate),
          divorceDate: data.firstPerson.divorceDate ? new Date(data.firstPerson.divorceDate) : null,
        },
      });

      // Create or update second person
      const secondPerson = await tx.person.upsert({
        where: { cpf: data.secondPerson.cpf },
        update: {
          ...data.secondPerson,
          birthDate: new Date(data.secondPerson.birthDate),
          divorceDate: data.secondPerson.divorceDate ? new Date(data.secondPerson.divorceDate) : null,
        },
        create: {
          ...data.secondPerson,
          birthDate: new Date(data.secondPerson.birthDate),
          divorceDate: data.secondPerson.divorceDate ? new Date(data.secondPerson.divorceDate) : null,
        },
      });

      // Create declaration
      return tx.declaration.create({
        data: {
          date: new Date(data.date),
          city: data.city,
          state: data.state,
          unionStartDate: new Date(data.unionStartDate),
          propertyRegime: data.propertyRegime,
          registrarName: data.registrarName,
          pactDate: data.pactDate ? new Date(data.pactDate) : null,
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

    return NextResponse.json(registration);
  } catch (error) {
    console.error('Failed to create registration:', error);
    return NextResponse.json(
      { error: 'Failed to create registration' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.toLowerCase() || '';
    const bookNumber = searchParams.get('bookNumber');
    const pageNumber = searchParams.get('pageNumber');
    const termNumber = searchParams.get('termNumber');

    const declarations = await prisma.declaration.findMany({
      where: {
        OR: [
          { firstPerson: { name: { contains: search, mode: 'insensitive' } } },
          { secondPerson: { name: { contains: search, mode: 'insensitive' } } },
          { firstPerson: { cpf: { contains: search } } },
          { secondPerson: { cpf: { contains: search } } },
        ],
        AND: [
          bookNumber ? { firstPerson: { registryBook: bookNumber } } : {},
          pageNumber ? { firstPerson: { registryPage: pageNumber } } : {},
          termNumber ? { firstPerson: { registryTerm: termNumber } } : {},
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