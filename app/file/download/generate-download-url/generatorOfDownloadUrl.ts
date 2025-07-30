import path from 'path';
import { storageInstance } from '../../storage';

const bucketName = process.env.GOOGLE_CLOUD_BUCKET_NAME;
const bucket = storageInstance.bucket(bucketName || '');

export const generateUrl = async (params: { fileUrl: string }) => {
  const { fileUrl } = params;
  const url = new URL(fileUrl);
  const filename = path.basename(url.pathname);
  const file = bucket.file(filename);
  const [exists] = await file.exists();
  if (!exists) return undefined;
  const [downloadUrl] = await file.getSignedUrl({
    version: 'v4',
    action: 'read',
    expires: Date.now() + 1000 * 60 * 60
  });
  return downloadUrl;
};
