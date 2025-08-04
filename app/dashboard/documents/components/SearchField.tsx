import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SearchFieldProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}

export const SearchField = ({ 
  label, 
  placeholder, 
  value, 
  onChange, 
  type = "text" 
}: SearchFieldProps) => (
  <div className="space-y-2">
    <Label htmlFor={label.toLowerCase().replace(/\s+/g, '-')}>
      {label}
    </Label>
    <Input
      id={label.toLowerCase().replace(/\s+/g, '-')}
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);