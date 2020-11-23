import { createElement, Disposer, listen } from "./base";
import { Tool } from "./tool";
import { ScreenShot } from "./screenshot";

interface Size {
  width: number;
  height: number;
}

export class Capture extends Tool {
  private readonly popup: HTMLElement;
  private readonly img: HTMLImageElement;

  constructor(screenShot: ScreenShot, url: string, size: Size) {
    super(screenShot);

    this.root.classList.add('roolerShield');

    this.popup = createElement('div', 'roolerPopup');
    this.root.appendChild(this.popup);

    const instructions = createElement('div', 'roolerCaptureInstructions');
    this.popup.appendChild(instructions);
    instructions.innerHTML = 'Right click on image and<br/> \'Save Image As...\' to save.';

    const matte = createElement('div', 'roolerCaptureMatte');
    this.popup.appendChild(matte);

    this.img = document.createElement('img');
    this.img.src = url;
    this.img.style.width = `${size.width}px`;
    this.img.style.height = `${size.height}px`;
    matte.appendChild(this.img);

    this.disposer.add(listen(this.root, 'mousedown', (event: MouseEvent) => {
      this.close();
    }));

    this.disposer.add(listen(this.popup, 'mousedown', (event: MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
    }));
  }

  save() {
  }
}