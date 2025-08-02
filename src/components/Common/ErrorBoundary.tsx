import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: ErrorInfo
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    // Aggiorna lo state per mostrare l'UI di fallback
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Registra l'errore per il debugging
    console.error('ErrorBoundary ha catturato un errore:', error, errorInfo)
    
    this.setState({
      error,
      errorInfo
    })

    // Qui potresti inviare l'errore a un servizio di monitoraggio
    // come Sentry, LogRocket, etc.
    // Example: Sentry.captureException(error, { contexts: { react: { componentStack: errorInfo.componentStack } } })
  }

  handleReload = () => {
    window.location.reload()
  }

  handleGoHome = () => {
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-xl shadow-lg border border-gray-200 p-8 text-center">
            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="bg-red-100 p-4 rounded-full">
                <AlertTriangle className="h-12 w-12 text-red-600" />
              </div>
            </div>

            {/* Title */}
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Oops! Qualcosa è andato storto
            </h1>

            {/* Description */}
            <p className="text-gray-600 mb-6">
              Si è verificato un errore imprevisto nell'applicazione. 
              Ci scusiamo per l'inconveniente.
            </p>

            {/* Error Details (only in development) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">
                  Dettagli errore (solo in sviluppo):
                </h3>
                <pre className="text-xs text-red-600 overflow-auto max-h-32">
                  {this.state.error.toString()}
                </pre>
                {this.state.errorInfo && (
                  <details className="mt-2">
                    <summary className="text-xs text-gray-600 cursor-pointer">
                      Stack trace
                    </summary>
                    <pre className="text-xs text-gray-500 mt-1 overflow-auto max-h-32">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={this.handleReload}
                className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Ricarica Pagina</span>
              </button>
              
              <button
                onClick={this.handleGoHome}
                className="flex items-center justify-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <Home className="w-4 h-4" />
                <span>Torna alla Home</span>
              </button>
            </div>

            {/* Support Info */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Se il problema persiste, contatta il supporto tecnico
              </p>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}