
export function clamp(value: number, min: number, max: number): number {
  return Math.max(Math.min(value, max), min);
}

export interface Color {
  r: number;
  g: number;
  b: number;
}

export function getScreenPixel(data: ImageData, x: number, y: number, pixel: Color) {
  var index = (y * 4) * data.width + (x * 4);
  pixel.r = data.data[index];
  pixel.g = data.data[index + 1];
  pixel.b = data.data[index + 2];
}

export function createElement(type: string, className: string): HTMLElement {
  const element = document.createElement(type);
  element.classList.add(className);
  return element;
}

export interface Position {
  x: number;
  y: number;
}

export interface IDisposable {
  dispose(): void;
}

export class Disposer implements IDisposable {
  private disposables_: IDisposable[] = [];

  add(disposable: IDisposable) {
    this.disposables_.push(disposable);
  }

  dispose() {
    for (const disposable of this.disposables_) {
      disposable.dispose();
    }
    this.disposables_ = [];
  }
}

export function listen<T>(target: EventTarget, event: string, listener: (event: T)=>void, options?: AddEventListenerOptions): IDisposable {
  const fn = (event: T) => {
    listener(event);
  }
  target.addEventListener(event, fn as any, options);
  return {
    dispose: () => {
      target.removeEventListener(event, fn as any, options);
    },
  }
}
