'use server';
import { storageInstance } from '../../storage';
import { z } from 'zod';

const bucketName = process.env.GOOGLE_CLOUD_BUCKET_NAME;
const bucket = storageInstance.bucket(bucketName || '');
const uploadUrlSchema = z.object({
  filename: z.string().min(1, 'Nome do arquivo é obrigatório'),
  fileType: z.string().min(1, 'Tipo do arquivo é obrigatório')
});

type UploadUrlResult =
  | {
      success: true;
      data: {
        uploadUrl: string;
        fileUrl: string;
      };
    }
  | {
      success: false;
      error: string;
    };

export async function generateUploadUrl(
  filename: string,
  fileType: string
): Promise<UploadUrlResult> {
  try {
    const validation = uploadUrlSchema.safeParse({ filename, fileType });
    if (!validation.success)
      return {
        success: false,
        error:
          'Parâmetros filename e fileType são necessários e devem ser válidos'
      };
    if (!bucketName)
      return {
        success: false,
        error: 'Configuração do bucket não encontrada'
      };
    const file = bucket.file(filename);
    const [uploadUrl] = await file.getSignedUrl({
      version: 'v4',
      action: 'write',
      contentType: fileType,
      expires: Date.now() + 1000 * 60 * 60
    });
    const fileUrl = `https://storage.googleapis.com/${bucket.name}/${filename}`;
    return {
      success: true,
      data: {
        uploadUrl,
        fileUrl
      }
    };
  } catch (error) {
    console.error('ERROR: Could not generate pre-signed url:', error);
    return {
      success: false,
      error: 'Erro interno do servidor ao gerar URL pré-assinada'
    };
  }
}

export async function generateUploadUrlFromForm(
  formData: FormData
): Promise<UploadUrlResult> {
  const filename = formData.get('filename') as string;
  const fileType = formData.get('fileType') as string;
  return generateUploadUrl(filename, fileType);
}
