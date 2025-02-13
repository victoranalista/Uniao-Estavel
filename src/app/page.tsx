import { DeclarationForm, type FormData } from "@/components/DeclarationForm";

export default function Home() {
  const handleSubmit = async (data: FormData) => {
    console.log("Dados enviados:", data); 
  };

  return (
    <main className="min-h-screen bg-gray-900 py-12">
      <DeclarationForm onSubmit={handleSubmit} />
    </main>
  );
}