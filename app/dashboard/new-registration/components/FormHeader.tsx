import { FileText } from 'lucide-react';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';

export const FormHeader = () => (
  <Card className="border-none bg-gradient-to-r from-primary/5 to-primary/10">
    <CardHeader className="text-center py-8">
      <div className="flex items-center justify-center mb-4">
        <div className="p-3 bg-primary/20 rounded-full">
          <FileText className="h-8 w-8 text-primary" />
        </div>
      </div>
      <CardTitle className="text-3xl font-semibold">
        Novo Registro de União Estável
      </CardTitle>
      <CardDescription className="text-lg mt-2">
        Preencha os dados para gerar a declaração
      </CardDescription>
    </CardHeader>
  </Card>
);