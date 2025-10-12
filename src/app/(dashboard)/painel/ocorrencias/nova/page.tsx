import { TicketForm } from '@/components/tickets/ticket-form'
import Link from 'next/link'

export const metadata = {
  title: 'Nova Ocorrência - Meu Político',
  description: 'Criar nova ocorrência',
}

export default function NovaOcorrenciaPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link
          href="/painel/ocorrencias"
          className="text-sm text-primary hover:underline"
        >
          ← Voltar para ocorrências
        </Link>
        <h1 className="mt-4 text-3xl font-bold">Nova Ocorrência</h1>
        <p className="text-muted-foreground">
          Descreva o problema ou demanda que você gostaria de reportar
        </p>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <TicketForm />
      </div>
    </div>
  )
}
