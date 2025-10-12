/**
 * Converte uma cor hexadecimal para o formato HSL
 * @param hex - Cor em formato hexadecimal (#RRGGBB)
 * @returns String no formato "H S% L%" (ex: "221.2 83.2% 53.3%")
 */
export function hexToHSL(hex: string): string {
  // Remove o # se existir
  hex = hex.replace(/^#/, '')

  // Converte para RGB
  const r = parseInt(hex.substring(0, 2), 16) / 255
  const g = parseInt(hex.substring(2, 4), 16) / 255
  const b = parseInt(hex.substring(4, 6), 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6
        break
      case g:
        h = ((b - r) / d + 2) / 6
        break
      case b:
        h = ((r - g) / d + 4) / 6
        break
    }
  }

  // Converte para graus e porcentagens
  h = Math.round(h * 360)
  s = Math.round(s * 100)
  const lPercent = Math.round(l * 100)

  return `${h} ${s}% ${lPercent}%`
}

/**
 * Calcula uma cor mais clara ou mais escura baseada na luminosidade
 * @param hex - Cor em formato hexadecimal
 * @param amount - Quantidade para ajustar (-100 a 100)
 * @returns Cor ajustada em formato HSL
 */
export function adjustLightness(hex: string, amount: number): string {
  hex = hex.replace(/^#/, '')

  const r = parseInt(hex.substring(0, 2), 16) / 255
  const g = parseInt(hex.substring(2, 4), 16) / 255
  const b = parseInt(hex.substring(4, 6), 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  let l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6
        break
      case g:
        h = ((b - r) / d + 2) / 6
        break
      case b:
        h = ((r - g) / d + 4) / 6
        break
    }
  }

  // Ajusta a luminosidade
  l = Math.max(0, Math.min(1, l + amount / 100))

  h = Math.round(h * 360)
  s = Math.round(s * 100)
  const lPercent = Math.round(l * 100)

  return `${h} ${s}% ${lPercent}%`
}

/**
 * Gera uma cor de foreground (texto) baseada na luminosidade da cor de fundo
 * @param hex - Cor de fundo em formato hexadecimal
 * @returns Cor de texto em formato HSL (branco ou preto)
 */
export function getForegroundColor(hex: string): string {
  hex = hex.replace(/^#/, '')

  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)

  // Calcula a luminosidade relativa (fórmula W3C)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255

  // Se a cor for clara, retorna preto; se for escura, retorna branco
  return luminance > 0.5 ? '222.2 47.4% 11.2%' : '210 40% 98%'
}

/**
 * Interface para as cores do tenant
 */
export interface TenantColors {
  primaria: string
  secundaria: string
}

/**
 * Gera as variáveis CSS para o tema do tenant
 */
export function generateThemeVariables(cores: TenantColors) {
  const primaryHSL = hexToHSL(cores.primaria)
  const primaryForeground = getForegroundColor(cores.primaria)
  const secondaryHSL = hexToHSL(cores.secundaria)

  return {
    '--primary': primaryHSL,
    '--primary-foreground': primaryForeground,
    '--secondary': secondaryHSL,
    '--accent': secondaryHSL,
  }
}
