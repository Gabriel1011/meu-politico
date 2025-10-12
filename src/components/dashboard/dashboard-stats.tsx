import { createClient } from '@/lib/supabase/server'

interface DashboardStatsProps {
  tenantId: string
  role: string
}

export async function DashboardStats({ tenantId, role }: DashboardStatsProps) {
  const supabase = await createClient()

  // Buscar estatísticas
  const [
    { count: totalTickets },
    { count: ticketsAbertas },
    { count: ticketsResolvidas },
    { count: ticketsMes },
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

  const stats = [
    {
      name: 'Total de Ocorrências',
      value: totalTickets || 0,
      icon: '📝',
    },
    {
      name: 'Abertas',
      value: ticketsAbertas || 0,
      icon: '🔓',
    },
    {
      name: 'Resolvidas',
      value: ticketsResolvidas || 0,
      icon: '✅',
    },
    {
      name: 'Este Mês',
      value: ticketsMes || 0,
      icon: '📅',
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.name}
          className="rounded-lg border bg-white p-6 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-600">{stat.name}</p>
            <span className="text-2xl">{stat.icon}</span>
          </div>
          <p className="mt-2 text-3xl font-bold">{stat.value}</p>
        </div>
      ))}
    </div>
  )
}
