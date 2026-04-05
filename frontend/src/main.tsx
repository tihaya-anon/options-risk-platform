import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter } from "react-router-dom";
import "./style.css";
import { App } from "./ui/App";
import { enableMocking } from "./mocks/bootstrap";

async function bootstrap() {
  await enableMocking();

  ReactDOM.createRoot(document.getElementById("app")!).render(
    <React.StrictMode>
      <HashRouter>
        <App />
      </HashRouter>
    </React.StrictMode>
  );
}

void bootstrap();
