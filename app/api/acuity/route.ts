import { NextResponse } from 'next/server';
import fetch from 'node-fetch';

const ACUITY_USER_ID = process.env.ACUITY_USER_ID;
const ACUITY_API_KEY = process.env.ACUITY_API_KEY;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search') || '';

  try {
    const response = await fetch('https://acuityscheduling.com/api/v1/clients', {
      headers: {
        'Authorization': 'Basic ' + Buffer.from(`${ACUITY_USER_ID}:${ACUITY_API_KEY}`).toString('base64')
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch clients from Acuity');
    }

    const clients = await response.json();

    const filteredClients = clients.filter((client: any) => 
      client.firstName.toLowerCase().includes(search.toLowerCase()) ||
      client.lastName.toLowerCase().includes(search.toLowerCase())
    );

    return NextResponse.json(filteredClients);
  } catch (error) {
    console.error('Error fetching Acuity clients:', error);
    return NextResponse.json({ error: 'Failed to fetch clients' }, { status: 500 });
  }
}