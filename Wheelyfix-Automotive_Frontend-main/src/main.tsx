import { createRoot } from "react-dom/client";
import { AuthProvider } from "./contexts/AuthContext";
import App from "./App.tsx";
import "./index.css";

// Wrap application with ThemeProvider to enable dark/light mode switching
// using class strategy so Tailwind 'dark:' variants apply.
// Disable system match to keep explicit toggling simple.

// Global ThemeProvider removed to restrict dark mode to admin panel only.
createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <App />
  </AuthProvider>
);
