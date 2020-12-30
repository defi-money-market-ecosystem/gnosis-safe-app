import dmmReducer from "reducers"
import DmmContext, { initialState, useStore } from "DmmContext"
import React, { useEffect } from "react"
import styled from "styled-components"
import SwapPanel from "./components/SwapPanel"
import dataMiddleware from "middlewares/dataMiddleware"
import gnosisSafeSdk from "gnosisSafeSdk"
import { useWallet } from "use-wallet"
import {
  reload,
  safeInfoReceived,
  safeTransactionConfirmed,
  safeTransactionRejected,
} from "actions"
import useCallbackOnce from "hooks/useCallbackOnce"
import observerMiddleware from "middlewares/observerMiddleware"
import { SafeInfo } from "@gnosis.pm/safe-apps-sdk"
import BalancesPanel from "components/Balances"
import Grid from "@material-ui/core/Grid"

const REFRESH_INTERVAL =
  (Number(process.env.REACT_APP_REFRESH_INTERVAL) || 15) * 1000

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
  const { dispatch, state } = contextValue

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

  useEffect(() => {
    const interval = setInterval(() => {
      if (!state.loading && Date.now() - state.lastUpdate >= REFRESH_INTERVAL) {
        dispatch(reload())
      }
    }, REFRESH_INTERVAL)

    return () => clearInterval(interval)
  }, [dispatch, state])

  return (
    <Container>
      <DmmContext.Provider value={contextValue}>
        <Grid container spacing={10}>
          <Grid item md={6} xs={12}>
            <SwapPanel />
          </Grid>
          <Grid item md={6} xs={12}>
            <BalancesPanel />
          </Grid>
        </Grid>
      </DmmContext.Provider>
    </Container>
  )
}

export default App
