"use client";

import { ThemeProvider } from "@emotion/react";
import { createTheme } from "@mui/material";
import { ptBR } from "@mui/x-date-pickers/locales";
import { ErrorBoundary, FallbackProps } from "react-error-boundary";
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

function fallbackRender({ error, resetErrorBoundary }: FallbackProps) {
  // TODO: Implement a pretty fallback page
  return (
    <div
      role="alert"
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        flexDirection: "column",
      }}
    >
      <p style={{ textAlign: "center" }}>Something went wrong:</p>
      <pre style={{ textAlign: "center", color: "red" }}>{error.message}</pre>
      <p style={{ display: "flex", justifyContent: "center" }}>
        <button onClick={resetErrorBoundary} style={{ padding: 6 }}>
          Try again
        </button>
      </p>
    </div>
  );
}

function App() {
  const userId = localStorage.getItem("userId");

  return (
    <ErrorBoundary
      fallbackRender={fallbackRender}
      onReset={(details) => {
        // Reset the state of your app so the error doesn't happen again
      }}
    >
      <ThemeProvider theme={theme}>
        <SkeletonTheme baseColor="#7a7a7a" highlightColor="#d2d2d2">
          <Font family="Overpass Mono">{userId ? <Chat /> : <Login />}</Font>
        </SkeletonTheme>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
