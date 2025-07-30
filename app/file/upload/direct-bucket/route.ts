import { NextRequest, NextResponse } from 'next/server';
import { Storage } from '@google-cloud/storage';

const storageInstance = new Storage({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  credentials: JSON.parse(
    Buffer.from(
      process.env.GOOGLE_CLOUD_SERVICE_ACCOUNT_KEY || '',
      'base64'
    ).toString('utf-8')
  )
});

const bucketName = process.env.GOOGLE_CLOUD_BUCKET_NAME;
const bucket = storageInstance.bucket(bucketName || '');

export const GET = async (req: NextRequest) => {
  if (req.method !== 'GET')
    return NextResponse.json(
      { error: 'Método não permitido' },
      { status: 405 }
    );
  const { searchParams } = new URL(req.url);
  const filename = searchParams.get('filename');
  const fileType = searchParams.get('fileType');
  if (!filename || !fileType)
    return NextResponse.json(
      { error: 'Parâmetros filename e fileType são necessários' },
      { status: 400 }
    );
  const file = bucket.file(filename);
  try {
    const [uploadUrl] = await file.getSignedUrl({
      version: 'v4',
      action: 'write',
      contentType: fileType,
      expires: Date.now() + 1000 * 60 * 60
    });
    const [readUrl] = await file.getSignedUrl({
      version: 'v4',
      action: 'read',
      expires: Date.now() + 1000 * 60 * 15
    });
    return NextResponse.json({ uploadUrl, fileUrl: readUrl }, { status: 200 });
  } catch (error) {
    console.error('ERROR: Could not generate pre-signed url:', error);
    return NextResponse.json(
      { error: 'Erro ao gerar URL pré-assinada' },
      { status: 500 }
    );
  }
};
