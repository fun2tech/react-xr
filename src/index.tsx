// @ts-ignore
import PseudoWorker from "pseudo-worker/index";
import React from "react";
import ReactDOM from "react-dom";
import App from "./App";

// It appears that webworkers are disabled when user is in XR session
// no idea why
// @ts-ignore
global.Worker = PseudoWorker;

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById("root")
);
