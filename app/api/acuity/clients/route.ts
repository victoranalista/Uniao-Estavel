import { NextResponse } from 'next/server';
import { AcuityService, AcuityError } from '@/lib/acuity';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const querySchema = z.object({
  search: z.string().optional(),
  page: z.string().optional().transform(val => val ? parseInt(val, 10) : 1),
  limit: z.string().optional().transform(val => val ? parseInt(val, 10) : 10)
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    const { search, page, limit } = querySchema.parse({
      search: searchParams.get('search'),
      page: searchParams.get('page'),
      limit: searchParams.get('limit')
    });

    const acuityService = AcuityService.getInstance();
    const clients = await acuityService.getClients(search);

    const mappedClients = clients
      .map(client => {
        try {
          return acuityService.mapClientData(client);
        } catch (error) {
          console.warn(`Failed to map client ${client.id}:`, error);
          return null;
        }
      })
      .filter((client): client is NonNullable<typeof client> => 
        client !== null &&
        (search ? (
          client.firstName.toLowerCase().includes(search.toLowerCase()) ||
          client.lastName.toLowerCase().includes(search.toLowerCase()) ||
          client.declaration.firstPerson.name.toLowerCase().includes(search.toLowerCase()) ||
          client.declaration.secondPerson.name.toLowerCase().includes(search.toLowerCase())
        ) : true)
      );

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedClients = mappedClients.slice(startIndex, endIndex);

    return NextResponse.json({
      data: paginatedClients,
      pagination: {
        total: mappedClients.length,
        page,
        limit,
        totalPages: Math.ceil(mappedClients.length / limit)
      }
    });
  } catch (error) {
    console.error('Error in /api/acuity/clients:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: error.errors },
        { status: 400 }
      );
    }

    if (error instanceof AcuityError) {
      return NextResponse.json(
        { error: error.message, details: error.details },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}