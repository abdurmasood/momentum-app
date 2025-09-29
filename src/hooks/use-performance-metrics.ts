"use client"

import { useState, useEffect, useCallback, useRef } from 'react'
import { performanceMonitor, type PerformanceMetrics } from '@/utils/performance-monitor'
import { performanceConfig } from '@/config/performance'
import { ErrorHandlers } from '@/utils/error-handling'

/**
 * Configuration for performance metrics hook
 */
interface UsePerformanceMetricsOptions {
  /** Enable automatic tracking of component render time */
  trackRenderTime?: boolean
  /** Interval to update metrics (ms) */
  updateInterval?: number
  /** Enable development logging */
  enableLogging?: boolean
  /** Component name for tracking */
  componentName?: string
}

/**
 * Hook return interface
 */
interface PerformanceHookResult {
  metrics: PerformanceMetrics | null
  isLoading: boolean
  recordMetric: (name: keyof PerformanceMetrics, value: number) => void
  startTiming: (name: string) => () => number
  getComponentStats: () => ComponentStats
}

/**
 * Component-specific performance statistics
 */
interface ComponentStats {
  renderCount: number
  averageRenderTime: number
  lastRenderTime: number
  mountTime: number
  totalRenderTime: number
}

/**
 * Custom hook for performance metrics tracking
 * 
 * Provides real-time performance monitoring with component-level
 * statistics and automatic Web Vitals tracking.
 */
export function usePerformanceMetrics(
  options: UsePerformanceMetricsOptions = {}
): PerformanceHookResult {
  const config = performanceConfig.getConfig()
  const {
    trackRenderTime = config.componentMetrics,
    updateInterval = 1000,
    enableLogging = config.developmentLogging,
    componentName = 'Component'
  } = options

  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  // Component-specific tracking
  const statsRef = useRef<ComponentStats>({
    renderCount: 0,
    averageRenderTime: 0,
    lastRenderTime: 0,
    mountTime: performance.now(),
    totalRenderTime: 0
  })
  
  const renderStartRef = useRef<number>(0)
  const timingMapRef = useRef<Map<string, number>>(new Map())

  /**
   * Record a custom performance metric
   */
  const recordMetric = useCallback((name: keyof PerformanceMetrics, value: number) => {
    performanceMonitor.recordCustomMetric(name, value)
    
    if (enableLogging) {
      console.log(`📊 ${componentName} - ${name}: ${value.toFixed(2)}ms`)
    }
  }, [componentName, enableLogging])

  /**
   * Start timing for a custom operation
   */
  const startTiming = useCallback((name: string) => {
    const startTime = performance.now()
    timingMapRef.current.set(name, startTime)
    
    // Return function to end timing and get duration
    return () => {
      const endTime = performance.now()
      const duration = endTime - startTime
      timingMapRef.current.delete(name)
      
      if (enableLogging) {
        console.log(`⏱️ ${componentName} - ${name}: ${duration.toFixed(2)}ms`)
      }
      
      return duration
    }
  }, [componentName, enableLogging])

  /**
   * Get component-specific performance statistics
   */
  const getComponentStats = useCallback((): ComponentStats => ({
    ...statsRef.current
  }), [])

  /**
   * Track render time if enabled
   */
  useEffect(() => {
    if (!trackRenderTime) return
    
    renderStartRef.current = performance.now()
  })

  /**
   * Calculate render time after each render
   */
  useEffect(() => {
    if (!trackRenderTime) return
    
    const renderTime = performance.now() - renderStartRef.current
    
    // Update component stats
    const stats = statsRef.current
    stats.renderCount++
    stats.lastRenderTime = renderTime
    stats.totalRenderTime += renderTime
    stats.averageRenderTime = stats.totalRenderTime / stats.renderCount
    
    // Record to performance monitor
    recordMetric('renderTime', renderTime)
    
    if (enableLogging && renderTime > 16) { // Log slow renders (>16ms = <60fps)
      console.warn(`🐌 Slow render in ${componentName}: ${renderTime.toFixed(2)}ms`)
    }
  })

  /**
   * Periodically update metrics from performance monitor
   */
  useEffect(() => {
    const updateMetrics = () => {
      try {
        const currentMetrics = performanceMonitor.getMetrics()
        setMetrics(currentMetrics)
        setIsLoading(false)
      } catch (error) {
        ErrorHandlers.handlePerformanceError(
          error as Error, 
          'metrics-update'
        )
        setIsLoading(false)
      }
    }

    // Initial update
    updateMetrics()

    // Set up interval for updates only if performance monitoring is enabled
    if (config.enabled) {
      const interval = setInterval(updateMetrics, updateInterval)
      return () => clearInterval(interval)
    }
  }, [updateInterval, config.enabled])

  /**
   * Log component statistics on unmount (development only) and cleanup
   */
  useEffect(() => {
    const statsRefCurrent = statsRef.current
    const timingMapRefCurrent = timingMapRef.current
    
    return () => {
      if (enableLogging && statsRefCurrent) {
        const totalLifetime = performance.now() - statsRefCurrent.mountTime
        
        console.group(`📈 ${componentName} Performance Summary`)
        console.log('Lifetime:', `${totalLifetime.toFixed(2)}ms`)
        console.log('Render Count:', statsRefCurrent.renderCount)
        console.log('Average Render Time:', `${statsRefCurrent.averageRenderTime.toFixed(2)}ms`)
        console.log('Total Render Time:', `${statsRefCurrent.totalRenderTime.toFixed(2)}ms`)
        console.log('Render Overhead:', `${((statsRefCurrent.totalRenderTime / totalLifetime) * 100).toFixed(1)}%`)
        console.groupEnd()
      }

      // Clean up refs and timers to prevent memory leaks
      if (statsRefCurrent) {
        statsRefCurrent.renderCount = 0
        statsRefCurrent.averageRenderTime = 0
        statsRefCurrent.lastRenderTime = 0
        statsRefCurrent.mountTime = 0
        statsRefCurrent.totalRenderTime = 0
      }

      // Clear any pending timings
      if (timingMapRefCurrent) {
        timingMapRefCurrent.clear()
      }
    }
  }, [componentName, enableLogging])

  return {
    metrics,
    isLoading,
    recordMetric,
    startTiming,
    getComponentStats
  }
}

/**
 * Specialized hook for shader component performance
 */
export function useShaderPerformance() {
  const { recordMetric, startTiming, getComponentStats } = usePerformanceMetrics({
    componentName: 'ShaderBackground',
    trackRenderTime: true,
    enableLogging: true
  })

  const measureShaderLoad = useCallback(() => {
    return startTiming('shader-load')
  }, [startTiming])

  const measureThemeRead = useCallback(() => {
    return startTiming('theme-read')
  }, [startTiming])

  const recordShaderMetric = useCallback((metric: 'load' | 'render' | 'error', value: number) => {
    switch (metric) {
      case 'load':
        recordMetric('shaderLoadTime', value)
        break
      case 'render':
        recordMetric('renderTime', value)
        break
      default:
        break
    }
  }, [recordMetric])

  return {
    measureShaderLoad,
    measureThemeRead,
    recordShaderMetric,
    getComponentStats
  }
}

/**
 * Hook for Web Vitals monitoring in components
 */
export function useWebVitals() {
  const { metrics, isLoading } = usePerformanceMetrics({
    trackRenderTime: false,
    updateInterval: 2000 // Update every 2 seconds
  })

  const getVitalsScore = useCallback(() => {
    if (!metrics) return null

    // Calculate overall performance score based on Web Vitals
    const scores = {
      fcp: metrics.fcp ? (metrics.fcp < 1800 ? 100 : Math.max(0, 100 - (metrics.fcp - 1800) / 10)) : null,
      lcp: metrics.lcp ? (metrics.lcp < 2500 ? 100 : Math.max(0, 100 - (metrics.lcp - 2500) / 25)) : null,
      cls: metrics.cls ? (metrics.cls < 0.1 ? 100 : Math.max(0, 100 - (metrics.cls - 0.1) * 500)) : null,
      fid: metrics.fid ? (metrics.fid < 100 ? 100 : Math.max(0, 100 - (metrics.fid - 100) / 2)) : null,
    }

    const validScores = Object.values(scores).filter(score => score !== null) as number[]
    const averageScore = validScores.length > 0 
      ? validScores.reduce((sum, score) => sum + score, 0) / validScores.length
      : null

    return {
      overall: averageScore,
      breakdown: scores
    }
  }, [metrics])

  return {
    metrics,
    isLoading,
    vitalsScore: getVitalsScore()
  }
}