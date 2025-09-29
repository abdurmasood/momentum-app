"use client"

import React, { useRef, useMemo, useEffect, useState, useCallback } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { Mesh, ShaderMaterial } from "three"
import { vertexShader } from "@/shaders/sphere/vertex"
import { fragmentShader } from "@/shaders/sphere/fragment"
import { usePerformanceMetrics } from "@/hooks/use-performance-metrics"

// Default animation constants
const DEFAULT_CONFIG = {
  ANIMATION_SPEED: 0.4,
  SPHERE_INTENSITY: 0.15,
  SPHERE_SCALE: 0.8,
  CAMERA_DISTANCE: 8.0,
  ICOSAHEDRON_RADIUS: 2,
  ICOSAHEDRON_DETAIL: 20,
  ENABLE_PERFORMANCE_MONITORING: true,
} as const

// Configuration interface for customization
export interface SphereConfig {
  animationSpeed?: number
  sphereIntensity?: number
  sphereScale?: number
  cameraDistance?: number
  icosahedronRadius?: number
  icosahedronDetail?: number
  enablePerformanceMonitoring?: boolean
}

// WebGL capability detection
const detectWebGLSupport = (): boolean => {
  try {
    if (typeof window === 'undefined') return false
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
    return !!context
  } catch (error) {
    console.warn('WebGL detection failed:', error)
    return false
  }
}

interface BlobProps {
  className?: string
  config: Required<SphereConfig>
}

const Blob: React.FC<BlobProps> = ({ config }) => {
  const meshRef = useRef<Mesh>(null!)
  const mountedRef = useRef(true)
  const performanceMetrics = usePerformanceMetrics()

  const uniforms = useMemo(
    () => ({
      u_intensity: {
        value: config.sphereIntensity,
      },
      u_time: {
        value: 0.0,
      },
    }),
    [config.sphereIntensity]
  )

  // Cleanup on unmount
  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  useFrame((state) => {
    // Early exit if component is unmounted
    if (!mountedRef.current) return
    
    const { clock } = state
    if (!meshRef.current?.material) return

    // Runtime type validation with proper instanceof check
    const material = meshRef.current.material
    if (!(material instanceof ShaderMaterial)) {
      console.error('Expected ShaderMaterial but got:', material.constructor.name)
      return
    }
    
    if (!material.uniforms) {
      console.error('ShaderMaterial missing uniforms')
      return
    }

    // Performance monitoring
    if (config.enablePerformanceMonitoring && performanceMetrics) {
      const startTime = performance.now()
      
      try {
        // Update time uniform for continuous animation
        material.uniforms.u_time.value = config.animationSpeed * clock.getElapsedTime()

        // Fixed intensity value - no hover interactions
        material.uniforms.u_intensity.value = config.sphereIntensity

        // Track frame update time
        const updateTime = performance.now() - startTime
        if (updateTime > 16.67) { // > 1 frame at 60fps
          console.warn(`Slow shader update: ${updateTime.toFixed(2)}ms`)
        }
      } catch (error) {
        console.error('Shader uniform update failed:', error)
      }
    } else {
      // Standard updates without monitoring
      material.uniforms.u_time.value = config.animationSpeed * clock.getElapsedTime()
      material.uniforms.u_intensity.value = config.sphereIntensity
    }
  })

  return (
    <mesh
      ref={meshRef}
      position={[0, 0, 0]}
      scale={config.sphereScale}
    >
      <icosahedronGeometry args={[config.icosahedronRadius, config.icosahedronDetail]} />
      <shaderMaterial
        fragmentShader={fragmentShader}
        vertexShader={vertexShader}
        uniforms={uniforms}
        wireframe={false}
      />
    </mesh>
  )
}

interface Sphere3DProps {
  className?: string
  width?: string | number
  height?: string | number
  config?: SphereConfig
}

// WebGL fallback component
const WebGLFallback: React.FC = () => (
  <div className="w-full h-full flex items-center justify-center">
    <div className="text-center text-muted-foreground">
      <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 opacity-20 mx-auto mb-4" />
      <p className="text-sm">WebGL not supported</p>
    </div>
  </div>
)

const Sphere3DComponent: React.FC<Sphere3DProps> = ({ 
  className = "", 
  width = "100vw", 
  height = "100vh",
  config: userConfig = {}
}) => {
  // Merge user config with defaults
  const config: Required<SphereConfig> = useMemo(() => ({
    animationSpeed: userConfig.animationSpeed ?? DEFAULT_CONFIG.ANIMATION_SPEED,
    sphereIntensity: userConfig.sphereIntensity ?? DEFAULT_CONFIG.SPHERE_INTENSITY,
    sphereScale: userConfig.sphereScale ?? DEFAULT_CONFIG.SPHERE_SCALE,
    cameraDistance: userConfig.cameraDistance ?? DEFAULT_CONFIG.CAMERA_DISTANCE,
    icosahedronRadius: userConfig.icosahedronRadius ?? DEFAULT_CONFIG.ICOSAHEDRON_RADIUS,
    icosahedronDetail: userConfig.icosahedronDetail ?? DEFAULT_CONFIG.ICOSAHEDRON_DETAIL,
    enablePerformanceMonitoring: userConfig.enablePerformanceMonitoring ?? DEFAULT_CONFIG.ENABLE_PERFORMANCE_MONITORING,
  }), [userConfig])

  const [webGLSupported, setWebGLSupported] = useState<boolean | null>(null)

  // Check WebGL support on mount
  useEffect(() => {
    setWebGLSupported(detectWebGLSupport())
  }, [])

  // Handle Canvas errors
  const handleCanvasError = useCallback((event: React.SyntheticEvent<HTMLDivElement>) => {
    console.error('Canvas error:', event)
    setWebGLSupported(false)
  }, [])

  // Show loading state while checking WebGL
  if (webGLSupported === null) {
    return (
      <div className={`relative ${className}`} style={{ width, height }}>
        <div className="w-full h-full flex items-center justify-center">
          <div className="animate-pulse">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 opacity-60" />
          </div>
        </div>
      </div>
    )
  }

  // Show fallback if WebGL not supported
  if (!webGLSupported) {
    return (
      <div className={`relative ${className}`} style={{ width, height }}>
        <WebGLFallback />
      </div>
    )
  }

  return (
    <div className={`relative ${className}`} style={{ width, height }}>
      <Canvas 
        camera={{ position: [0.0, 0.0, config.cameraDistance] }}
        style={{ background: "transparent", pointerEvents: "none" }}
        dpr={typeof window !== 'undefined' ? Math.min(window.devicePixelRatio, 2) : 1}
        performance={{ min: 0.5 }}
        onError={handleCanvasError}
      >
        <Blob config={config} />
      </Canvas>
    </div>
  )
}

// Memoized component to prevent unnecessary re-renders
// Sphere3D has heavy WebGL operations and should only re-render when props actually change
const Sphere3D = React.memo(Sphere3DComponent);

export default Sphere3D;