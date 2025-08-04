import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DeclarationSearchResult } from "../types";
import { formatDate, formatPropertyRegime } from "../utils";

interface DeclarationCardProps {
  declaration: DeclarationSearchResult;
  onSelect: (declarationId: string) => void;
}

export const DeclarationCard = ({ declaration, onSelect }: DeclarationCardProps) => {
  const participants = declaration.participants;
  const firstPerson = participants[0]?.person?.identity?.fullName || '';
  const secondPerson = participants[1]?.person?.identity?.fullName || '';

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="text-lg">
            {firstPerson} e {secondPerson}
          </span>
          <Badge variant="outline">
            {declaration.protocolNumber}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">Data da União:</span>
            <p>{formatDate(declaration.unionStartDate)}</p>
          </div>
          <div>
            <span className="font-medium">Regime de Bens:</span>
            <p>{formatPropertyRegime(declaration.propertyRegime)}</p>
          </div>
        </div>
        <div className="text-sm">
          <span className="font-medium">Registrador:</span>
          <p>{declaration.registryInfo?.registrarName}</p>
        </div>
        <Button 
          onClick={() => onSelect(declaration.id)}
          className="w-full"
        >
          Gerar Segunda Via
        </Button>
      </CardContent>
    </Card>
  );
};