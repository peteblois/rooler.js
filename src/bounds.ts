import { createElement, Disposer, listen, Position } from "./base";
import { Capture } from "./capture";
import { ScreenShot } from "./screenshot";
import { ScreenCoordinates } from "./screen_coordinates";
import {default as cameraIcon}  from './camera.png';

interface Rect {
  left: number;
  right: number;
  bottom: number;
  top: number;
}

export class Bounds {
  private readonly root: HTMLElement;
  private readonly boundsRoot: HTMLElement;
  private readonly top: HTMLElement;
  private readonly right: HTMLElement;
  private readonly bottom: HTMLElement;
  private readonly left: HTMLElement;
  private bodyUserSelect = '';
  private readonly dimensionsRoot: HTMLElement;
  private readonly dimensions: HTMLElement;
  private readonly cameraButton: HTMLAnchorElement;
  private readonly instructions: HTMLElement;
  private readonly disposer = new Disposer();
  private readonly overlay: HTMLElement;
  private start: Position = {x: 0, y: 0};
  private end: Position = {x: 0, y: 0};
  private isMouseDown = false;
  private canClose = true;
  private closeOnClick = false;
  private readonly screenCoordinates = new ScreenCoordinates();
  private rect: Rect = {left: 0, right: 0, bottom: 0, top: 0};

  constructor(private readonly screenShot: ScreenShot) {
    this.root = createElement('div', 'roolerRoot');

    this.boundsRoot = createElement('div', 'roolerBoundsRoot');
    this.root.appendChild(this.boundsRoot);

    this.top = createElement('div', 'roolerBoundsTop');
    this.boundsRoot.appendChild(this.top);
    this.right = createElement('div', 'roolerBoundsRight');
    this.boundsRoot.appendChild(this.right);
    this.bottom = createElement('div', 'roolerBoundsBottom');
    this.boundsRoot.appendChild(this.bottom);
    this.left = createElement('div', 'roolerBoundsLeft');
    this.boundsRoot.appendChild(this.left);

    this.dimensionsRoot = createElement('div', 'roolerDimensionsHost');
    this.right.appendChild(this.dimensionsRoot);
    this.dimensions = createElement('div', 'roolerDimensions');
    this.dimensionsRoot.appendChild(this.dimensions);
    this.cameraButton = createElement('a', 'roolerCameraButton') as HTMLAnchorElement;
    this.cameraButton.href = '#';
    this.cameraButton.title = 'Capture Snapshot';
    const icon = createElement('div', 'roolerCamera');
    icon.style.background = 'url(' + cameraIcon + ')';
    this.cameraButton.appendChild(icon);
    this.dimensionsRoot.appendChild(this.cameraButton);

    this.instructions = createElement('div', 'roolerInstructions');
    this.instructions.textContent = 'Click and drag to create a rectangle to be measured.';
    this.boundsRoot.appendChild(this.instructions);

    this.overlay = createElement('div', 'roolerOverlay');

    this.hideCamera();
  }

  open() {
    this.bodyUserSelect = document.body.style.userSelect;
    document.documentElement.style.userSelect = 'none';

    document.documentElement.appendChild(this.overlay);
    document.documentElement.appendChild(this.root);

    this.disposer.add(listen(window, 'mousemove', (event: MouseEvent) => {
      this.handleMouseMove(event);
    }));

    this.disposer.add(listen(window, 'mousedown', (event: MouseEvent) => {
      this.handleMouseDown(event);
    }));

    this.disposer.add(listen(window, 'mouseup', (event: MouseEvent) => {
      this.handleMouseUp(event);
    }));

    this.disposer.add(listen(window, 'scroll', () => {
      this.handleWindowScroll();
    }));
    this.disposer.add(listen(window, 'mousewheel', (event: Event) => {
      this.handleMouseWheel(event as WheelEvent);
    }, {passive: false}));
    this.disposer.add(listen(window, 'resize', () => {
      this.handleResize();
    }));
    this.cameraButton.addEventListener('mousedown', (event) => {
      this.handleCameraClick(event);
    }, false);
  }

  hide() {
    this.overlay.classList.add('roolerHidden');
    this.root.classList.add('roolerHidden');
  }
  show() {
    this.overlay.classList.remove('roolerHidden');
    this.root.classList.remove('roolerHidden');
  }

  setCanClose(canClose: boolean) {
    this.canClose = canClose;
  }

  close() {
    this.disposer.dispose();

    this.root.remove();
    this.overlay.remove();

    document.documentElement.style.userSelect = this.bodyUserSelect;
  }

  private handleMouseDown(event: MouseEvent) {
    if (this.closeOnClick) {
      this.close();
      return;
    }
    this.isMouseDown = true;
    this.start = {
      x: event.pageX - window.pageXOffset,
      y: event.pageY - window.pageYOffset,
    };
    this.end = {
      x: event.pageX - window.pageXOffset,
      y: event.pageY - window.pageYOffset,
    };
    this.updateRect();
    this.hideCamera();
    this.showDimensions();

    if (this.canClose) {
      this.closeOnClick = true;
    }
  }

  private handleMouseMove(event: MouseEvent) {
    if (!this.isMouseDown) {
      return;
    }
    this.end = {
      x: event.pageX - window.pageXOffset,
      y: event.pageY - window.pageYOffset,
    };
    this.updateRect();
    if (this.canClose) {
      this.hideInstructions();
    }
    event.preventDefault();
    event.stopPropagation();
  }

  private handleMouseUp(event: MouseEvent) {
    if (!this.isMouseDown) {
      return;
    }
    this.isMouseDown = false;

    if (event.pageX) {
      this.end = {
        x: event.pageX - window.pageXOffset,
        y: event.pageY - window.pageYOffset,
      };
    }
    this.collapseRect();
  }

  private collapseRect() {
    this.updateRect();
    const bounds = this.screenCoordinates.collapseBox(this.rect, this.screenShot);
    if (bounds) {
      this.rect = bounds;
      this.update();
      this.showCamera();
    } else {
      this.end = this.start;
      this.updateRect();
      this.hideDimensions();
    }
  }

  private updateRect() {
    const rect = {
      left: Math.min(this.start.x, this.end.x),
      right: Math.max(this.start.x, this.end.x),
      top: Math.min(this.start.y, this.end.y),
      bottom: Math.max(this.start.y, this.end.y),
    };
    this.rect = rect;

    this.update();
  }

  private update() {
    this.top.style.height = this.rect.top + 'px';
    this.bottom.style.height = (window.innerHeight - this.rect.bottom) + 'px';
    this.bottom.style.width = this.rect.right + 'px';
    this.left.style.width = this.rect.left + 'px';
    this.left.style.top = this.rect.top + 'px';
    this.left.style.bottom = window.innerHeight - this.rect.bottom + 'px';
    this.right.style.width = document.body.clientWidth - this.rect.right + 'px';
    this.right.style.top = this.rect.top + 'px';

    const width = this.rect.right - this.rect.left;
    const height = this.rect.bottom - this.rect.top;
    this.dimensions.textContent = (width + ' x ' + height);
  }

  private handleWindowScroll() {
    this.screenShot.requestUpdate();
  }

  private handleMouseWheel(event: WheelEvent) {
    event.preventDefault();
    event.stopPropagation();

    if (event.deltaY > 0) {
      ScreenCoordinates.colorTolerance += 1;
    }
    else {
      ScreenCoordinates.colorTolerance -= 1;
      if (ScreenCoordinates.colorTolerance < 0) {
        ScreenCoordinates.colorTolerance = 0;
      }
    }
    this.update();
  }
  showDimensions() {
    this.dimensionsRoot.classList.remove('roolerHidden');
  }

  hideDimensions() {
    this.dimensionsRoot.classList.add('roolerHidden');
  }

  showCamera() {
    this.cameraButton.classList.remove('roolerHidden');
  }

  hideCamera() {
    this.cameraButton.classList.add('roolerHidden');
  }

  handleCameraClick(event: Event) {
    this.captureScreenshot();

    event.preventDefault();
    event.stopPropagation();
  }

  handleResize() {
    this.update();
  }

  captureScreenshot() {
    if (this.rect) {
      const image = this.screenShot.captureRect(this.rect);
      if (image) {
        const data = image.toDataURL();
        const popup = new Capture(data, {
          width: this.rect.right - this.rect.left,
          height: this.rect.bottom - this.rect.top
        });
      }
    }
  }

  hideInstructions() {
    this.instructions.classList.add('roolerHidden');
  }
}
