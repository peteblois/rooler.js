import { applyRootStyle, createElement, Disposer, listen, Position} from "./base";
import { ScreenShot } from "./screenshot";
import {default as closeIcon}  from './close.png';

export class Magnifier {
  private readonly root: HTMLElement;
  private readonly canvas: HTMLCanvasElement;
  private readonly context: CanvasRenderingContext2D;
  private readonly width = 300;
  private readonly height = 300;
  private readonly magnification = 4;
  private offset: Position = {x: 0, y: 0};
  private base: Position = {x: 0, y: 0};
  private canClose = false;
  private readonly closeButton: HTMLElement;
  private readonly colorPreview: HTMLElement;
  private readonly pixelColorText: HTMLElement;
  private readonly positionText: HTMLElement;
  protected readonly disposer = new Disposer();

  constructor(private readonly screenShot: ScreenShot) {
    this.root = createElement('div', 'roolerRoot');
    applyRootStyle(this.root);
    const magnifier = createElement('div', 'roolerMagnifier');
    this.root.appendChild(magnifier);

    this.canvas = createElement('canvas', 'roolerMagnifierCanvas') as HTMLCanvasElement;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.canvas.style.imageRendering = 'optimizespeed';

    this.context = this.canvas.getContext('2d')!;
    magnifier.appendChild(this.canvas);
    magnifier.appendChild(createElement('div', 'roolerMagnifierCrosshairV'));
    magnifier.appendChild(createElement('div', 'roolerMagnifierCrosshairH'));

    this.closeButton = createElement('a', 'roolerMagnifierCloseButton');
    this.closeButton.title = 'Close';
    var icon = createElement('div', 'roolerMagnifierCloseIcon');
    this.closeButton.appendChild(icon);
    icon.style.background = 'url(' + closeIcon + ')';
    this.closeButton.addEventListener('click', () => {
      this.handleClose();
    });
    magnifier.appendChild(this.closeButton);

    this.colorPreview = createElement('div', 'roolerMagnifierColorPreview');
    magnifier.appendChild(this.colorPreview);

    this.pixelColorText = createElement('div', 'roolerMagnifierColorText');
    magnifier.appendChild(this.pixelColorText);
    this.pixelColorText.textContent = '#FFFFFF';

    this.positionText = createElement('div', 'roolerMagnifierPositionText');
    magnifier.appendChild(this.positionText);
    this.positionText.textContent = '0,0';
  }

  show() {
    document.body.appendChild(this.root);

    this.disposer.add(listen(document, 'mousemove', (event: MouseEvent) => {
      this.handleMouseMove(event);
    }));

    this.disposer.add(listen(document, 'keydown', (event: KeyboardEvent) => {
      this.handleKeyDown(event);
    }));

    this.disposer.add(listen(window, 'scroll', () => {
      this.handleWindowScroll();
    }));
  }

  private update() {
    this.context.fillStyle = 'transparent';

    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.context.save();
    var scale = this.magnification;
    var offset = {
      x: (this.offset.x - window.pageXOffset) - this.canvas.width / 2 / scale,
      y: (this.offset.y - window.pageYOffset) - this.canvas.height / 2 / scale
    }
    Magnifier.scale(this.screenShot.canvas, this.canvas, scale, offset);

    this.positionText.textContent = (this.offset.x - this.base.x) + ', ' + (this.offset.y - this.base.y);

    const pixel = this.context.getImageData(this.width / 2 - scale, this.height / 2 - scale, 1, 1);
    const color = this.colorToHex(pixel.data[0], pixel.data[1], pixel.data[2]);
    this.pixelColorText.textContent = color;
    this.colorPreview.style.background = color;

    this.context.restore();
  }

  private colorToHex(r: number, g: number, b: number): string {
    function toHex(v: number) {
      var str = v.toString(16).toUpperCase();
      if (str.length == 1) {
        str = '0' + str;
      }
      return str;
    }
    return '#' + toHex(r) + toHex(g) + toHex(b);
  }

  static scale(srcCanvas: HTMLCanvasElement, dstCanvas: HTMLCanvasElement, scale: number, offset: Position) {
    const height = dstCanvas.height;
    const width = dstCanvas.width;
    const src = srcCanvas.getContext('2d')!;
    const dst = dstCanvas.getContext('2d')!;
    const srcImageData = src.getImageData(offset.x, offset.y, width / scale, height / scale);
    const srcData = srcImageData.data;

    const dstImageData = dst.getImageData(0, 0, width, height);
    const dstData = dstImageData.data;
    for (let y = 0; y < height; ++y) {
      let dstIndex = (y * dstCanvas.width) * 4;
      for (let x = 0; x < width; ++x) {
        var srcIndex = (Math.round(y / scale) * srcImageData.width + Math.round(x / scale)) * 4;
        dstData[dstIndex] = srcData[srcIndex];
        dstData[dstIndex + 1] = srcData[srcIndex + 1];
        dstData[dstIndex + 2] = srcData[srcIndex + 2];
        dstData[dstIndex + 3] = srcData[srcIndex + 3];

        dstIndex += 4;
      }
    }
    dst.putImageData(dstImageData, 0, 0);
  }

  setCanClose(canClose: boolean) {
    this.canClose = canClose;
    this.closeButton.toggleAttribute('roolerHidden', !canClose)
  }

  private handleKeyDown(e: KeyboardEvent) {
    if (e.keyCode == 32) {
      e.preventDefault();
      this.base.x = this.offset.x;
      this.base.y = this.offset.y;

      this.update();
    } else if (e.keyCode == 37) {
      this.offset.x -= 1;
      this.update();
      e.preventDefault();
    } else if (e.keyCode == 38) {
      this.offset.y -= 1;
      this.update();
      e.preventDefault();
    } else if (e.keyCode == 39) {
      this.offset.x += 1;
      this.update();
      e.preventDefault();
    } else if (e.keyCode == 40) {
      this.offset.y += 1;
      this.update();
      e.preventDefault();
    }
  }

  private handleMouseMove(e: MouseEvent) {
    this.offset = {
      x: e.pageX,
      y: e.pageY,
    };
    this.update();
  }

  handleClose() {
    this.close();
  }

  close() {
    this.disposer.dispose();
    this.root.remove();
  }

  handleWindowScroll() {
    this.screenShot.requestUpdate();
  }
}
