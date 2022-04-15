/* eslint-disable import/prefer-default-export */
import React from "react";
import ReactDOM from "react-dom/client";
import { ActivationFunction } from "vscode-notebook-renderer";

export const activate : ActivationFunction = () => ({
  renderOutputItem: (data: any, element: any) => {
    console.log("hello world");
    const root = ReactDOM.createRoot(element);
    root.render(<h2>Test</h2>);
  },
});
