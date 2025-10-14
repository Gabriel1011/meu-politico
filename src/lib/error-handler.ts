import type { PostgrestError } from '@supabase/supabase-js'
import type { StorageError } from '@supabase/storage-js'

/**
 * Classe base para erros da aplicação
 */
export class AppError extends Error {
  constructor(
    message: string,
    public userMessage: string,
    public code?: string,
    public statusCode?: number
  ) {
    super(message)
    this.name = 'AppError'
  }
}

/**
 * Erro de validação (campos inválidos, regras de negócio)
 */
export class ValidationError extends AppError {
  constructor(message: string, userMessage: string) {
    super(message, userMessage, 'VALIDATION_ERROR', 400)
    this.name = 'ValidationError'
  }
}

/**
 * Erro de autenticação (não está logado)
 */
export class AuthenticationError extends AppError {
  constructor(message: string = 'Não autenticado') {
    super(
      message,
      'Você precisa estar autenticado para continuar',
      'AUTH_ERROR',
      401
    )
    this.name = 'AuthenticationError'
  }
}

/**
 * Erro de autorização (não tem permissão)
 */
export class AuthorizationError extends AppError {
  constructor(message: string = 'Sem permissão') {
    super(
      message,
      'Você não tem permissão para realizar esta ação',
      'AUTHZ_ERROR',
      403
    )
    this.name = 'AuthorizationError'
  }
}

/**
 * Erro de recurso não encontrado
 */
export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(
      `${resource} not found`,
      `${resource} não encontrado`,
      'NOT_FOUND',
      404
    )
    this.name = 'NotFoundError'
  }
}

/**
 * Mapeia erros de Storage do Supabase para mensagens amigáveis
 *
 * @param error - Erro retornado pelo Supabase Storage
 * @returns AppError com mensagem amigável
 */
export function handleStorageError(error: StorageError): AppError {
  // Erro de arquivo muito grande
  if (error.message.includes('payload too large') || error.message.includes('file size')) {
    return new ValidationError(
      error.message,
      'Arquivo muito grande. O tamanho máximo permitido é 5MB.'
    )
  }

  // Erro de tipo de arquivo não permitido
  if (error.message.includes('invalid file type')) {
    return new ValidationError(
      error.message,
      'Tipo de arquivo não permitido. Use apenas imagens (JPG, PNG).'
    )
  }

  // Erro genérico de storage
  return new AppError(
    error.message,
    'Erro ao fazer upload do arquivo. Tente novamente.',
    'STORAGE_ERROR',
    500
  )
}

/**
 * Mapeia erros do Supabase/PostgreSQL para mensagens amigáveis
 *
 * @param error - Erro retornado pelo Supabase
 * @returns AppError com mensagem amigável
 *
 * @example
 * const { error } = await supabase.from('tickets').insert(data)
 * if (error) {
 *   throw handleSupabaseError(error)
 * }
 */
export function handleSupabaseError(error: PostgrestError): AppError {
  // Erros de autenticação
  if (error.code === 'PGRST301') {
    return new AuthenticationError()
  }

  // Erros de autorização (RLS)
  if (
    error.code === '42501' ||
    error.message.includes('row-level security') ||
    error.message.includes('permission denied')
  ) {
    return new AuthorizationError()
  }

  // Violação de constraint única (duplicate key)
  if (error.code === '23505') {
    return new AppError(
      error.message,
      'Este registro já existe no sistema',
      'UNIQUE_VIOLATION',
      409
    )
  }

  // Violação de foreign key (registro relacionado não existe)
  if (error.code === '23503') {
    return new AppError(
      error.message,
      'Registro relacionado não encontrado',
      'FOREIGN_KEY_VIOLATION',
      400
    )
  }

  // Not null violation (campo obrigatório vazio)
  if (error.code === '23502') {
    return new ValidationError(
      error.message,
      'Campos obrigatórios não foram preenchidos'
    )
  }

  // Check constraint violation
  if (error.code === '23514') {
    return new ValidationError(
      error.message,
      'Dados inválidos. Verifique os valores informados.'
    )
  }

  // Erro genérico do Supabase
  return new AppError(
    error.message,
    'Ocorreu um erro ao processar sua solicitação. Tente novamente.',
    error.code,
    500
  )
}

/**
 * Loga erro e retorna AppError adequado
 *
 * @param error - Erro capturado
 * @param context - Contexto adicional (componente, função, etc)
 * @returns AppError com mensagem amigável
 *
 * @example
 * try {
 *   await createTicket(data)
 * } catch (err) {
 *   const error = logError(err, 'TicketForm.handleSubmit')
 *   toast.error(error.userMessage)
 * }
 */
export function logError(error: unknown, context?: string): AppError {
  const timestamp = new Date().toISOString()

  // Se já é um AppError, apenas loga e retorna
  if (error instanceof AppError) {
    if (process.env.NODE_ENV === 'development') {
      console.error(`[${timestamp}] ${context}:`, {
        name: error.name,
        message: error.message,
        userMessage: error.userMessage,
        code: error.code,
        statusCode: error.statusCode,
      })
    }
    return error
  }

  // Se é um Error genérico
  if (error instanceof Error) {
    if (process.env.NODE_ENV === 'development') {
      console.error(`[${timestamp}] ${context}:`, {
        name: error.name,
        message: error.message,
        stack: error.stack,
      })
    }

    return new AppError(
      error.message,
      'Ocorreu um erro inesperado. Tente novamente.',
      'UNKNOWN_ERROR',
      500
    )
  }

  // Erro desconhecido
  if (process.env.NODE_ENV === 'development') {
    console.error(`[${timestamp}] ${context}:`, error)
  }

  return new AppError(
    'Unknown error',
    'Ocorreu um erro inesperado. Tente novamente.',
    'UNKNOWN_ERROR',
    500
  )
}

/**
 * Verifica se um erro é de um tipo específico
 *
 * @example
 * if (isErrorType(error, AuthenticationError)) {
 *   router.push('/login')
 * }
 */
export function isErrorType<T extends AppError>(
  error: unknown,
  errorType: new (...args: any[]) => T
): error is T {
  return error instanceof errorType
}
