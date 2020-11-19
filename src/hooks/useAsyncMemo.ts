import { useState, useEffect, useCallback, useRef } from 'react'

function useAsyncMemo<T>(
  callback: () => Promise<T>,
  init: T,
  dependencies: any[] = [],
  onError?: (e: Error) => void
) {
  const initRef = useRef(init)
  const [output, setOutput] = useState<T>(initRef.current)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const _callback = useCallback(callback, dependencies)
  const promiseRef = useRef<Promise<T>>()

  useEffect(() => {
    if (promiseRef.current) {
      return
    }

    let isNotCancelled = true

    setOutput(initRef.current)
    setError(null)
    setLoading(true)

    promiseRef.current = _callback()

    promiseRef.current.then((payload) => {
      if (isNotCancelled) {
        setOutput(payload)
      }
    })
    .catch(e => {
      setError(e)
      onError?.(e)
    })
    .finally(() => {
      promiseRef.current = undefined
      setLoading(false)
    })

    return () => {
      isNotCancelled = false
    }
  }, [_callback, onError])

  const reload = useCallback(async () => {
    promiseRef.current = _callback()
    return promiseRef.current.then((payload) => {
        setOutput(payload)
        setError(null)
      })
      .catch(e => {
        setError(e)
        onError?.(e)
      })
      .finally(() => {
        promiseRef.current = undefined
        setLoading(false)
      })
  }, [_callback, onError])

  return [output, {reload, loading, error, promise: promiseRef.current}]
}

export default useAsyncMemo
