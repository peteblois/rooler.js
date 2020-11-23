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
 **/
class Rooler {
  private readonly port: chrome.runtime.Port;
  private tools: (DistanceTool|Bounds|Loupe)[] = [];
  private readonly screenShot: ScreenShot;

  constructor() {
    this.port = chrome.runtime.connect();

    this.port.onMessage.addListener((event) => {
      this.handleMessage(event);
    });
    //chrome.extension.onRequest.addListener(this.handleRequest.bind(this));

    this.port.postMessage({
      msg: 'start'
    });

    const canvas = document.createElement('canvas');
    this.screenShot = new ScreenShot(canvas);
  }
  private handleMessage(msg: Message) {
    var fn = (this as any)[msg.msg];
    fn.apply(this, msg.args);
  }

  startDistanceTool() {
    this.tools.push(new DistanceTool(this.screenShot));

    this.requestUpdateScreenshot();
  }

  startBoundsTool() {
    this.tools.push(new Bounds(this.screenShot));

    this.requestUpdateScreenshot();
  }

  startLoupeTool() {
    this.tools.push(new Loupe(this.screenShot));

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

if (!(window as any).Rooler && window.chrome && window.chrome.extension) {
  (window as any).Rooler = new Rooler();
}
