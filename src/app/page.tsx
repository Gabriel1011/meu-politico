export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <h1 className="text-4xl font-bold">Meu Político</h1>
      </div>

      <div className="mt-16 text-center">
        <p className="text-xl text-muted-foreground">
          Plataforma que conecta vereadores e cidadãos de forma transparente
        </p>
        <div className="mt-8 flex gap-4 justify-center">
          <a
            href="/login"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Acessar Plataforma
          </a>
        </div>
      </div>
    </main>
  )
}
