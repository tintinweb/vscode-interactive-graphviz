import React, { useEffect, useRef } from "react";
import { VSCodeTextField } from "@vscode/webview-ui-toolkit/react";

export default function TextField({
  children,
  placeholder,
  onEnter,
  onType,
  style,
  initial,
}:{
  initial?: string,
  children: React.ReactNode,
  placeholder?: string,
  // eslint-disable-next-line no-unused-vars
  onEnter: (s:string) => void,
  // eslint-disable-next-line no-unused-vars
  onType?: (s:string) => void,
  style?: React.CSSProperties,
}) : JSX.Element {
  const ref = useRef();

  useEffect(() => {
    if (!initial || initial === "") return;
    (ref.current as any).value = initial;
  }, [ref, ref.current]);

  return <VSCodeTextField
    placeholder={placeholder}
    ref={ref as any}
    style={style}
    onKeyDown={(e) => {
      const string = (e.target as any).value;
      if (e.key !== "Enter") {
        return;
      }
      onEnter(string);
    }}
    onKeyUp={(e) => {
      const string = (e.target as any).value;
      if (e.key !== "Enter") {
        if (onType) {
          onType(string);
        }
      }
    }}
  >
    {children}
  </VSCodeTextField>;
}
