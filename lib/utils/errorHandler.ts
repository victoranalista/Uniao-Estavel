interface ErrorResponse {
  success: false;
  message: string;
}

const getErrorMessage = (error: unknown): string => {
  if (typeof error === 'object' && error !== null && 'message' in error) {
    return (error as { message: string }).message;
  }
  return 'Erro interno do servidor';
};

export const handleActionError = (error: unknown): ErrorResponse => ({
  success: false,
  message: getErrorMessage(error)
});

export const handleValidationError = (field: string): ErrorResponse => ({
  success: false,
  message: `${field} é obrigatório`
});

export const handleUnauthorizedError = (): ErrorResponse => ({
  success: false,
  message: 'Acesso não autorizado'
});

export const handleNotFoundError = (resource: string): ErrorResponse => ({
  success: false,
  message: `${resource} não encontrado`
});
