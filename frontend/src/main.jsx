import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { UserProvider } from "./context/UserContext";
import process from "process";
import { Buffer } from "buffer";
import "leaflet/dist/leaflet.css";


window.process = process;
window.Buffer = Buffer;
window.global = window;

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <UserProvider>
      <App />
    </UserProvider>
  </StrictMode>
);
