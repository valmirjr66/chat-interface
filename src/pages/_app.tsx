import '@/styles/globals.css'
import { ThemeProvider } from '@emotion/react'
import { createTheme } from '@mui/material';
import { ptBR } from '@mui/x-date-pickers/locales'

const theme = createTheme(
  {
    palette: {
      primary: { main: '#1976d2' },
    },
  },
  ptBR
);


export default function App({ Component, pageProps }) {
  return <ThemeProvider theme={theme}><Component {...pageProps} /></ThemeProvider>
}
