import dmmReducer from "reducers"
import DmmContext, { initialState, useStore } from "DmmContext"
import React, { useEffect } from "react"
import styled from "styled-components"
import SwapPanel from "./components/SwapPanel"
import dataMiddleware from "middlewares/dataMiddleware"
import gnosisSafeSdk from "gnosisSafeSdk"
import { useWallet } from "use-wallet"
import {
  safeInfoReceived,
  safeTransactionConfirmed,
  safeTransactionRejected,
} from "actions"
import observerMiddleware from "middlewares/observerMiddleware"
import useCallbackOnce from "hooks/useCallbackOnce"
import { SafeInfo } from "@gnosis.pm/safe-apps-sdk"

const Container = styled.form`
  margin-bottom: 2rem;
  width: 100%;
  max-width: 1100px;

  display: flex;
  justify-items: space-between;
`
const middlewares = [dataMiddleware, observerMiddleware]

const App: React.FC = () => {
  const wallet = useWallet()
  const contextValue = useStore(
    dmmReducer,
    { ...initialState, wallet },
    middlewares
  )
  const { dispatch } = contextValue

  const dispatchSafeInfoReceived = useCallbackOnce((safeInfo: SafeInfo) => {
    if (!contextValue.state.safeInfo) {
      dispatch(safeInfoReceived(safeInfo))
    }
  })

  useEffect(() => {
    gnosisSafeSdk.addListeners({
      onSafeInfo: (safeInfo) => dispatchSafeInfoReceived(safeInfo),
      onTransactionConfirmation: (e) =>
        dispatch(safeTransactionConfirmed(e.safeTxHash)),
      onTransactionRejection: (e) => dispatch(safeTransactionRejected()),
    })

    return () => gnosisSafeSdk.removeListeners()
  }, [dispatch, dispatchSafeInfoReceived])

  return (
    <Container>
      <DmmContext.Provider value={contextValue}>
        <SwapPanel />
      </DmmContext.Provider>
    </Container>
  )
}

export default App
