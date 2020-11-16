import React from "react"
import ReactDOM from "react-dom"
import { ThemeProvider } from "styled-components"
import { Loader, Title } from "@gnosis.pm/safe-react-components"
import SafeProvider from "@rmeissner/safe-apps-react-sdk"

import GlobalStyle from "./GlobalStyle"
import App from "./App"
import { MuiThemeProvider, StylesProvider } from "@material-ui/core"
import muiTheme from "./theme"

ReactDOM.render(
  <React.StrictMode>
    <StylesProvider injectFirst>
      <MuiThemeProvider theme={muiTheme}>
        <ThemeProvider theme={muiTheme}>
          <GlobalStyle />
          <SafeProvider
            loading={
              <>
                <Title size="md">Waiting for Safe...</Title>
                <Loader size="md" />
              </>
            }
          >
            <App />
          </SafeProvider>
        </ThemeProvider>
      </MuiThemeProvider>
    </StylesProvider>
  </React.StrictMode>,
  document.getElementById("root")
)
