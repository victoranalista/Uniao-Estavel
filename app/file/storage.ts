import { Storage } from '@google-cloud/storage';

export const storageInstance = new Storage({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  credentials: JSON.parse(
    Buffer.from(
      process.env.GOOGLE_CLOUD_SERVICE_ACCOUNT_KEY || '',
      'base64'
    ).toString('utf-8')
  )
});
