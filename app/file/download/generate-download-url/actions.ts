'use server';
import { z } from 'zod';
import { generateUrl } from './generatorOfDownloadUrl';

const schema = z.object({
  fileUrl: z.string().url('URL inválida')
});

export type GenerateDownloadUrlInput = z.infer<typeof schema>;
export interface GenerateDownloadUrlResponse {
  downloadUrl: string;
}
export async function generateDownloadUrl(
  raw: GenerateDownloadUrlInput
): Promise<GenerateDownloadUrlResponse> {
  const { fileUrl } = schema.parse(raw);
  try {
    const downloadUrl = await generateUrl({ fileUrl });
    if (!downloadUrl) {
      throw new Error('Failed to generate download URL');
    }
    return { downloadUrl };
  } catch (err) {
    console.error('Erro ao gerar URL de download:', err);
    throw new Error('Failed to generate download URL');
  }
}
