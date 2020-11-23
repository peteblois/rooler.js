import { createElement, Disposer, listen } from "./base";

export interface Size {
  width: number;
  height: number;
}

export class Capture {
  private readonly url: string;
  private readonly size: Size;
  private readonly root: HTMLElement;
  private readonly popup: HTMLElement;
  private readonly img: HTMLImageElement;
  private readonly disposer = new Disposer();

  constructor(url: string, size: Size) {
    this.url = url;
    this.size = size;

    this.root = document.createElement('div');
    this.root.classList.add('roolerShield', 'roolerRoot');

    this.popup = createElement('div', 'roolerPopup');
    this.root.appendChild(this.popup);

    const instructions = createElement('div', 'roolerCaptureInstructions');
    this.popup.appendChild(instructions);
    instructions.innerHTML = 'Right click on image and<br/> \'Save Image As...\' to save.';

    const matte = createElement('div', 'roolerCaptureMatte');
    this.popup.appendChild(matte);

    this.img = document.createElement('img');
    this.img.src = url;
    matte.appendChild(this.img);

    document.body.appendChild(this.root);

    this.disposer.add(listen(this.root, 'mousedown', (event: MouseEvent) => {
      this.close(event);
    }));

    this.disposer.add(listen(this.popup, 'mousedown', (event: MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
    }));
  }

  close(event: Event) {
    document.body.removeChild(this.root);

    event.preventDefault();
    event.stopPropagation();
  }

  save() {
  }
}
