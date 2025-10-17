import { CalendarDays } from 'lucide-react'

interface PublicAgendaHeaderProps {
  tenantName: string
  tenantLogo?: string | null
}

export function PublicAgendaHeader({
  tenantName,
  tenantLogo,
}: PublicAgendaHeaderProps) {
  return (
    <div className="relative overflow-hidden">
      <div className="relative bg-gradient-to-br from-primary via-primary/90 to-primary/80">
        <div className="container relative mx-auto px-4 py-16 sm:py-20 lg:py-24">
          <div className="flex flex-col items-center text-center">
            {tenantLogo ? (
              <div className="mb-6 rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
                <img
                  src={tenantLogo}
                  alt={tenantName}
                  className="h-16 w-auto sm:h-20 lg:h-24"
                />
              </div>
            ) : (
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-white/10 text-3xl font-bold text-white backdrop-blur-sm sm:h-24 sm:w-24 sm:text-4xl">
                {tenantName.charAt(0)}
              </div>
            )}

            <h1 className="mb-4 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              {tenantName}
            </h1>

            <div className="flex items-center gap-2 text-lg text-white/90 sm:text-xl">
              <CalendarDays className="h-5 w-5" />
              <p>Agenda Pública de Eventos</p>
            </div>

            <p className="mt-4 max-w-2xl text-base text-white/80 sm:text-lg">
              Acompanhe todos os compromissos, audiências públicas e eventos do
              mandato
            </p>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg
            className="w-full text-background"
            viewBox="0 0 1440 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
          >
            <path
              d="M0 48h1440V0S1140 48 720 48 0 0 0 0v48z"
              fill="currentColor"
            />
          </svg>
        </div>
      </div>
    </div>
  )
}
