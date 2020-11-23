import {Color} from './base';

export interface Rect {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

export class ScreenShot {
  canvas: HTMLCanvasElement;
  imageData: ImageData;
  private data: Uint8ClampedArray;
  top = 0;
  left = 0;
  right: number;
  bottom: number;
  private width: number;

  constructor(canvas: HTMLCanvasElement, private readonly updater: ()=>void = ()=>{}) {
    this.canvas = canvas;
    const context = this.canvas.getContext('2d')!;
    this.imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    this.right = this.imageData.width;
    this.bottom = this.imageData.height;
    this.data = this.imageData.data;
    this.width = this.imageData.width;
    this.updateCanvas(canvas);
  }

  static fromImage(img: HTMLImageElement) {
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;

    const context = canvas.getContext('2d')!;
    context.fillStyle = 'white'
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.drawImage(img, 0, 0);

    return new ScreenShot(canvas);
  }

  static fromCanvas(canvas: HTMLCanvasElement) {
    return new ScreenShot(canvas);
  }

  getScreenPixel(x: number, y: number, pixel: Color) {
    var index = (y * 4) * this.width + (x * 4);
    pixel.r = this.data[index];
    pixel.g = this.data[index + 1];
    pixel.b = this.data[index + 2];
  }

  captureRect(rect: Rect): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = (rect.right - rect.left);
    canvas.height = (rect.bottom - rect.top);

    const context = canvas.getContext('2d')!;
    context.translate(-rect.left, -rect.top);
    context.scale(1 / window.devicePixelRatio, 1 / window.devicePixelRatio);
    context.drawImage(this.canvas, 0, 0);

    return canvas;
  }

  requestUpdate() {
    this.updater();
  }

  updateCanvas(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = this.canvas.getContext('2d')!;
    this.imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    this.right = this.imageData.width;
    this.bottom = this.imageData.height;
    this.data = this.imageData.data;
    this.width = this.imageData.width;
  }
}
