import { NextResponse } from 'next/server';

// Make the route dynamic
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    // Basic validation
    if (!username || !password) {
      return NextResponse.json({
        success: false,
        message: 'Usuário e senha são obrigatórios'
      }, { status: 400 });
    }

    // Temporary: Accept any non-empty credentials for testing
    if (username.trim() && password.trim()) {
      return NextResponse.json({
        success: true,
        message: 'Login realizado com sucesso'
      });
    }

    return NextResponse.json({
      success: false,
      message: 'Credenciais inválidas'
    }, { status: 401 });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro interno do servidor';
    console.error('Login error:', errorMessage);
    
    return NextResponse.json({
      success: false,
      message: errorMessage
    }, { status: 500 });
  }
}