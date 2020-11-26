import { createMuiTheme } from "@material-ui/core/styles"
import { theme as gnosisTheme } from '@gnosis.pm/safe-react-components';

const theme = createMuiTheme({
  ...gnosisTheme,
  palette: {
    primary: {
      main: "#327ccb",
      contrastText: '#ffffff'
    },
    secondary: {
      main: "#8b9db1",
      contrastText: '#ffffff'
    },
    text: {
      primary:'#0a2a5a',
      secondary: '#c1c5d0'
    },
    error: {
      main: '#ff2972'
    },
    action: {
      disabledBackground: 'rgba(50,124,203,.3)'
    }
  },
  typography: {
    fontFamily: [
      'Open Sans', 'sans-serif'
    ].join(',')
  },
  spacing: 0.5,
})

export default theme