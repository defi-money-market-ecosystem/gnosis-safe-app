import DmmReducer from "reducers"
import DmmContext, { DmmReducerType, initialState } from "DmmContext"
import React, { useEffect, useMemo, useReducer } from "react"
import DmmTokenService from "services/DMMTokenService"
import styled from "styled-components"
import SwapPanel from "./components/SwapPanel"

const Container = styled.form`
  margin-bottom: 2rem;
  width: 100%;
  max-width: 1100px;

  display: flex;
  justify-items: space-between;
`

const App: React.FC = () => {
  const [state, dispatch] = useReducer<DmmReducerType>(DmmReducer, initialState)

  const contextValue = useMemo(() => ({ state, dispatch }), [state, dispatch])

  useEffect(() => {
    const init = async () => {
      if (state === initialState) {
        dispatch({ type: "LOADING" })
        const tokens = await DmmTokenService.getDmmTokens()
        dispatch({ type: "RESET_STATE", payload: { tokens } })
      }
    }
    init()
  }, [state])

  return (
    <Container>
      <DmmContext.Provider value={contextValue}>
        <SwapPanel />
      </DmmContext.Provider>
    </Container>
  )
}

export default App
