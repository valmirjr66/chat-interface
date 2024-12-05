import { ThemeProvider } from "@emotion/react";
import { createTheme } from "@mui/material";
import { ptBR } from "@mui/x-date-pickers/locales";
import Font from "react-font";
import { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import "./App.css";
import Chat from "./pages/Chat";
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
      <SkeletonTheme baseColor="#7a7a7a" highlightColor="#d2d2d2">
        <Font family="Overpass Mono">{userId ? <Chat /> : <Login />}</Font>
      </SkeletonTheme>
    </ThemeProvider>
  );
}

export default App;
