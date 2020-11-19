import { Dispatch, useEffect } from "react"
import { Action } from "DmmContext"

class Observable {
  observers: Function[] = []

  subscribe(fn: (action: Action) => void) {
    this.observers.push(fn)

    return () => {
      this.observers = this.observers.filter((f) => f !== fn)
    }
  }

  notify(action: Action) {
    this.observers.forEach((fn) => fn(action))
  }
}

const actionObservable = new Observable()

export const useActionListener = (
  actionTypes: string[],
  listener: (action: Action) => void
) => {
  useEffect(() => {
    const unsubscribe = actionObservable.subscribe((action) => {
      if (actionTypes.includes(action.type)) {
        listener(action)
      }
    })

    return unsubscribe
  }, [actionTypes, listener])
}

const observerMiddleware = (store: any) => (next: Dispatch<Action>) => (
  action: Action
) => {
  actionObservable.notify(action)
  next(action)
}

export default observerMiddleware
