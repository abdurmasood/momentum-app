/**
 * Performance monitoring utilities for Momentum app
 * 
 * Provides comprehensive performance tracking for Web Vitals,
 * component render times, and bundle size analysis.
 */

import { performanceConfig } from '@/config/performance'
import { ErrorHandlers } from '@/utils/error-handling'

// Type definitions for Layout Shift API
interface LayoutShift extends PerformanceEntry {
  value: number
  hadRecentInput: boolean
}

/**
 * Performance metrics interface
 */
export interface PerformanceMetrics {
  // Web Vitals
  fcp?: number // First Contentful Paint
  lcp?: number // Largest Contentful Paint
  cls?: number // Cumulative Layout Shift
  fid?: number // First Input Delay
  ttfb?: number // Time to First Byte
  
  // Custom metrics
  shaderLoadTime?: number
  themeReadTime?: number
  renderTime?: number
  bundleSize?: number
  
  // Timestamps
  timestamp: number
  url: string
}

/**
 * Performance budget thresholds (in ms, except CLS which is unitless)
 */
export const PERFORMANCE_BUDGETS = {
  FCP: 2500,  // First Contentful Paint should be < 2.5s (increased for 3D content)
  LCP: 2500,  // Largest Contentful Paint should be < 2.5s
  CLS: 0.1,   // Cumulative Layout Shift should be < 0.1
  FID: 100,   // First Input Delay should be < 100ms
  TTFB: 600,  // Time to First Byte should be < 600ms
  
  // Custom budgets
  SHADER_LOAD: 1000,  // Shader loading should be < 1s
  THEME_READ: 10,     // Theme color reading should be < 10ms
  RENDER: 16,         // Component render should be < 16ms (60fps)
} as const

/**
 * Performance observer for Web Vitals
 */
class PerformanceMonitor {
  private metrics: Partial<PerformanceMetrics> = {
    timestamp: Date.now(),
    url: typeof window !== 'undefined' ? window.location.href : ''
  }
  
  private observers: PerformanceObserver[] = []
  private isEnabled = false

  constructor() {
    if (typeof window === 'undefined') return
    
    // Use centralized performance configuration
    this.isEnabled = performanceConfig.getConfig().enabled
    
    if (this.isEnabled) {
      this.initializeObservers()
    }

    // Subscribe to configuration changes
    performanceConfig.subscribe((config) => {
      const wasEnabled = this.isEnabled
      this.isEnabled = config.enabled
      
      if (config.enabled && !wasEnabled) {
        this.initializeObservers()
      } else if (!config.enabled && wasEnabled) {
        this.disconnect()
      }
    })
  }

  /**
   * Initialize performance observers for Web Vitals
   */
  private initializeObservers() {
    try {
      // First Contentful Paint (FCP)
      this.observeEntry('paint', (entries) => {
        entries.forEach(entry => {
          if (entry.name === 'first-contentful-paint') {
            this.metrics.fcp = entry.startTime
            this.checkBudget('FCP', entry.startTime)
          }
        })
      })

      // Largest Contentful Paint (LCP)
      this.observeEntry('largest-contentful-paint', (entries) => {
        // LCP can change as new largest elements appear
        const lastEntry = entries[entries.length - 1]
        this.metrics.lcp = lastEntry.startTime
        this.checkBudget('LCP', lastEntry.startTime)
      })

      // Cumulative Layout Shift (CLS)
      this.observeEntry('layout-shift', (entries) => {
        let clsValue = this.metrics.cls || 0
        
        entries.forEach(entry => {
          const layoutShift = entry as LayoutShift
          if (!layoutShift.hadRecentInput) {
            clsValue += layoutShift.value
          }
        })
        
        this.metrics.cls = clsValue
        this.checkBudget('CLS', clsValue)
      })

      // First Input Delay (FID)
      this.observeEntry('first-input', (entries) => {
        const firstInput = entries[0] as PerformanceEventTiming
        this.metrics.fid = firstInput.processingStart - firstInput.startTime
        this.checkBudget('FID', this.metrics.fid)
      })

      // Navigation timing for TTFB
      this.observeNavigation()
      
    } catch (error) {
      ErrorHandlers.handlePerformanceError(
        error as Error, 
        'performance-observer-initialization'
      )
    }
  }

  /**
   * Generic performance observer helper
   */
  private observeEntry(type: string, callback: (entries: PerformanceEntry[]) => void) {
    try {
      const observer = new PerformanceObserver(list => {
        callback(list.getEntries())
      })
      
      observer.observe({ 
        type, 
        buffered: true 
      } as PerformanceObserverInit)
      
      this.observers.push(observer)
    } catch (error) {
      ErrorHandlers.handlePerformanceError(
        error as Error, 
        `performance-observer-${type}`
      )
    }
  }

  /**
   * Observe navigation timing
   */
  private observeNavigation() {
    try {
      const observer = new PerformanceObserver(list => {
        list.getEntries().forEach(entry => {
          const navEntry = entry as PerformanceNavigationTiming
          this.metrics.ttfb = navEntry.responseStart - navEntry.requestStart
          this.checkBudget('TTFB', this.metrics.ttfb)
        })
      })
      
      observer.observe({ type: 'navigation', buffered: true })
      this.observers.push(observer)
    } catch (error) {
      ErrorHandlers.handlePerformanceError(
        error as Error, 
        'navigation-timing-observer'
      )
    }
  }

  /**
   * Check if metric exceeds performance budget
   */
  private checkBudget(metric: keyof typeof PERFORMANCE_BUDGETS, value: number) {
    const config = performanceConfig.getConfig()
    if (!config.enabled || !config.budgetWarnings) return
    
    const budget = PERFORMANCE_BUDGETS[metric]
    if (value > budget) {
      if (config.developmentLogging) {
        console.warn(`⚠️ Performance budget exceeded: ${metric}`, {
          value: `${value.toFixed(2)}${metric === 'CLS' ? '' : 'ms'}`,
          budget: `${budget}${metric === 'CLS' ? '' : 'ms'}`,
          excess: `${(value - budget).toFixed(2)}${metric === 'CLS' ? '' : 'ms'}`
        })
      }

      // Report budget violation as performance error
      ErrorHandlers.handlePerformanceError(
        new Error(`Performance budget exceeded for ${metric}: ${value.toFixed(2)} > ${budget}`),
        `budget-${metric}`
      )
    }
  }

  /**
   * Record custom performance metric
   */
  recordCustomMetric(name: keyof PerformanceMetrics, value: number) {
    if (!this.isEnabled) return
    
    // Type-safe assignment using discriminated union approach
    switch (name) {
      case 'fcp':
      case 'lcp':
      case 'cls':
      case 'fid':
      case 'ttfb':
      case 'shaderLoadTime':
      case 'themeReadTime':
      case 'renderTime':
      case 'bundleSize':
        this.metrics[name] = value
        break
      case 'timestamp':
      case 'url':
        // These are always present and shouldn't be set via this method
        console.warn(`Cannot set read-only metric: ${name}`)
        break
      default:
        // Ensure exhaustiveness check
        const _exhaustiveCheck: never = name
        console.warn(`Unknown metric name: ${_exhaustiveCheck}`)
    }
    
    // Check custom budgets
    if (name === 'shaderLoadTime') {
      this.checkBudget('SHADER_LOAD', value)
    } else if (name === 'themeReadTime') {
      this.checkBudget('THEME_READ', value)
    } else if (name === 'renderTime') {
      this.checkBudget('RENDER', value)
    }
  }

  /**
   * Get current metrics snapshot
   */
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics } as PerformanceMetrics
  }

  /**
   * Log performance summary
   */
  logSummary() {
    if (!this.isEnabled) return

    const metrics = this.getMetrics()
    const summary = {
      'Web Vitals': {
        'FCP (First Contentful Paint)': metrics.fcp ? `${metrics.fcp.toFixed(2)}ms` : 'N/A',
        'LCP (Largest Contentful Paint)': metrics.lcp ? `${metrics.lcp.toFixed(2)}ms` : 'N/A',
        'CLS (Cumulative Layout Shift)': metrics.cls ? metrics.cls.toFixed(4) : 'N/A',
        'FID (First Input Delay)': metrics.fid ? `${metrics.fid.toFixed(2)}ms` : 'N/A',
        'TTFB (Time to First Byte)': metrics.ttfb ? `${metrics.ttfb.toFixed(2)}ms` : 'N/A',
      },
      'Custom Metrics': {
        'Shader Load Time': metrics.shaderLoadTime ? `${metrics.shaderLoadTime.toFixed(2)}ms` : 'N/A',
        'Theme Read Time': metrics.themeReadTime ? `${metrics.themeReadTime.toFixed(2)}ms` : 'N/A',
        'Render Time': metrics.renderTime ? `${metrics.renderTime.toFixed(2)}ms` : 'N/A',
      }
    }

    console.group('📊 Performance Summary')
    console.table(summary['Web Vitals'])
    console.table(summary['Custom Metrics'])
    console.groupEnd()
  }

  /**
   * Send metrics to analytics (placeholder)
   */
  sendToAnalytics() {
    if (!this.isEnabled) return
    
    // In a real app, you'd send to your analytics service
    console.log('📊 Sending metrics to analytics:', this.getMetrics())
  }

  /**
   * Cleanup observers and clear metrics
   */
  disconnect() {
    this.observers.forEach(observer => observer.disconnect())
    this.observers = []
    
    // Clear metrics to prevent memory leaks
    this.clearMetrics()
  }

  /**
   * Clear all stored metrics
   */
  clearMetrics() {
    this.metrics = {
      timestamp: Date.now(),
      url: typeof window !== 'undefined' ? window.location.href : ''
    }
  }

  /**
   * Reset performance monitor state
   */
  reset() {
    this.disconnect()
    this.clearMetrics()
    this.isEnabled = false
    
    if (typeof window !== 'undefined') {
      this.isEnabled = process.env.NODE_ENV === 'development' || 
                      window.location.search.includes('perf=true')
      
      if (this.isEnabled) {
        this.initializeObservers()
      }
    }
  }

  /**
   * Create a performance mark
   */
  mark(name: string) {
    if (typeof performance !== 'undefined' && performance.mark) {
      performance.mark(name)
    }
  }

  /**
   * Measure time between two marks
   */
  measure(name: string, startMark: string, endMark?: string): number {
    if (typeof performance === 'undefined' || !performance.measure) {
      return 0
    }

    try {
      if (endMark) {
        performance.measure(name, startMark, endMark)
      } else {
        performance.measure(name, startMark)
      }
      
      const entries = performance.getEntriesByName(name, 'measure')
      return entries.length > 0 ? entries[entries.length - 1].duration : 0
    } catch (error) {
      console.warn('Failed to measure performance:', error)
      return 0
    }
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor()

/**
 * High-level utility functions
 */
export function measureFunction<T extends unknown[], R>(
  fn: (...args: T) => R,
  name: string
) {
  return (...args: T): R => {
    const start = performance.now()
    const result = fn(...args)
    const end = performance.now()
    
    performanceMonitor.recordCustomMetric('renderTime', end - start)
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`⏱️ ${name}: ${(end - start).toFixed(2)}ms`)
    }
    
    return result
  }
}

/**
 * Async function measurement
 */
export async function measureAsyncFunction<T extends unknown[], R>(
  fn: (...args: T) => Promise<R>,
  name: string
): Promise<(...args: T) => Promise<R>> {
  return async (...args: T): Promise<R> => {
    const start = performance.now()
    const result = await fn(...args)
    const end = performance.now()
    
    performanceMonitor.recordCustomMetric('shaderLoadTime', end - start)
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`⏱️ ${name}: ${(end - start).toFixed(2)}ms`)
    }
    
    return result
  }
}

/**
 * Bundle size analysis utilities
 */
export function analyzeBundleSize() {
  if (typeof window === 'undefined') return

  // Estimate bundle size from loaded resources
  const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[]
  let totalSize = 0

  resources.forEach(resource => {
    if (resource.name.includes('.js') || resource.name.includes('.css')) {
      totalSize += resource.transferSize || 0
    }
  })

  performanceMonitor.recordCustomMetric('bundleSize', totalSize)

  if (process.env.NODE_ENV === 'development') {
    console.log(`📦 Estimated bundle size: ${(totalSize / 1024).toFixed(2)} KB`)
  }
}

/**
 * Initialize performance monitoring
 */
export function initializePerformanceMonitoring() {
  if (typeof window === 'undefined') return

  // Log summary after page load
  window.addEventListener('load', () => {
    setTimeout(() => {
      performanceMonitor.logSummary()
      analyzeBundleSize()
    }, 1000)
  })

  // Send to analytics on page unload
  window.addEventListener('beforeunload', () => {
    performanceMonitor.sendToAnalytics()
  })

  return performanceMonitor
}