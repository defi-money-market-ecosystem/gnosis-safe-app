import { createContext, Dispatch } from "react";

export interface AppState {
  tokens: Record<string, any>,
  tokenKeys: Array<string>
  loading: boolean
}

export interface Action {
  type: string
  payload?: any
}

export type DmmReducerType = (arg0: AppState | undefined, arg1: Action) => AppState

export interface DmmContextType {
  dispatch: Dispatch<Action>
  state: AppState
}

export const initialState: AppState = { tokens: {}, tokenKeys: [], loading: false }

const DmmContext = createContext<DmmContextType>({state: initialState, dispatch: () => {}})

export default DmmContext