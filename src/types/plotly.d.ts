declare module 'plotly.js-dist-min' {
  import { PlotData, Layout, Config } from 'plotly.js';
  
  export default function plotly(
    element: HTMLElement | string,
    data: PlotData[],
    layout?: Partial<Layout>,
    config?: Partial<Config>
  ): Promise<void>;
  
  export function newPlot(
    element: HTMLElement | string,
    data: PlotData[],
    layout?: Partial<Layout>,
    config?: Partial<Config>
  ): Promise<void>;
  
  export function react(
    element: HTMLElement | string,
    data: PlotData[],
    layout?: Partial<Layout>,
    config?: Partial<Config>
  ): Promise<void>;
  
  export * from 'plotly.js';
}

