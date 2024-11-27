import { ThemeProvider } from "@emotion/react";
import { createTheme } from "@mui/material";
import { ptBR } from "@mui/x-date-pickers/locales";
import "./App.css";
import Conversation from "./pages/Conversation";
import Font from "react-font";
import Login from "./pages/Login";

const theme = createTheme(
  {
    palette: {
      primary: { main: "#1976d2" },
    },
  },
  ptBR
);

function App() {
  const userId = localStorage.getItem("userId");

  return (
    <ThemeProvider theme={theme}>
      <Font family="Overpass Mono">
        {userId ? <Conversation /> : <Login />}
      </Font>
    </ThemeProvider>
  );
}

export default App;
