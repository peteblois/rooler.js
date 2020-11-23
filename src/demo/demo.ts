import { DistanceTool } from '../distance';
import {Html2Canvas} from '../html2canvas';
import { ScreenShot } from '../screenshot';
import {Magnifier} from '../magnifier';
import {Bounds} from '../bounds';
import {Loupe} from '../loupe';

(async () => {
  for (const img of Array.from(document.querySelectorAll('img'))) {
    if (!img.complete) {
      await new Promise((resolve) => {
        img.addEventListener('load', resolve);
        img.addEventListener('error', resolve);
      });
    }
  }

  const root = document.querySelector('#contentRoot') as HTMLElement;
  const canvas = Html2Canvas.capture(root);

  const screenshot = new ScreenShot(canvas);
  const bounds = new Bounds(screenshot);
  bounds.open();
  bounds.setCanClose(false);

  // const loupe = new Loupe(screenshot);
  // loupe.setCanClose(false);
  // loupe.open();

  // const distance = new DistanceTool(screenshot);
  // distance.setCanClose(false);
  // distance.open();

  document.body.appendChild(canvas);
  canvas.style.width = '100%'
  canvas.style.position = 'absolute';
  canvas.style.height = '100%';
  canvas.style.top = '0';
  canvas.style.left = '0';
})();
