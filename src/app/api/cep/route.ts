import { NextResponse } from 'next/server'

const CEP_REGEX = /^\d{8}$/

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const rawCep = searchParams.get('cep') || ''
  const cep = rawCep.replace(/\D/g, '')

  if (!CEP_REGEX.test(cep)) {
    return NextResponse.json(
      { error: 'Informe um CEP válido com 8 dígitos.' },
      { status: 400 }
    )
  }

  try {
    const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`, {
      cache: 'no-store',
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Não foi possível consultar o CEP no momento.' },
        { status: 503 }
      )
    }

    const data = await response.json()

    if (data?.erro) {
      return NextResponse.json(
        { error: 'CEP não encontrado. Verifique e tente novamente.' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      {
        cep: data.cep ?? cep,
        logradouro: data.logradouro ?? null,
        bairro: data.bairro ?? null,
        cidade: data.localidade ?? null,
        estado: data.uf ?? null,
      },
      {
        headers: {
          'Cache-Control': 'public, max-age=600',
        },
      }
    )
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro inesperado ao buscar o CEP.' },
      { status: 500 }
    )
  }
}
