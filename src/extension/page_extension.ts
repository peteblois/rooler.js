import { Bounds } from "../bounds";
import { DistanceTool } from "../distance";
import { Loupe } from "../loupe";
import { ScreenShot } from "../screenshot";
import '../rooler.css';

interface Message {
  msg: string;
  args: any[];
}

/**
 * Runs in the context of the page which is being inspected.
 */
class Rooler {
  private readonly port: chrome.runtime.Port;
  private tools: (DistanceTool|Bounds|Loupe)[] = [];
  private readonly screenShot: ScreenShot;

  constructor() {
    this.port = chrome.runtime.connect();

    this.port.onMessage.addListener((event) => {
      this.handleMessage(event);
    });

    this.port.postMessage({
      msg: 'start'
    });

    const canvas = document.createElement('canvas');
    this.screenShot = new ScreenShot(canvas, () => {
      this.requestUpdateScreenshot();
    });
  }
  private handleMessage(msg: Message) {
    var fn = (this as any)[msg.msg];
    fn.apply(this, msg.args);
  }

  startDistanceTool() {
    const tool = new DistanceTool(this.screenShot);
    this.tools.push(tool);
    tool.open();

    this.requestUpdateScreenshot();
  }

  startBoundsTool() {
    const tool = new Bounds(this.screenShot);
    this.tools.push(tool);
    tool.open();

    this.requestUpdateScreenshot();
  }

  startLoupeTool() {
    const tool = new Loupe(this.screenShot)
    this.tools.push(tool);
    tool.open();

    this.requestUpdateScreenshot();
  }

  private requestUpdateScreenshot() {
    for (var i = 0; i < this.tools.length; ++i) {
      this.tools[i].hide();
    }
    this.port.postMessage({
      msg: 'getPageImage'
    });
  }
  updateScreenshot(data: string) {
    for (var i = 0; i < this.tools.length; ++i) {
      this.tools[i].show();
    }

    const img = document.createElement('img');
    img.addEventListener('load', () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;

      const context = canvas.getContext('2d')!;
      context.drawImage(img, 0, 0);

      this.screenShot.updateCanvas(canvas);
    }, true);
    img.src = data;
  }
}

if (!(window as any).rooler && window.chrome && window.chrome.runtime) {
  (window as any).rooler = new Rooler();
}
