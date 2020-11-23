import { createElement, listen, Position} from "./base";
import { ScreenShot } from "./screenshot";
import { Tool } from "./tool";

const circlesLeft = {
  c1: 30,
  c2: 110
};

const circlesRight = {
  c1: 180,
  c2: 100
};

const circlesTop = {
  c1: 30,
  c2: 110
};

const circlesBottom = {
  c1: 180,
  c2: 100
};

export class Loupe extends Tool {
  private readonly loupe: HTMLElement;
  private readonly canvas: HTMLCanvasElement;
  private readonly context: CanvasRenderingContext2D;
  private readonly colorPreview: HTMLElement;
  private readonly pixelColorText: HTMLElement;
  private readonly positionText: HTMLElement;
  private readonly zoomCanvas: HTMLCanvasElement;
  private base: Position = {x: 0, y: 0};
  private offset: Position = {x: 0, y: 0};
  private magnification = 4;
  private circles = {
    c1: {r: 20, x: 0, y: 0},
    c2: {r: 80, x: 0, y: 0},
  };

  constructor(screenshot: ScreenShot) {
    super(screenshot);

    this.loupe = createElement('div', 'roolerLoupe')
    this.root.appendChild(this.loupe);

    this.canvas = document.createElement('canvas');
    this.canvas.width = 210;
    this.canvas.height = 210;
    this.context = this.canvas.getContext('2d')!;
    this.loupe.appendChild(this.canvas);

    const info = createElement('div', 'roolerLoupeInfo');
    this.root.appendChild(info);
    this.colorPreview = createElement('div', 'roolerLoupeColorPreview');
    info.appendChild(this.colorPreview);
    this.pixelColorText = createElement('div', 'roolerLoupeColorText');
    info.appendChild(this.pixelColorText);
    this.pixelColorText.textContent = '#FFFFFF';
    this.positionText = createElement('div', 'roolerLoupePositionText');
    info.appendChild(this.positionText);
    this.positionText.textContent = '0,0';

    this.zoomCanvas = document.createElement('canvas');
    this.zoomCanvas.width = this.circles.c2.r * 2;
    this.zoomCanvas.height = this.circles.c2.r * 2;

    this.updateLoupe();
  }

  open() {
    super.open();
    this.disposer.add(listen(window, 'mousemove', (event: MouseEvent)=> {
      this.handleMouseMove(event);
    }));
    this.disposer.add(listen(window, 'mousedown', (event: MouseEvent)=> {
      this.handleMouseDown();
    }));
    this.disposer.add(listen(window, 'keydown', (event: KeyboardEvent)=> {
      this.handleKeyDown(event);
    }, {capture: true}));
  }

  handleMouseMove(event: MouseEvent) {
    this.offset = {
      x: event.pageX - window.pageXOffset,
      y: event.pageY - window.pageYOffset
    };

    this.update();
  }

  update() {
    this.updateLoupe();

    var c1 = this.circles.c1;
    var c2 = this.circles.c2;

    this.loupe.style.left = this.offset.x - c1.x + 'px';
    this.loupe.style.top = this.offset.y - c1.y + 'px';


    const scale = this.magnification;
    const offset = {
      x: this.offset.x * window.devicePixelRatio - c2.r / scale,
      y: this.offset.y * window.devicePixelRatio - c2.r / scale
    }
    const zoomContext = this.zoomCanvas.getContext('2d')!;
    zoomContext.clearRect(0, 0, this.zoomCanvas.width, this.zoomCanvas.height);

    Loupe.scale(this.screenShot.canvas, this.zoomCanvas, scale, offset);
    zoomContext.strokeStyle = 'rgba(255, 0, 0, .5)';
    zoomContext.lineWidth = 1;
    zoomContext.beginPath();
    zoomContext.moveTo(this.zoomCanvas.width / 2, 0);
    zoomContext.lineTo(this.zoomCanvas.width / 2, this.zoomCanvas.height);
    zoomContext.moveTo(0, this.zoomCanvas.height / 2);
    zoomContext.lineTo(this.zoomCanvas.width, this.zoomCanvas.height / 2);
    zoomContext.stroke();

    const ctx = this.context;

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(c2.x, c2.y);
    ctx.arc(c2.x, c2.y, c2.r - 5, 0, 2 * Math.PI);
    ctx.clip();
    this.context.drawImage(this.zoomCanvas,
      c2.x - c2.r, c2.y - c2.r,
      this.zoomCanvas.width, this.zoomCanvas.height);

    ctx.restore();

    this.positionText.textContent = (this.offset.x - this.base.x) + ', ' + (this.offset.y - this.base.y);

    const pixel = zoomContext.getImageData(this.zoomCanvas.width / 2 - scale / 2, this.zoomCanvas.height / 2 - scale / 2, 1, 1);
    const color = this.colorToHex(pixel.data[0], pixel.data[1], pixel.data[2]);
    this.pixelColorText.textContent = color;
    this.colorPreview.style.background = color;

    const gradient = ctx.createLinearGradient(0, 0, 0, c2.r * 2);
    gradient.addColorStop(0, '#666');
    gradient.addColorStop(1, '#555');
    ctx.fillStyle = 'white';
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.arc(c2.x, c2.y, c2.r - 5, 0, Math.PI * 2, false);
    ctx.stroke();
  }

  updateLoupe() {
    const width = document.body.clientWidth;
    const height = window.innerHeight;

    let changed = false;
    if (this.offset.x - circlesLeft.c1 + circlesLeft.c2 + this.circles.c2.r > width) {
      if (this.circles.c1.x != circlesRight.c1) {
        changed = true;
        this.circles.c1.x = circlesRight.c1;
        this.circles.c2.x = circlesRight.c2;
      }
    } else if (this.circles.c1.x != circlesLeft.c1) {
      changed = true;
      this.circles.c1.x = circlesLeft.c1;
      this.circles.c2.x = circlesLeft.c2;
    }

    if (this.offset.y - circlesTop.c1 + circlesTop.c2 + this.circles.c2.r > height) {
      if (this.circles.c1.y != circlesBottom.c1) {
        changed = true;
        this.circles.c1.y = circlesBottom.c1;
        this.circles.c2.y = circlesBottom.c2;
      }
    } else if (this.circles.c1.y != circlesTop.c1) {
      changed = true;
      this.circles.c1.y = circlesTop.c1;
      this.circles.c2.y = circlesTop.c2;
    }
    if (changed) {
      this.drawLoupe();
    }
  }

  colorToHex(r: number, g: number, b: number): string{
    function toHex(v: number) {
      var str = v.toString(16).toUpperCase();
      if (str.length == 1) {
        str = '0' + str;
      }
      return str;
    }
    return '#' + toHex(r) + toHex(g) + toHex(b);
  }

  drawLoupe() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    function ray(origin: Position, radius: number, distance: number) {
      return {
        x: origin.x + Math.cos(radius) * distance,
        y: origin.y + Math.sin(radius) * distance
      };
    }

    const ctx = this.context;

    const c1 = this.circles.c1;
    const c2 = this.circles.c2;

    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, .8)';

    const angle = Math.atan2(c2.y - c1.y, c2.x - c1.x);

    const spread1 = Math.PI / 4;
    // Point at which the bezier curve A leaves circle 1.
    const c1a = ray(c1, angle - spread1, c1.r);
    // Control point for bezier curve A as it leaves circle 1.
    const cpa1 = ray(c1a, angle - spread1 + Math.PI / 2, c1.r / 3);
    // Point at which the bezier curve B leaves circle 1.
    const c1b = ray(c1, angle + spread1, c1.r);
    // Control point for bezier curve B as it leaves circle 1.
    const cpb1 = ray(c1b, angle + spread1 - Math.PI / 2, c1.r / 3);

    const spread2 = Math.PI / 8;
    const c2a = ray(c2, angle + spread2 + Math.PI, c2.r);
    const cpa2 = ray(c2a, angle + spread2 + Math.PI / 2, c2.r / 3);
    const c2b = ray(c2, angle - spread2 + Math.PI, c2.r);
    const cpb2 = ray(c2b, angle - spread2 + Math.PI + Math.PI / 2, c2.r / 3);

    ctx.beginPath();

    ctx.moveTo(c1a.x, c1a.y);
    ctx.bezierCurveTo(cpa1.x, cpa1.y, cpa2.x, cpa2.y, c2a.x, c2a.y);

    ctx.arc(c2.x, c2.y, c2.r, angle + spread2 + Math.PI, angle - spread2 + Math.PI);
    ctx.bezierCurveTo(cpb2.x, cpb2.y, cpb1.x, cpb1.y, c1b.x, c1b.y);
    ctx.arc(c1.x, c1.y, c1.r, angle - spread1, angle + spread1, true);
    ctx.moveTo(c1.x, c1.y);
    ctx.arc(c1.x, c1.y, c1.r - 5, angle + spread1, angle + spread1 + Math.PI * 2, false);

    ctx.shadowColor = 'rgba(0,0,0,.7)';
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 5;
    ctx.shadowBlur = 10;

    ctx.fill();
    ctx.restore();
  }

  handleMouseDown() {
    if (this.canClose) {
      this.close();
    }
  }

  handleKeyDown(event: KeyboardEvent) {
    if (event.code == 'Space') {
      event.preventDefault();
      event.stopPropagation();

      this.base.x = this.offset.x;
      this.base.y = this.offset.y;

      this.update();
    } else if (event.code == 'ArrowLeft') {
      this.offset.x -= 1;
      this.update();
      event.preventDefault();
      event.stopPropagation();

    } else if (event.code == 'ArrowUp') {
      this.offset.y -= 1;
      this.update();
      event.preventDefault();
      event.stopPropagation();
    } else if (event.code == 'ArrowRight') {
      this.offset.x += 1;
      this.update();
      event.preventDefault();
      event.stopPropagation();
    } else if (event.code == 'ArrowDown') {
      this.offset.y += 1;
      this.update();
      event.preventDefault();
      event.stopPropagation();
    }
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
}