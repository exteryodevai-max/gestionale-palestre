import React, { useState } from 'react'
import { Dumbbell, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { createTestUser } from '../../utils/createTestUser'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const { signIn, loading } = useAuth()

  const handleCreateTestUser = async () => {
    setError('')
    console.log('🔄 Creating test user...')
    
    const result = await createTestUser()
    if (result.success) {
      setError('')
      alert('✅ Utente test creato con successo! Ora puoi fare login con patrick.cioni@admin.com / admin123')
    } else {
      setError(`Errore nella creazione utente: ${result.error}`)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!email || !password) {
      setError('Email e password sono obbligatori')
      return
    }

    console.log('Login attempt with:', email)

    const result = await signIn(email, password)
    if (!result.success) {
      let errorMessage = result.error || 'Errore durante il login'
      
      // Translate common Supabase errors to Italian
      if (errorMessage.includes('Invalid login credentials')) {
        errorMessage = 'Credenziali non valide. Verifica email e password.'
      } else if (errorMessage.includes('Email not confirmed')) {
        errorMessage = 'Email non confermata. Controlla la tua casella di posta.'
      } else if (errorMessage.includes('Too many requests')) {
        errorMessage = 'Troppi tentativi di login. Riprova tra qualche minuto.'
      }
      
      console.error('Login failed:', errorMessage)
      setError(errorMessage)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Logo and Header */}
        <div className="text-center">
          <div className="flex justify-center">
            <div className="bg-blue-600 p-3 rounded-full">
              <Dumbbell className="h-8 w-8 text-white" />
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">GymManager</h2>
          <p className="mt-2 text-sm text-gray-600">
            Accedi al pannello di gestione
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white py-8 px-6 shadow-lg rounded-xl border border-gray-200">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Inserisci la tua email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none relative block w-full px-3 py-2 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Inserisci la password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Accesso in corso...
                  </div>
                ) : (
                  'Accedi'
                )}
              </button>
            </div>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
            <p className="text-sm text-green-800 font-medium mb-2">✅ Autenticazione Bypassata</p>
            <p className="text-xs text-green-700">
              L'app è configurata per accesso diretto come <strong>Patrick Cioni (Admin)</strong>.<br/>
              Inserisci qualsiasi email e password per entrare.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          <p>Sistema di gestione palestre professionale</p>
        </div>
      </div>
    </div>
  )
}