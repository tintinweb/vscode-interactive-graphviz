/* eslint-disable import/prefer-default-export */
import React from "react";
import ReactDOM from "react-dom/client";

// export const a = 1;

export const activate = () => ({
  renderOutputItem: (data: any, element: any) => {
    const root = ReactDOM.createRoot(element);
    root.render(<h2>Test</h2>);
  },
});

// export const activate: ActivationFunction = (/* context: any */) => ({
/* renderOutputItem(data: { json: () => any; }, element: any) {
    // eslint-disable-next-line no-param-reassign
    element.innerText = JSON.stringify(data.json());
    // @ts-ignore
    const root = ReactDOM.createRoot(element);
    root.render(<h2>Test</h2>);
  }, */
// });
