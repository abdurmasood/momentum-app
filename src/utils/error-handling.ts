/**
 * Centralized Error Handling Utilities
 * 
 * Provides consistent error types, classification, and reporting
 * across the application with production-ready error management.
 */

/**
 * Application-specific error types for better error classification
 */
export enum ErrorType {
  SHADER_ERROR = 'SHADER_ERROR',
  THEME_ERROR = 'THEME_ERROR',
  PERFORMANCE_ERROR = 'PERFORMANCE_ERROR',
  COMPONENT_ERROR = 'COMPONENT_ERROR',
  INTERSECTION_OBSERVER_ERROR = 'INTERSECTION_OBSERVER_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  CONFIG_ERROR = 'CONFIG_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

/**
 * Error severity levels for prioritizing error handling
 */
export enum ErrorSeverity {
  LOW = 'low',        // Minor issues, graceful degradation possible
  MEDIUM = 'medium',  // Moderate issues, some functionality affected
  HIGH = 'high',      // Major issues, significant functionality lost
  CRITICAL = 'critical' // Critical issues, app potentially unusable
}

/**
 * Structured error information for consistent error reporting
 */
export interface ErrorInfo {
  type: ErrorType
  severity: ErrorSeverity
  message: string
  originalError?: Error
  component?: string
  timestamp: number
  userAgent?: string
  url?: string
  additionalContext?: Record<string, unknown>
}

/**
 * Custom application error class with enhanced metadata
 */
export class AppError extends Error {
  public readonly type: ErrorType
  public readonly severity: ErrorSeverity
  public readonly timestamp: number
  public readonly component?: string
  public readonly additionalContext?: Record<string, unknown>
  public readonly code: string
  public readonly fingerprint: string

  constructor(
    type: ErrorType,
    severity: ErrorSeverity,
    message: string,
    component?: string,
    additionalContext?: Record<string, unknown>
  ) {
    super(message)
    this.name = 'AppError'
    this.type = type
    this.severity = severity
    this.timestamp = Date.now()
    this.component = component
    this.additionalContext = additionalContext
    this.code = this.generateErrorCode(type, component)
    this.fingerprint = this.generateFingerprint(message, type, component)

    // Maintain proper stack trace in V8
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError)
    }
  }

  /**
   * Generate a unique error code for classification
   */
  private generateErrorCode(type: ErrorType, component?: string): string {
    const typeCode = type.split('_')[0].substring(0, 3).toUpperCase()
    const componentCode = component ? 
      component.replace(/[^A-Z]/g, '').substring(0, 3) || 'UNK' : 
      'GEN'
    const timestamp = Date.now().toString().slice(-4)
    return `${typeCode}-${componentCode}-${timestamp}`
  }

  /**
   * Generate error fingerprint for grouping similar errors
   */
  private generateFingerprint(message: string, type: ErrorType, component?: string): string {
    // Create a stable hash-like identifier for error grouping
    const normalizedMessage = message.toLowerCase()
      .replace(/\d+/g, 'N')  // Replace numbers with N
      .replace(/['"]/g, '')   // Remove quotes
      .replace(/\s+/g, '_')   // Replace spaces with underscores
    
    const parts = [
      type,
      component || 'unknown',
      normalizedMessage.substring(0, 20)
    ].join('|')
    
    // Simple hash for fingerprinting
    let hash = 0
    for (let i = 0; i < parts.length; i++) {
      const char = parts.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16).substring(0, 8)
  }

  /**
   * Convert to structured error info
   */
  toErrorInfo(): ErrorInfo {
    return {
      type: this.type,
      severity: this.severity,
      message: this.message,
      originalError: this,
      component: this.component,
      timestamp: this.timestamp,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      additionalContext: this.additionalContext
    }
  }
}

/**
 * Error classification patterns with regex for better matching
 */
const ERROR_PATTERNS = {
  [ErrorType.SHADER_ERROR]: {
    patterns: [
      /webgl/i,
      /shader/i,
      /meshgradient/i,
      /gl_/i,
      /vertex/i,
      /fragment/i,
      /texture/i,
      /framebuffer/i,
      /context lost/i
    ],
    severity: ErrorSeverity.MEDIUM
  },
  [ErrorType.THEME_ERROR]: {
    patterns: [
      /theme/i,
      /css variable/i,
      /color/i,
      /style/i,
      /--[\w-]+/i, // CSS custom properties
      /rgb|hsl|hex/i
    ],
    severity: ErrorSeverity.LOW
  },
  [ErrorType.CONFIG_ERROR]: {
    patterns: [
      /config/i,
      /listener/i,
      /subscription/i,
      /settings/i,
      /configuration/i
    ],
    severity: ErrorSeverity.MEDIUM
  },
  [ErrorType.PERFORMANCE_ERROR]: {
    patterns: [
      /performance/i,
      /observer/i,
      /metric/i,
      /timing/i,
      /vitals/i,
      /fps/i,
      /budget/i
    ],
    severity: ErrorSeverity.LOW
  },
  [ErrorType.INTERSECTION_OBSERVER_ERROR]: {
    patterns: [
      /intersection.*observer/i,
      /intersectionobserver/i,
      /intersection/i
    ],
    severity: ErrorSeverity.LOW
  },
  [ErrorType.COMPONENT_ERROR]: {
    patterns: [
      /render/i,
      /component/i,
      /react/i,
      /hook/i,
      /useeffect/i,
      /usestate/i,
      /jsx/i
    ],
    severity: ErrorSeverity.HIGH
  },
  [ErrorType.NETWORK_ERROR]: {
    patterns: [
      /network/i,
      /fetch/i,
      /xhr/i,
      /ajax/i,
      /request/i,
      /response/i,
      /timeout/i,
      /cors/i
    ],
    severity: ErrorSeverity.MEDIUM
  },
  [ErrorType.VALIDATION_ERROR]: {
    patterns: [
      /validation/i,
      /invalid/i,
      /expected/i,
      /required/i,
      /missing/i,
      /format/i,
      /parse/i
    ],
    severity: ErrorSeverity.MEDIUM
  }
}

/**
 * Enhanced error classification utility with pattern matching
 */
export function classifyError(error: Error): { type: ErrorType; severity: ErrorSeverity } {
  const message = error.message
  const stack = error.stack || ''
  const combinedText = `${message} ${stack}`

  // Try to match against specific error patterns
  for (const [errorType, config] of Object.entries(ERROR_PATTERNS)) {
    const { patterns, severity } = config as { patterns: RegExp[]; severity: ErrorSeverity }
    
    for (const pattern of patterns) {
      if (pattern.test(message) || pattern.test(stack)) {
        return { 
          type: errorType as ErrorType, 
          severity: adjustSeverityByContext(severity, combinedText)
        }
      }
    }
  }

  // Fallback classification based on error constructor
  if (error.name === 'TypeError' || error.name === 'ReferenceError') {
    return { type: ErrorType.COMPONENT_ERROR, severity: ErrorSeverity.HIGH }
  }

  if (error.name === 'SyntaxError') {
    return { type: ErrorType.VALIDATION_ERROR, severity: ErrorSeverity.MEDIUM }
  }

  // Check for common DOM/Browser API errors
  if (combinedText.includes('DOM') || combinedText.includes('Element')) {
    return { type: ErrorType.COMPONENT_ERROR, severity: ErrorSeverity.MEDIUM }
  }

  return { type: ErrorType.UNKNOWN_ERROR, severity: ErrorSeverity.MEDIUM }
}

/**
 * Adjust error severity based on additional context
 */
function adjustSeverityByContext(baseSeverity: ErrorSeverity, errorText: string): ErrorSeverity {
  const lowerText = errorText.toLowerCase()
  
  // Escalate severity for critical contexts
  if (lowerText.includes('critical') || lowerText.includes('fatal') || lowerText.includes('crash')) {
    return ErrorSeverity.CRITICAL
  }
  
  if (lowerText.includes('important') || lowerText.includes('major')) {
    return baseSeverity === ErrorSeverity.LOW ? ErrorSeverity.MEDIUM : ErrorSeverity.HIGH
  }
  
  // De-escalate for minor contexts  
  if (lowerText.includes('minor') || lowerText.includes('warning') || lowerText.includes('deprecated')) {
    return baseSeverity === ErrorSeverity.HIGH ? ErrorSeverity.MEDIUM : ErrorSeverity.LOW
  }
  
  return baseSeverity
}

/**
 * Error reporting interface
 */
interface ErrorReporter {
  report(errorInfo: ErrorInfo): void
}

/**
 * Console error reporter for development
 */
class ConsoleErrorReporter implements ErrorReporter {
  report(errorInfo: ErrorInfo): void {
    const { type, severity, message, component, timestamp } = errorInfo

    const prefix = severity === ErrorSeverity.CRITICAL ? '🚨' : 
                  severity === ErrorSeverity.HIGH ? '❌' : 
                  severity === ErrorSeverity.MEDIUM ? '⚠️' : '💡'

    console.group(`${prefix} ${type} (${severity})`)
    console.error(`Message: ${message}`)
    if (component) console.log(`Component: ${component}`)
    console.log(`Timestamp: ${new Date(timestamp).toISOString()}`)
    if (errorInfo.additionalContext) {
      console.log('Context:', errorInfo.additionalContext)
    }
    if (errorInfo.originalError?.stack) {
      console.log('Stack:', errorInfo.originalError.stack)
    }
    console.groupEnd()
  }
}

/**
 * Analytics error reporter for production (placeholder)
 */
class AnalyticsErrorReporter implements ErrorReporter {
  report(errorInfo: ErrorInfo): void {
    // In production, this would send to analytics service
    if (process.env.NODE_ENV === 'production') {
      // Example: send to analytics service
      // analytics.track('error', errorInfo)
      console.warn('Error logged to analytics:', {
        type: errorInfo.type,
        severity: errorInfo.severity,
        component: errorInfo.component
      })
    }
  }
}

/**
 * Centralized error reporting manager
 */
class ErrorReportingManager {
  private reporters: ErrorReporter[] = []

  constructor() {
    // Set up default reporters based on environment
    if (process.env.NODE_ENV === 'development') {
      this.addReporter(new ConsoleErrorReporter())
    } else {
      this.addReporter(new AnalyticsErrorReporter())
    }
  }

  addReporter(reporter: ErrorReporter): void {
    this.reporters.push(reporter)
  }

  removeReporter(reporter: ErrorReporter): void {
    const index = this.reporters.indexOf(reporter)
    if (index >= 0) {
      this.reporters.splice(index, 1)
    }
  }

  reportError(error: Error | AppError, component?: string, additionalContext?: Record<string, unknown>): void {
    try {
      let errorInfo: ErrorInfo

      if (error instanceof AppError) {
        errorInfo = error.toErrorInfo()
      } else {
        const classification = classifyError(error)
        errorInfo = {
          type: classification.type,
          severity: classification.severity,
          message: error.message,
          originalError: error,
          component,
          timestamp: Date.now(),
          userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
          url: typeof window !== 'undefined' ? window.location.href : undefined,
          additionalContext
        }
      }

      // Report to all configured reporters
      this.reporters.forEach(reporter => {
        try {
          reporter.report(errorInfo)
        } catch (reporterError) {
          console.error('Error reporter failed:', reporterError)
        }
      })
    } catch (handlingError) {
      // Fallback error handling
      console.error('Error handling failed:', handlingError, 'Original error:', error)
    }
  }
}

// Export singleton instance
export const errorReporter = new ErrorReportingManager()

/**
 * Convenience functions for common error scenarios
 */
export const ErrorHandlers = {
  /**
   * Handle shader-related errors with graceful degradation
   */
  handleShaderError: (error: Error, component?: string) => {
    const appError = new AppError(
      ErrorType.SHADER_ERROR,
      ErrorSeverity.MEDIUM,
      `Shader error: ${error.message}`,
      component,
      { canFallback: true, affectsVisuals: true }
    )
    errorReporter.reportError(appError)
    return appError
  },

  /**
   * Handle theme-related errors with fallback
   */
  handleThemeError: (error: Error, component?: string) => {
    const appError = new AppError(
      ErrorType.THEME_ERROR,
      ErrorSeverity.LOW,
      `Theme error: ${error.message}`,
      component,
      { canFallback: true, affectsVisuals: false }
    )
    errorReporter.reportError(appError)
    return appError
  },

  /**
   * Handle component errors with error boundary info
   */
  handleComponentError: (error: Error, component?: string, errorInfo?: React.ErrorInfo) => {
    const appError = new AppError(
      ErrorType.COMPONENT_ERROR,
      ErrorSeverity.HIGH,
      `Component error: ${error.message}`,
      component,
      { errorInfo: errorInfo?.componentStack }
    )
    errorReporter.reportError(appError)
    return appError
  },

  /**
   * Handle performance monitoring errors (non-critical)
   */
  handlePerformanceError: (error: Error, metric?: string) => {
    const appError = new AppError(
      ErrorType.PERFORMANCE_ERROR,
      ErrorSeverity.LOW,
      `Performance monitoring error: ${error.message}`,
      'PerformanceMonitor',
      { metric, affectsFunctionality: false }
    )
    errorReporter.reportError(appError)
    return appError
  },

  /**
   * Handle configuration errors
   */
  handleConfigError: (error: Error, component?: string, context?: Record<string, unknown>) => {
    const appError = new AppError(
      ErrorType.CONFIG_ERROR,
      ErrorSeverity.MEDIUM,
      `Configuration error: ${error.message}`,
      component || 'ConfigurationManager',
      { ...context, affectsFunctionality: true }
    )
    errorReporter.reportError(appError)
    return appError
  }
}

/**
 * Error boundary hook for React components
 */
export function useErrorHandler(componentName?: string) {
  return (error: Error, errorInfo?: React.ErrorInfo) => {
    ErrorHandlers.handleComponentError(error, componentName, errorInfo)
  }
}