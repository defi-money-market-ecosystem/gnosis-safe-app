import { Erc20Token } from 'types'
import { Action, AppState, DmmReducerType, initialState } from "DmmContext"
import { map } from "lodash"
import { DmmTokenDetailsType } from 'services/DMMTokenService'

const dmmReducer: DmmReducerType = (
  state: AppState = initialState,
  action: Action
): AppState => {
  console.log({action, state, where: "DmmReducer"})

  switch (action.type) {
    case "SET_TOKENS":
      return {
        ...state,
        tokens: action.payload.tokens as Record<Erc20Token, DmmTokenDetailsType>,
        tokenKeys: map(action.payload.tokens, "symbol"),
        loading: false,
      }
    case "SAFE_INFO_RECEIVED":
      return {
        ...state,
        safeInfo: action.payload.safeInfo
      }
    case "CHANGE_TOKEN": {
      const {token} = action.payload
      return {
        ...state,
        selectedToken: token
      }
    }
    case "SET_WALLET": 
      return {
        ...state,
        wallet: action.payload.wallet
      }
    default:
      return state
  }
}

export default dmmReducer
