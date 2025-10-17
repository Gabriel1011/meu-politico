export interface TicketLocation {
  cep?: string | null
  logradouro?: string | null
  complemento?: string | null
  bairro?: string | null
  cidade?: string | null
  estado?: string | null
}

const sanitize = (value: unknown) =>
  typeof value === 'string' ? value.trim() : ''

export function formatTicketLocation(location: unknown): string | null {
  if (!location || typeof location !== 'object') return null

  const casted = location as TicketLocation

  const logradouro = sanitize(casted.logradouro)
  const complemento = sanitize(casted.complemento)
  const bairro = sanitize(casted.bairro)
  const cidade = sanitize(casted.cidade)
  const estado = sanitize(casted.estado)
  const cep = sanitize(casted.cep)

  const streetPart = [logradouro, complemento, bairro].filter(Boolean).join(', ')
  const cityPart = [cidade, estado].filter(Boolean).join(' / ')
  const cepPart = cep ? `CEP ${cep}` : ''

  const parts = [streetPart, cityPart, cepPart].filter(Boolean)

  if (parts.length === 0) return null

  return parts.join(' • ')
}

export function buildLocationAddress(location: unknown): string | null {
  if (!location || typeof location !== 'object') return null

  const casted = location as TicketLocation

  const parts = [
    sanitize(casted.logradouro),
    sanitize(casted.complemento),
    sanitize(casted.bairro),
    sanitize(casted.cidade),
    sanitize(casted.estado),
    sanitize(casted.cep),
  ].filter(Boolean)

  if (parts.length === 0) return null

  return parts.join(', ')
}
