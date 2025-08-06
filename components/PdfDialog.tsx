'use client';
import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Document, Page, pdfjs } from 'react-pdf';
import { Button } from '@/components/ui/button';
import { Eye, ZoomIn, ZoomOut } from 'lucide-react';
import Image from 'next/image';

interface PdfDialogProps {
  fileUrl: string;
}

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'public/pdf.worker.min.mjs',
  import.meta.url
).toString();

const PdfDialog: React.FC<PdfDialogProps> = ({ fileUrl }) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [zoom, setZoom] = useState<number>(0.45);
  const [isPdf, setIsPdf] = useState<boolean>(true);

  useEffect(() => {
    const ext = fileUrl.split('.').pop()?.toLowerCase() ?? '';
    setIsPdf(ext === 'pdf');
  }, [fileUrl]);

  useEffect(() => {
    const handleResize = () => {
      const screenWidth = window.innerWidth;
      if (screenWidth < 400) setZoom(0.45);
      else if (screenWidth < 640) setZoom(0.6);
      else if (screenWidth < 1024) setZoom(0.8);
      else setZoom(1);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) =>
    setNumPages(numPages);
  const zoomIn = () => setZoom((prevZoom) => Math.min(prevZoom + 0.1, 2));
  const zoomOut = () => setZoom((prevZoom) => Math.max(prevZoom - 0.1, 0.5));

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost">
          <Eye className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex-col items-center">
            Arquivo
            {isPdf && (
              <>
                <Button onClick={zoomOut} variant="ghost">
                  <ZoomOut className="size-5" />
                </Button>
                <Button onClick={zoomIn} variant="ghost">
                  <ZoomIn className="size-5" />
                </Button>
              </>
            )}
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center overflow-auto max-h-[80vh]">
          {isPdf ? (
            <Document
              file={fileUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              className="flex flex-col items-center gap-4"
            >
              {numPages &&
                Array.from(new Array(numPages), (_, index) => (
                  <Page
                    key={`page_${index + 1}`}
                    pageNumber={index + 1}
                    scale={zoom}
                  />
                ))}
            </Document>
          ) : (
            <Image
              src={fileUrl}
              alt="Visualização do anexo"
              width={800}
              height={600}
              className="max-h-[75vh] w-auto object-contain"
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PdfDialog;
