import React from "react"
import ReactDOM from "react-dom"
import { ThemeProvider } from "styled-components"
import SafeProvider from "@gnosis.pm/safe-apps-react-sdk"
import GlobalStyle from "./GlobalStyle"
import App from "./App"
import { MuiThemeProvider, StylesProvider } from "@material-ui/core"
import muiTheme from "./theme"
import { UseWalletProvider } from "use-wallet"
import { chainId } from "consts"

ReactDOM.render(
  <StylesProvider injectFirst>
    <MuiThemeProvider theme={muiTheme}>
      <ThemeProvider theme={muiTheme}>
        <GlobalStyle />
        <SafeProvider loader={<div />}>
          <UseWalletProvider chainId={chainId || 1}>
            <App />
          </UseWalletProvider>
        </SafeProvider>
      </ThemeProvider>
    </MuiThemeProvider>
  </StylesProvider>,
  document.getElementById("root")
)
