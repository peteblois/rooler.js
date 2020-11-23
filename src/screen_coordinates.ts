import {Rect, ScreenShot} from './screenshot';
import {Color, Position, clamp} from './base';

export class ScreenCoordinates {
  static colorTolerance = 15;

  expandPoint(position: Position, screenshot: ScreenShot) {
    var x = position.x * window.devicePixelRatio;
    var y = position.y * window.devicePixelRatio;

    var top = screenshot.top;
    var bottom = screenshot.bottom;

    var left = this.findNearestX(x, y - 5, y + 5, -1, screenshot).x;
    var right = this.findNearestX(x, y - 5, y + 5, 1, screenshot).x;
    var top = this.findNearestY(x - 5, x + 5, y, -1, screenshot).y;
    var bottom = this.findNearestY(x - 5, x + 5, y, 1, screenshot).y;

    if (right > left && bottom > top) {
      return {
        left: left / window.devicePixelRatio,
        top: top / window.devicePixelRatio,
        width: (right - left) / window.devicePixelRatio,
        height: (bottom - top) / window.devicePixelRatio
      };
    }
    return undefined;
  }

  findNearestX(xStart: number, yStart: number, yEnd: number, xIncrement: number, screenshot: ScreenShot) {
    yStart = Math.max(screenshot.top, yStart);
    yEnd = Math.min(screenshot.bottom, yEnd);

    let xEdge = xIncrement < 0 ? -100000 : 100000;
    let yEdge = yStart;

    // const imageData = screenshot.imageData;
    let currentPixel = {r: 0, g: 0, b: 0};
    let startPixel = {r: 0, g: 0, b: 0};

    for (var y = yStart; y < yEnd; ++y) {
      screenshot.getScreenPixel(xStart, y, startPixel);

      let cont = true;
      for (let x = xStart; x >= screenshot.left && x <= screenshot.right && cont == true; x += xIncrement) {
        screenshot.getScreenPixel(x, y, currentPixel);
        if (!this.isPixelClose(currentPixel, startPixel)) {
          var edge = x - xIncrement;
          if (xIncrement > 0) {
            edge += 1;
          }
          if (xIncrement > 0 && edge < xEdge) {
            xEdge = edge;
          } else if (xIncrement < 0 && edge > xEdge) {
            xEdge = edge;
          }
          cont = false;
        }
        var tmp = startPixel;
        startPixel = currentPixel;
        currentPixel = tmp;
      }
    }

    xEdge = clamp(xEdge, screenshot.left, screenshot.right);

    return {
      x: xEdge,
      y: yEdge
    };
  }

  findNearestY(xStart: number, xEnd: number, yStart: number, yIncrement: number, screenshot: ScreenShot) {
    xStart = Math.max(screenshot.left, xStart);
    xEnd = Math.min(screenshot.right, xEnd);

    let xEdge = xStart;
    let yEdge = yIncrement < 0 ? -100000 : 100000;

    // const imageData = screenshot.imageData;
    let currentPixel = {r: 0, g: 0, b: 0};
    let startPixel = {r: 0, g: 0, b: 0};

    for (let x = xStart; x < xEnd; ++x) {
      screenshot.getScreenPixel(x, yStart, startPixel);

      let cont = true;
      for (let y = yStart; y >= screenshot.top && y <= screenshot.bottom && cont == true; y += yIncrement) {
        screenshot.getScreenPixel(x, y, currentPixel);
        if (!this.isPixelClose(currentPixel, startPixel)) {
          var edge = y - yIncrement;
          if (yIncrement > 0) {
            edge += 1;
          }
          if (yIncrement > 0 && edge < yEdge) {
            yEdge = edge;
          } else if (yIncrement < 0 && edge > yEdge) {
            yEdge = edge;
          }
        }
        var tmp = startPixel;
        startPixel = currentPixel;
        currentPixel = tmp;
      }
    }

    yEdge = clamp(yEdge, screenshot.top, screenshot.bottom);

    return {
      x: xEdge,
      y: yEdge
    };
  }

  collapseBox(rect: Rect, screenshot: ScreenShot): Rect|undefined {
    const rectLeft = rect.left * window.devicePixelRatio;
    const rectRight = rect.right * window.devicePixelRatio;
    const rectTop = rect.top * window.devicePixelRatio;
    const rectBottom = rect.bottom * window.devicePixelRatio;
    const left = this.findNearestX(rectLeft, rectTop, rectBottom, 1, screenshot).x;
    const right = this.findNearestX(rectRight, rectTop, rectBottom, -1, screenshot).x;
    const top = this.findNearestY(rectLeft, rectRight, rectTop, 1, screenshot).y;
    const bottom = this.findNearestY(rectLeft, rectRight, rectBottom, -1, screenshot).y;

    if (left < right && top < bottom) {
      return {
        left: left / window.devicePixelRatio,
        top: top / window.devicePixelRatio,
        right: right / window.devicePixelRatio,
        bottom: bottom / window.devicePixelRatio
      };
    }
    return undefined;
  }

  isPixelClose(a: Color, b: Color): boolean {
    var totalDifference = Math.abs(a.r - b.r) +
      Math.abs(a.g - b.g) +
      Math.abs(a.b - b.b);

    if (totalDifference > ScreenCoordinates.colorTolerance) {
      return false;
    }
    return true;
  }
}
