import {applyRootStyle, createElement, Disposer, listen} from './base';
import { ScreenShot } from './screenshot';

export abstract class Tool {
  protected readonly root: HTMLElement;
  protected canClose = true;
  protected readonly disposer = new Disposer();

  constructor(protected readonly screenShot: ScreenShot) {
    this.root = createElement('div', 'roolerRoot');
    applyRootStyle(this.root);
    this.root.style.overflow = 'hidden';
    this.root.style.zIndex = '1000';
  }

  open() {
    document.documentElement.appendChild(this.root);
    this.disposer.add(listen(window, 'scroll', () => {
      this.handleWindowScroll();
    }));
  }

  setCanClose(value: boolean) {
    this.canClose = value;
  }

  close() {
    this.disposer.dispose();
    this.root.remove();
  }

  private handleWindowScroll() {
    this.screenShot.requestUpdate();
  }

  hide() {
    this.root.classList.add('roolerHidden');
  }
  show() {
    this.root.classList.remove('roolerHidden');
  }
}
