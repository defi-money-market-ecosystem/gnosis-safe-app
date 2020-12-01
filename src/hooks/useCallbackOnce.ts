import { useState, useCallback } from 'react'


const useCallbackOnce = (callback: Function) => {
  const [called, setCalled] = useState(false)
  const [returnValue, setReturnValue] = useState()

  const _callback = useCallback((...args) => {
    if (!called) {
      setCalled(true)
      setReturnValue(callback(...args))
    }
    return returnValue
  }, [callback, called, returnValue])

  return _callback
}

export default useCallbackOnce