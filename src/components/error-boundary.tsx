"use client";

import React, { ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  onReset?: () => void;
  resetKeys?: Array<string | number>;
  className?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
}

/**
 * Reusable ErrorBoundary component for catching and handling React errors
 * 
 * Features:
 * - Custom fallback UI with retry functionality
 * - Error logging and reporting
 * - Reset capability with optional resetKeys
 * - Development vs production error display
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private resetTimeoutId: number | null = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);

    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: "",
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Generate unique error ID for tracking
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      hasError: true,
      error,
      errorId,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error information
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // In production, you might want to send this to an error reporting service
    if (process.env.NODE_ENV === 'production') {
      // TODO: Send to error reporting service (e.g., Sentry, LogRocket)
      // reportError(error, errorInfo, this.state.errorId);
    }
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    const { resetKeys } = this.props;
    const { hasError } = this.state;
    
    // Reset error state if resetKeys have changed
    if (hasError && prevProps.resetKeys !== resetKeys) {
      if (resetKeys && resetKeys.some(key => key !== prevProps.resetKeys?.[prevProps.resetKeys.indexOf(key)])) {
        this.resetErrorBoundary();
      }
    }
  }

  componentWillUnmount() {
    if (this.resetTimeoutId) {
      window.clearTimeout(this.resetTimeoutId);
    }
  }

  resetErrorBoundary = () => {
    if (this.props.onReset) {
      this.props.onReset();
    }

    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: "",
    });
  };

  handleRetry = () => {
    // Add slight delay to prevent immediate re-error
    this.resetTimeoutId = window.setTimeout(() => {
      this.resetErrorBoundary();
    }, 100);
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className={`flex flex-col items-center justify-center min-h-[200px] p-6 text-center ${this.props.className || ''}`}>
          <div className="mb-4">
            <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-2" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Something went wrong
            </h3>
            <p className="text-sm text-muted-foreground max-w-md">
              {process.env.NODE_ENV === 'development' && this.state.error
                ? `${this.state.error.message}`
                : "We encountered an unexpected error. Please try again."}
            </p>
            {process.env.NODE_ENV === 'development' && this.state.errorId && (
              <p className="text-xs text-muted-foreground mt-2 font-mono">
                Error ID: {this.state.errorId}
              </p>
            )}
          </div>
          
          <Button 
            onClick={this.handleRetry}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </Button>

          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details className="mt-4 text-left max-w-2xl">
              <summary className="cursor-pointer text-sm text-muted-foreground mb-2">
                Error Details (Development)
              </summary>
              <pre className="text-xs bg-muted p-3 rounded overflow-auto max-h-40 text-muted-foreground">
                {this.state.error.stack}
                {this.state.errorInfo?.componentStack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Hook-based error boundary for functional components
 * Note: This is a wrapper around the class-based ErrorBoundary
 */
interface WithErrorBoundaryProps {
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  onReset?: () => void;
  resetKeys?: Array<string | number>;
}

export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: WithErrorBoundaryProps
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

/**
 * Simple error boundary for quick wrapping
 */
export function SafeComponent({ 
  children, 
  fallback,
  className 
}: { 
  children: ReactNode; 
  fallback?: ReactNode;
  className?: string;
}) {
  return (
    <ErrorBoundary fallback={fallback} className={className}>
      {children}
    </ErrorBoundary>
  );
}