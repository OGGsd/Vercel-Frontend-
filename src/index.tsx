import ReactDOM from "react-dom/client";
import reportWebVitals from "./reportWebVitals";

import "./style/classes.css";
// @ts-ignore
import "./style/index.css";
// @ts-ignore
import "./App.css";
import "./style/applies.css";

// Import and initialize comprehensive security measures
import { initializeSecurity } from "./utils/security-utils";

// Initialize security to hide sensitive URLs and data from console
initializeSecurity();

// @ts-ignore
import App from "./customization/custom-App";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement,
);

root.render(<App />);
reportWebVitals();
