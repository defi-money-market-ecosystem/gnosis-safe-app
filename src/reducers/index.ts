import { Action, AppState, DmmReducerType, initialState } from 'DmmContext'
import { map } from 'lodash'

const DmmReducer: DmmReducerType = (state: AppState = initialState, action: Action) => {
  switch(action.type) {
    case 'LOADING': 
      return {
        ...initialState,
        loading: true
      }
    case 'RESET_STATE': 
      return {
        tokens: action.payload.tokens,
        tokenKeys: map(action.payload.tokens, 'symbol'),
        loading: false
      }
    case 'UPDATE_BALANCE': {
      const { token ,balance } = action.payload || {}
      return {...state, tokens: {...state.tokens, [token]: {...state?.tokens?.[token as string], balance }}}
    }
    case 'UPDATE_EXCHANGE_RATE': {
      const { token ,exchangeRate } = action.payload || {}
      return {...state, tokens: {
        ...state.tokens,
        [token]: {
          ...state?.tokens?.[token as string],
          exchangeRate
        }
      }}
    }
    default:
      return state
  }
}

export default DmmReducer