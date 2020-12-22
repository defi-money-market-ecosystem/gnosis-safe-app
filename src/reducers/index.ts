import { Erc20Token } from "types"
import { Action, AppState, DmmReducerType, initialState } from "DmmContext"
import { DmmTokenDetailsType } from "services/DMMTokenService"

const dmmReducer: DmmReducerType = (
  state: AppState = initialState,
  action: Action
): AppState => {

  switch (action.type) {
    case "SET_ETH_PRICE":
      return {
        ...state,
        ethPrice: action.payload.price,
      }
    case "SET_TOKENS":
      return {
        ...state,
        tokens: action.payload.tokens as Record<
          Erc20Token,
          DmmTokenDetailsType
        >,
        loading: false,
        lastUpdate: Date.now()
      }
    case "SAFE_INFO_RECEIVED":
      return {
        ...state,
        safeInfo: action.payload.safeInfo,
      }
    case "CHANGE_TOKEN": {
      const { token } = action.payload
      return {
        ...state,
        selectedToken: token,
      }
    }
    case "SET_WALLET":
      return {
        ...state,
        wallet: action.payload.wallet,
      }
    case "RELOAD":
      return {
        ...state,
        loading: true,
      }
    default:
      return state
  }
}

export default dmmReducer
