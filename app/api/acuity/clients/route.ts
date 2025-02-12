import { NextResponse } from 'next/server';
import { AcuityService, AcuityError } from '@/lib/acuity';
import { z } from 'zod';

const querySchema = z.object({
  search: z.string().optional(),
  page: z.string().optional().transform(val => (val ? parseInt(val, 10) : 1)),
  limit: z.string().optional().transform(val => (val ? parseInt(val, 10) : 10)),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // Validar e processar os parâmetros da query
    const { search, page, limit } = querySchema.parse({
      search: searchParams.get('search'),
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
    });

    const acuityService = AcuityService.getInstance();
    const clients = await acuityService.getClients(search);

    // Mapear e filtrar clientes
    const mappedClients = clients
      .map(client => {
        try {
          return acuityService.mapClientData(client);
        } catch (error) {
          console.warn(`Falha ao mapear cliente ${client.id}:`, error);
          return null;
        }
      })
      .filter(
        (client): client is NonNullable<typeof client> =>
          client !== null &&
          (search
            ? client.firstName.toLowerCase().includes(search.toLowerCase()) ||
              client.lastName.toLowerCase().includes(search.toLowerCase()) ||
              client.declaration?.firstPerson?.name
                ?.toLowerCase()
                .includes(search.toLowerCase()) ||
              client.declaration?.secondPerson?.name
                ?.toLowerCase()
                .includes(search.toLowerCase())
            : true)
      );

    // Implementar paginação
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedClients = mappedClients.slice(startIndex, endIndex);

    return NextResponse.json({
      data: paginatedClients,
      pagination: {
        total: mappedClients.length,
        page,
        limit,
        totalPages: Math.ceil(mappedClients.length / limit),
      },
    });
  } catch (error) {
    console.error('Erro na rota /api/acuity/clients:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Parâmetros inválidos na query', details: error.errors },
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
      { error: 'Erro interno no servidor' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
