export type IRenderConfiguration = {
  transitionDelay?: number;
  transitionDuration?: number;
  themeColors?: boolean;
};

export type IMessageSetConfiguration = {
  command: "setConfiguration";
  value: IRenderConfiguration;
};
