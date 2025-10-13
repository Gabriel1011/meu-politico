import { createClient } from '@/lib/supabase/server'
import { Card } from '@/components/ui/card'
import { FileText, FolderOpen, CheckCircle2, Calendar } from 'lucide-react'

interface DashboardStatsProps {
  tenantId: string
  role: string
}

export async function DashboardStats({ tenantId, role }: DashboardStatsProps) {
  const supabase = await createClient()

  try {
    // Buscar estatísticas
    const [
      { count: totalTickets, error: totalError },
      { count: ticketsAbertas, error: abertasError },
      { count: ticketsResolvidas, error: resolvidasError },
      { count: ticketsMes, error: mesError },
    ] = await Promise.all([
    supabase
      .from('tickets')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', tenantId),
    supabase
      .from('tickets')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', tenantId)
      .in('status', ['nova', 'em_analise', 'em_andamento']),
    supabase
      .from('tickets')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', tenantId)
      .eq('status', 'resolvida'),
      supabase
        .from('tickets')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', tenantId)
        .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),
    ])

    // Check for errors
    if (totalError || abertasError || resolvidasError || mesError) {
      throw totalError || abertasError || resolvidasError || mesError
    }

    const stats = [
      {
        name: 'Total de Ocorrências',
        value: totalTickets || 0,
        Icon: FileText,
        color: 'text-blue-600',
      },
      {
        name: 'Abertas',
        value: ticketsAbertas || 0,
        Icon: FolderOpen,
        color: 'text-orange-600',
      },
      {
        name: 'Resolvidas',
        value: ticketsResolvidas || 0,
        Icon: CheckCircle2,
        color: 'text-green-600',
      },
      {
        name: 'Este Mês',
        value: ticketsMes || 0,
        Icon: Calendar,
        color: 'text-purple-600',
      },
    ]

    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.name} className="p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">{stat.name}</p>
              <stat.Icon className={`h-5 w-5 ${stat.color}`} />
            </div>
            <p className="mt-2 text-3xl font-bold">{stat.value}</p>
          </Card>
        ))}
      </div>
    )
  } catch (error) {
    console.error('DashboardStats error:', error)
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6 col-span-full">
          <p className="text-destructive">Erro ao carregar estatísticas</p>
        </Card>
      </div>
    )
  }
}
