declare module "solid-js/web" {
  export function render(code: () => any, element: HTMLElement): void;
}

declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}
