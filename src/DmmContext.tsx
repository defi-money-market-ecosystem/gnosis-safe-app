import React, {
  createContext,
  Dispatch,
  useReducer,
  useMemo,
  useContext,
} from "react"
import { Erc20Token, Maybe } from "./types"
import { SafeInfo } from "@gnosis.pm/safe-apps-sdk"
import { Wallet } from "use-wallet"
import { TokenDetailsType } from "consts"

export interface AppState {
  tokens: Record<Erc20Token, Maybe<TokenDetailsType>>
  tokenKeys: Array<Erc20Token>
  loading: boolean
  selectedToken: Erc20Token
  safeInfo: Maybe<SafeInfo>
  wallet: Maybe<Wallet<any>>
}

export interface Action {
  type: string
  payload?: any
}

export type DmmReducerType = (
  arg0: AppState | undefined,
  arg1: Action
) => AppState

export interface DmmContextType {
  dispatch: Dispatch<Action>
  state: AppState
}

export const initialState: AppState = {
  tokens: {
    ETH: null,
    DAI: null,
    USDC: null,
    USDT: null,
  },
  tokenKeys: [],
  loading: true,
  selectedToken: "ETH",
  safeInfo: null,
  wallet: null,
}

const DmmContext = createContext<DmmContextType>({
  state: initialState,
  dispatch: () => {},
})

const compose = (...funcs: Array<any>) => (x: Dispatch<Action>) =>
  funcs.reduceRight((composed, f) => f(composed), x)

export const useStore = (
  reducer: DmmReducerType,
  initialState: AppState,
  middlewares: Array<Function> = []
) => {
  const [state, dispatch] = useReducer(reducer, initialState)

  let enhancedDispatch: Dispatch<Action>

  const middlewareApi = {
    getState: () => state,
    dispatch: (action: Action) =>
      enhancedDispatch ? enhancedDispatch(action) : dispatch(action),
  }

  enhancedDispatch = useMemo(() => {
    const chain = middlewares.map((middleware) => middleware(middlewareApi))
    return compose(...chain)(dispatch)
  }, [middlewareApi, middlewares])

  return { state, dispatch: enhancedDispatch }
}

export function connect<T>(
  mapStateToProps: (state: AppState, props: T) => any = () => ({}),
  mapDispatchToProps: (
    dispatch: Dispatch<Action>,
    props: any
  ) => any = () => ({})
) {
  return (WrappedComponent: React.ComponentType<T>) => (props: any) => {
    const { state, dispatch } = useContext(DmmContext)
    const propsWithStateDerived = {
      ...props,
      ...mapStateToProps(state, props),
    }

    const allProps = {
      ...propsWithStateDerived,
      ...mapDispatchToProps(dispatch, propsWithStateDerived),
    }

    return <WrappedComponent {...allProps} />
  }
}

export default DmmContext
