import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";

const root = ReactDOM.createRoot(document.getElementById("root")!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Entirely for type fixin 
function onPerfEntry(performanceEntries: PerformanceEntry[]): void {
  performanceEntries.forEach((entry) => {
    console.log(entry);
    // Here, you can check the `entry.name` to log specific performance entries
    // or send them to an analytics endpoint.
  });
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals(onPerfEntry);
