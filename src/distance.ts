import {Tool} from './tool';
import {createElement, listen, Position} from './base';
import { ScreenCoordinates } from './screen_coordinates';
import { ScreenShot } from './screenshot';

export class DistanceTool extends Tool {
  private readonly crosshairs: HTMLElement;
  private readonly vertical: HTMLElement;
  private readonly horizontal: HTMLElement;
  private readonly dimensions: HTMLElement;

  private cursorPosition: Position = {x: 0, y: 0,};
  private screenCoordinates = new ScreenCoordinates();

  constructor(screenShot: ScreenShot) {
    super(screenShot);

    this.crosshairs = createElement('div', 'roolerCrosshairs');
    this.vertical = createElement('div', 'roolerVertical');
    this.crosshairs.appendChild(this.vertical);

    this.vertical.appendChild(createElement('div', 'roolerVerticalBar'));
    this.vertical.appendChild(createElement('div', 'roolerVerticalTop'));
    this.vertical.appendChild(createElement('div', 'roolerVerticalBottom'));

    this.horizontal = createElement('div', 'roolerHorizontal');
    this.crosshairs.appendChild(this.horizontal);

    this.horizontal.appendChild(createElement('div', 'roolerHorizontalBar'));
    this.horizontal.appendChild(createElement('div', 'roolerHorizontalLeft'));
    this.horizontal.appendChild(createElement('div', 'roolerHorizontalRight'));

    this.dimensions = createElement('div', 'roolerDimensions');

    this.root.appendChild(this.crosshairs);
    this.root.appendChild(this.dimensions);
  }

  open() {
    super.open();

    this.disposer.add(listen(window, 'mousemove', (event: MouseEvent) => {
      this.handleMouseMove(event);
    }));
    this.disposer.add(listen(window, 'mousedown', () => {
      this.handleMouseDown();
    }));
    this.disposer.add(listen(window, 'mousewheel', (event: Event) => {
      this.handleMouseWheel(event as WheelEvent);
    }, {passive: false}));
  }

  handleMouseDown() {
    if (this.canClose) {
      this.close();
    }
  }

  handleMouseMove(event: MouseEvent) {
    this.cursorPosition = {
      x: event.pageX,
      y: event.pageY
    };
    event.preventDefault();
    event.stopPropagation();

    this.update();
  }

  update() {
    const myOffset = {left: 0, top: 0};
    const position = {
      x: this.cursorPosition.x - myOffset.left,
      y: this.cursorPosition.y - myOffset.top - window.pageYOffset
    }

    const coordinates = this.screenCoordinates.expandPoint(position, this.screenShot);
    if (!coordinates) {
      return;
    }

    coordinates.left += window.pageXOffset;

    this.crosshairs.style.left = coordinates.left + myOffset.left + 'px';
    this.crosshairs.style.top = coordinates.top + myOffset.top + 'px';

    const width = coordinates.width + "px";
    this.crosshairs.style.width = width;

    const height = coordinates.height + "px";
    this.crosshairs.style.height = height;

    this.vertical.style.left = (this.cursorPosition.x - coordinates.left - myOffset.left - 5) + 'px';
    this.horizontal.style.top = (this.cursorPosition.y - coordinates.top - myOffset.top - 5 - window.pageYOffset) + 'px';

    this.dimensions.textContent = (coordinates.width + ' x ' + coordinates.height);

    if (this.cursorPosition.x > window.innerWidth - 100) {
      const width = this.dimensions.clientWidth;
      this.dimensions.style.left = (this.cursorPosition.x - myOffset.left - (width + 10)) + 'px';
    } else {
      this.dimensions.style.left = (this.cursorPosition.x - myOffset.left + 10) + 'px';
    }

    if (this.cursorPosition.y < 100) {
      this.dimensions.style.top = (this.cursorPosition.y - myOffset.top + 2 - window.pageYOffset) + 'px';
    } else {
      this.dimensions.style.top = (this.cursorPosition.y - myOffset.top - 20 - window.pageYOffset) + 'px';
    }
  }

  handleMouseWheel(event: WheelEvent) {
    event.preventDefault();
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
}