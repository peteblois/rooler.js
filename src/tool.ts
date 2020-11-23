import {Disposer, listen} from './base';
import { ScreenShot } from './screenshot';
import * as css from './rooler.css';

export abstract class Tool {
  private readonly tool = document.createElement('div');
  protected readonly root: HTMLElement;
  protected canClose = true;
  protected readonly disposer = new Disposer();

  constructor(protected readonly screenShot: ScreenShot) {
    this.tool.style.position = 'fixed';
    this.tool.style.top = '0';
    this.tool.style.left = '0';
    this.tool.style.right =  '0';
    this.tool.style.bottom = '0';
    this.tool.style.font = `12px Arial, Helvetica, 'bitstream vera sans', sans-serif`;
    this.tool.style.overflow = 'hidden';
    this.tool.style.zIndex ='1000';

    const shadowRoot = this.tool.attachShadow({mode: 'open'});
    const style = document.createElement('style');
    style.textContent = css.stylesheet;
    shadowRoot.appendChild(style);

    this.root = document.createElement('div');
    shadowRoot.appendChild(this.root);
  }

  open() {
    document.documentElement.appendChild(this.tool);
    this.disposer.add(listen(window, 'scroll', () => {
      this.handleWindowScroll();
    }));
  }

  setCanClose(value: boolean) {
    this.canClose = value;
  }

  close() {
    this.disposer.dispose();
    this.tool.remove();
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
