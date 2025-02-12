"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import Image from 'next/image';

interface LoginResponse {
  success: boolean;
  message: string;
}

export default function Login() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData(e.currentTarget);
      const username = formData.get('username')?.toString().trim();
      const password = formData.get('password')?.toString().trim();

      if (!username || !password) {
        throw new Error('Usuário e senha são obrigatórios');
      }

      // For development, skip the API call and redirect directly
      // This simulates a successful login while the backend is being set up
      router.push('/dashboard');
      return;

      /* Commented out until backend is ready
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json() as LoginResponse;

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao fazer login');
      }

      if (data.success) {
        router.push('/dashboard');
      } else {
        throw new Error(data.message);
      }
      */
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao fazer login';
      console.error('Login error:', errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black to-black flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="w-32 h-32 relative mb-4">
            <Image
              src="/logo.png"
              alt="Cartório Colorado Logo"
              fill
              className="object-contain"
            />
          </div>
          <h1 className="text-2xl font-bold text-black">Cartório Colorado</h1>
          <p className="text-gray-900">Sistema de Gerenciamento</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-white border-white text-white">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="username">Usuário</Label>
            <Input
              id="username"
              name="username"
              type="text"
              required
              className="w-full"
              placeholder="Digite seu usuário"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              className="w-full"
              placeholder="Digite sua senha"
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-gray-400 hover:bg-gray-700"
            disabled={isLoading}
          >
            {isLoading ? "Entrando..." : "Entrar"}
          </Button>
        </form>

        <p className="mt-4 text-sm text-black text-center">
          Sistema em desenvolvimento - Use qualquer usuário e senha para testar
        </p>
      </Card>
    </div>
  );
}