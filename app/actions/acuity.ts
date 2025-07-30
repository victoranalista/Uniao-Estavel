"use server";
import { requireSession } from "@/lib/requireSession";
import { z } from "zod";

const searchSchema = z.object({
  search: z.string().min(3).max(100)
});

const clientIdSchema = z.object({
  clientId: z.string().min(1)
});

export async function searchAcuityClients(search: string) {
  await requireSession();
  
  const { search: validatedSearch } = searchSchema.parse({ search });
  
  try {
    const response = await fetch(`${process.env.ACUITY_API_URL}/clients?search=${encodeURIComponent(validatedSearch)}`, {
      headers: {
        'Authorization': `Bearer ${process.env.ACUITY_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store'
    });

    if (!response.ok) throw new Error('Failed to fetch clients');

    const data = await response.json();
    return { success: true, data: data.data || [] };
  } catch (error) {
    console.error('Error fetching clients:', error);
    return { success: false, error: 'Erro ao buscar clientes do Acuity' };
  }
}

export async function getAcuityClientMapping(clientId: string) {
  await requireSession();
  
  const { clientId: validatedClientId } = clientIdSchema.parse({ clientId });
  
  try {
    const response = await fetch(`${process.env.ACUITY_API_URL}/mapping?clientId=${validatedClientId}`, {
      headers: {
        'Authorization': `Bearer ${process.env.ACUITY_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store'
    });

    if (!response.ok) throw new Error('Failed to fetch client details');

    const data = await response.json();
    return { success: true, data: data.data };
  } catch (error) {
    console.error('Error fetching client details:', error);
    return { success: false, error: 'Erro ao importar dados do cliente' };
  }
}