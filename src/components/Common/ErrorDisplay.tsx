import React from 'react'
import { AlertCircle, X, CheckCircle, AlertTriangle, Info } from 'lucide-react'

interface ErrorDisplayProps {
  title?: string
  message: string
  type?: 'error' | 'warning' | 'success' | 'info'
  onDismiss?: () => void
  className?: string
}

export function ErrorDisplay({ 
  title, 
  message, 
  type = 'error', 
  onDismiss, 
  className = '' 
}: ErrorDisplayProps) {
  const getIcon = () => {
    switch (type) {
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0" />
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
      case 'info':
        return <Info className="w-5 h-5 text-blue-500 flex-shrink-0" />
      default:
        return <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
    }
  }

  const getStyles = () => {
    switch (type) {
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800'
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800'
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800'
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800'
      default:
        return 'bg-red-50 border-red-200 text-red-800'
    }
  }

  return (
    <div className={`rounded-lg border p-4 ${getStyles()} ${className}`}>
      <div className="flex items-start">
        {getIcon()}
        <div className="ml-3 flex-1">
          {title && (
            <h3 className="text-sm font-medium mb-1">
              {title}
            </h3>
          )}
          <p className="text-sm">
            {message}
          </p>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="ml-auto flex-shrink-0 p-1 rounded-md hover:bg-black hover:bg-opacity-10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  )
}