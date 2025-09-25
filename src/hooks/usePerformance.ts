import { useEffect, useRef, useCallback, useState } from 'react'

// ===========================================
// Performance Monitoring Hook
// ===========================================

export const usePerformance = () => {
  const startTime = useRef<number>(Date.now())
  const renderCount = useRef<number>(0)

  useEffect(() => {
    renderCount.current += 1
  })

  const logPerformance = useCallback((componentName: string) => {
    const endTime = Date.now()
    const renderTime = endTime - startTime.current
    
    console.log(`🚀 Performance [${componentName}]:`, {
      renderTime: `${renderTime}ms`,
      renderCount: renderCount.current,
      timestamp: new Date().toISOString()
    })
  }, [])

  const resetTimer = useCallback(() => {
    startTime.current = Date.now()
    renderCount.current = 0
  }, [])

  return {
    logPerformance,
    resetTimer,
    renderCount: renderCount.current
  }
}

// ===========================================
// Memory Usage Hook
// ===========================================

export const useMemoryUsage = () => {
  const logMemoryUsage = useCallback((componentName: string) => {
    if ('memory' in performance) {
      const memory = (performance as any).memory
      console.log(`💾 Memory [${componentName}]:`, {
        used: `${Math.round(memory.usedJSHeapSize / 1048576)} MB`,
        total: `${Math.round(memory.totalJSHeapSize / 1048576)} MB`,
        limit: `${Math.round(memory.jsHeapSizeLimit / 1048576)} MB`
      })
    }
  }, [])

  return { logMemoryUsage }
}

// ===========================================
// Lazy Loading Hook
// ===========================================

export const useLazyLoading = <T>(
  importFunc: () => Promise<T>,
  deps: unknown[] = []
) => {
  const [component, setComponent] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const loadComponent = useCallback(async () => {
    if (component || loading) return

    setLoading(true)
    setError(null)

    try {
      const loadedComponent = await importFunc()
      setComponent(loadedComponent)
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }, [component, loading, ...deps])

  return {
    component,
    loading,
    error,
    loadComponent
  }
}
