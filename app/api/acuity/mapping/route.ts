import { NextResponse } from 'next/server';
import { z } from 'zod';
import { AcuityService, AcuityError } from '@/lib/acuity';
import { AcuityClient } from '@/types/acuity';

// Validation schema for Acuity form fields
const acuityFieldSchema = z.object({
  fieldID: z.string(),
  value: z.string()
});

const acuityFormSchema = z.object({
  id: z.string(),
  values: z.array(acuityFieldSchema)
});

const acuityClientSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  phone: z.string(),
  forms: z.array(acuityFormSchema).min(1, 'Client must have at least one form')
});

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      return NextResponse.json(
        { error: 'Content-Type must be application/json' },
        { status: 415 }
      );
    }

    const acuityData = await request.json();

    // Validate input data
    const validatedData = acuityClientSchema.parse(acuityData) as AcuityClient;

    // Map the data using our service
    const acuityService = AcuityService.getInstance();
    const mappedData = acuityService.mapClientData(validatedData);

    return NextResponse.json({
      data: mappedData,
      message: 'Client data mapped successfully'
    });
  } catch (error) {
    console.error('Error in /api/acuity/mapping:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data format', details: error.errors },
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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');

    if (!clientId) {
      return NextResponse.json(
        { error: 'Client ID is required' },
        { status: 400 }
      );
    }

    const acuityService = AcuityService.getInstance();
    const client = await acuityService.getClientById(clientId);
    const mappedData = acuityService.mapClientData(client);

    return NextResponse.json({
      data: mappedData,
      message: 'Client data retrieved and mapped successfully'
    });
  } catch (error) {
    console.error('Error in /api/acuity/mapping:', error);

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