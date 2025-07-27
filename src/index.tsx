import ReactDOM from "react-dom/client";
import reportWebVitals from "./reportWebVitals";

import "./style/classes.css";
// @ts-ignore
import "./style/index.css";
// @ts-ignore
import "./App.css";
import "./style/applies.css";

// Security completely disabled for React compatibility
// import { initializeSecurity } from "./utils/security-utils";
// initializeSecurity();

// Import and display annoying console message
import { displayAxieStudioConsoleMessage } from "./utils/utils";

// @ts-ignore
import App from "./customization/custom-App";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement,
);

root.render(<App />);

// Display annoying console message to deter developers
displayAxieStudioConsoleMessage();

reportWebVitals();
