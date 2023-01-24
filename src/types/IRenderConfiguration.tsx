export type IRenderConfiguration = {
  transitionDelay?: number;
  transitionDuration?: number;
  themeColors?: boolean;
};

export type IMessageSetConfiguration = {
  command: "setConfiguration";
  value: IRenderConfiguration;
};

export type IRenderCommunication = {
  command: "saveAs",
  value: {
    data: any,
    type: string,
  }
}
  | { command: "ready", value: {} }
  | { command: "renderDot", value: string }
  | {
    command: "setConfiguration",
    value: {
      transitionDelay: number | undefined,
      transitionDuration: number | undefined,
      themeColors: boolean | undefined,
    },
  }
  | { command: "onRenderFinished", value: { err?: string } }
  | {
    command: "openNewWindow",
    value: string
  }
