import { SignupForm } from '@/components/auth/signup-form'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Cadastro - Meu Político',
  description: 'Crie sua conta',
}

export default function SignupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Meu Político
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Crie sua conta para começar
          </p>
        </div>
        <SignupForm />
      </div>
    </div>
  )
}
