'use server';

import { requireSession } from '@/lib/requireSession';
import { Role } from '@prisma/client';
import { z } from 'zod';
import { ActionResult } from '@/types/declarations';

const searchSchema = z.object({
  search: z.string().min(3, 'Busca deve ter pelo menos 3 caracteres').max(100, 'Busca muito longa')
});

const clientIdSchema = z.object({
  clientId: z.string().min(1, 'ID do cliente é obrigatório')
});

const createAcuityHeaders = () => ({
  'Authorization': `Bearer ${process.env.ACUITY_API_TOKEN}`,
  'Content-Type': 'application/json',
});

const fetchAcuityData = async (url: string) => {
  const response = await fetch(url, {
    headers: createAcuityHeaders(),
    cache: 'no-store'
  });
  if (!response.ok) throw new Error('API request failed');
  return await response.json();
};

export const searchAcuityClientsAction = async (search: string): Promise<ActionResult> => {
  try {
    await requireSession([Role.ADMIN, Role.USER]);
    const { search: validatedSearch } = searchSchema.parse({ search });
    const url = `${process.env.ACUITY_API_URL}/clients?search=${encodeURIComponent(validatedSearch)}`;
    const data = await fetchAcuityData(url);
    return { success: true, data: data.data || [] };
  } catch (error) {
    return { success: false, error: 'Erro ao buscar clientes do Acuity' };
  }
};

export const getAcuityClientMappingAction = async (clientId: string): Promise<ActionResult> => {
  try {
    await requireSession([Role.ADMIN, Role.USER]);
    const { clientId: validatedClientId } = clientIdSchema.parse({ clientId });
    const url = `${process.env.ACUITY_API_URL}/mapping?clientId=${validatedClientId}`;
    const data = await fetchAcuityData(url);
    return { success: true, data: data.data };
  } catch (error) {
    return { success: false, error: 'Erro ao importar dados do cliente' };
  }
};