import { v4 as uuidv4 } from 'uuid';
import path from 'path';

interface UploaderParams {
  urlOrFile: string | File;
  setIsUploading: (value: React.SetStateAction<boolean>) => void;
  setUploadProgress: React.Dispatch<React.SetStateAction<number>>;
}

export const uploader = async (params: UploaderParams): Promise<string> => {
  const { urlOrFile, setIsUploading, setUploadProgress } = params;
  return new Promise<string>((resolve, reject) => {
    const uploadFile = async (file: File) => {
      try {
        setIsUploading(true);
        const filename = `${uuidv4()}${path.extname(file.name)}`;
        const generateUrlResponse = await fetch(
          `/file/upload/direct-bucket?filename=${encodeURIComponent(
            filename
          )}&fileType=${encodeURIComponent(file.type)}`,
          { method: 'GET' }
        );
        if (!generateUrlResponse.ok) {
          const errorData = await generateUrlResponse.json();
          throw new Error(errorData.error || 'Erro ao gerar URL de upload');
        }
        const { uploadUrl, fileUrl } = await generateUrlResponse.json();
        if (!uploadUrl || !fileUrl)
          throw new Error('URL pré-assinada não recebida');
        const xhr = new XMLHttpRequest();
        xhr.open('PUT', uploadUrl, true);
        xhr.setRequestHeader('Content-Type', file.type);
        const throttle = (callback: Function, limit: number) => {
          let waiting = false;
          return (progress: number) => {
            if (!waiting) {
              callback(progress);
              waiting = true;
              setTimeout(() => {
                waiting = false;
              }, limit);
            }
          };
        };
        const updateProgress = throttle(
          (progress: number) => setUploadProgress(progress),
          100
        );
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percentComplete = (event.loaded / event.total) * 100;
            updateProgress(percentComplete);
          }
        };
        xhr.onload = () => {
          if (xhr.status === 200 || xhr.status === 201) {
            setUploadProgress(100);
            resolve(fileUrl);
          } else
            reject(new Error('Erro ao enviar arquivo para o armazenamento'));
        };
        xhr.onerror = () => {
          reject(new Error('Erro de rede durante o upload'));
        };
        xhr.send(file);
      } catch (error) {
        setIsUploading(false);
        reject(error);
      }
    };
    if (typeof urlOrFile === 'string') resolve(urlOrFile);
    else if (urlOrFile instanceof File) uploadFile(urlOrFile);
    else reject(new Error('Tipo de arquivo inválido'));
  });
};

export const uploadBlob = async (
  blob: Blob,
  filename: string,
  fileType: 'image/png'
): Promise<string> => {
  const generateUrlResponse = await fetch(
    `/file/upload/direct-bucket?filename=${encodeURIComponent(
      filename
    )}&fileType=${encodeURIComponent(fileType)}`,
    { method: 'GET' }
  );
  if (!generateUrlResponse.ok) {
    const errorData = await generateUrlResponse.json();
    throw new Error(errorData.error || 'Erro ao gerar URL de upload');
  }
  const { uploadUrl, fileUrl } = await generateUrlResponse.json();
  if (!uploadUrl || !fileUrl) throw new Error('URL pré-assinada não recebida');
  const putRes = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': fileType
    },
    body: blob
  });
  if (!putRes.ok) {
    console.error('Falha ao fazer upload do blob no GCS');
    throw new Error('Erro ao enviar arquivo para o armazenamento');
  }
  return fileUrl;
};
