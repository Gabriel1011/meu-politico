/**
 * Constantes da aplicação
 *
 * Centraliza todos os valores hardcoded para facilitar manutenção
 * e garantir consistência.
 */

/**
 * Caminhos de storage no Supabase Storage
 */
export const STORAGE_PATHS = {
  TICKETS: 'tickets',
  EVENTS: 'events',
  AVATARS: 'avatars',
  BANNERS: 'banners',
} as const

/**
 * Breakpoints para responsividade (alinhados com Tailwind)
 */
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const

/**
 * Valores padrão para formulários
 */
export const FORM_DEFAULTS = {
  DEFAULT_TIME: '09:00',
  DEFAULT_EVENT_DURATION_HOURS: 1,
  MAX_FILE_SIZE_MB: 5,
  MAX_FILES_UPLOAD: 5,
  MIN_PASSWORD_LENGTH: 8,
  MIN_TITLE_LENGTH: 5,
  MIN_DESCRIPTION_LENGTH: 20,
} as const

/**
 * Timeouts e delays (em milissegundos)
 */
export const TIMING = {
  TOAST_DURATION: 5000,
  TOAST_ERROR_DURATION: 7000,
  DEBOUNCE_DELAY: 300,
  POLLING_INTERVAL: 30000,
  REFETCH_INTERVAL: 60000,
} as const

/**
 * Limites de paginação
 */
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
  TICKETS_PER_PAGE: 20,
  EVENTS_PER_PAGE: 12,
  COMMENTS_PER_PAGE: 50,
} as const

/**
 * Formatos de data para date-fns
 */
export const DATE_FORMATS = {
  DATE: 'dd/MM/yyyy',
  DATE_TIME: 'dd/MM/yyyy HH:mm',
  TIME: 'HH:mm',
  MONTH_YEAR: 'MMMM yyyy',
  FULL_DATE: "d 'de' MMMM 'de' yyyy",
  FULL_DATE_TIME: "d 'de' MMMM 'de' yyyy 'às' HH:mm",
  ISO_DATE: 'yyyy-MM-dd',
} as const

/**
 * Regex patterns para validação
 */
export const PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_BR: /^\(?[1-9]{2}\)? ?(?:[2-8]|9[0-9])[0-9]{3}-?[0-9]{4}$/,
  CPF: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
  CNPJ: /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/,
} as const

/**
 * URLs/Rotas da aplicação
 */
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/cadastro',
  DASHBOARD: '/painel',
  TICKETS: '/painel/ocorrencias',
  NEW_TICKET: '/painel/ocorrencias/nova',
  EVENTS: '/painel/agenda',
  NOTIFICATIONS: '/painel/notificacoes',
  PROFILE: '/painel/perfil',
} as const

/**
 * Meta tags da aplicação
 */
export const META = {
  SITE_NAME: 'Meu Político',
  SITE_DESCRIPTION: 'Conectando cidadãos e vereadores',
  SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
} as const

/**
 * Configurações de cache (TanStack Query)
 */
export const CACHE = {
  STALE_TIME: 30 * 1000, // 30 segundos
  GC_TIME: 5 * 60 * 1000, // 5 minutos
  RETRY_ATTEMPTS: 1,
} as const

/**
 * Tipos de notificação
 */
export const NOTIFICATION_TYPES = {
  TICKET_CREATED: 'ticket_created',
  TICKET_UPDATED: 'ticket_updated',
  TICKET_COMMENTED: 'ticket_commented',
  EVENT_CREATED: 'event_created',
  EVENT_UPDATED: 'event_updated',
} as const

/**
 * Configurações de upload
 */
export const UPLOAD = {
  ACCEPTED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  ACCEPTED_IMAGE_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.webp', '.gif'],
  MAX_IMAGE_SIZE_BYTES: 5 * 1024 * 1024, // 5MB
  MAX_IMAGES_PER_TICKET: 5,
} as const
