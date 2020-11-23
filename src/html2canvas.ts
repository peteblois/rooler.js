import {Position} from './base';

// Super hacky class to render an HTML DOM to a canvas element.
export class Html2Canvas {
  private readonly canvas: HTMLCanvasElement;
  private readonly context: CanvasRenderingContext2D;
  private readonly baseOffset: Position;
  private readonly offset: Position;

  constructor(element: HTMLElement) {
    const width = element.scrollWidth * devicePixelRatio;
    var height = element.scrollHeight * devicePixelRatio;

    this.canvas = document.createElement('canvas');
    this.canvas.width = width;
    this.canvas.height = height;
    this.context = this.canvas.getContext('2d')!;
    this.baseOffset = this.getOffset(element);

    this.context.scale(devicePixelRatio, devicePixelRatio);

    this.draw(element);

    this.offset = {
      x: 0,
      y: 0
    }
  }

  static capture(element: HTMLElement) {
    return new Html2Canvas(element).canvas;
  };

  private getOffset(element: HTMLElement): Position {
    const offset = {
      x: element.offsetLeft,
      y: element.offsetTop
    };
    if (element.offsetParent) {
      var parentOffset = this.getOffset(element.offsetParent as HTMLElement);
      offset.x += parentOffset.x;
      offset.y += parentOffset.y;
    }
    return offset;
  }

  private draw(element: HTMLElement) {
    const style = window.getComputedStyle(element);
    const visibility = style.visibility || style['visibility'];
    if (visibility != 'visible') {
      return;
    }
    this.context.save();

    const offset = this.getRelativeOffset(element);
    this.context.translate(offset.x, offset.y);

    var width = element.scrollWidth;
    var height = element.scrollHeight;

    this.renderBackground(element, style, width, height);
    this.renderBorder(element, style, width, height);

    if (element instanceof HTMLImageElement) {
      this.drawIMG(element);
    }
    // if ((this as any)['draw' + element.nodeName]) {
    //   (this as any)['draw' + element.nodeName](element);
    // }

    if (element.textContent && element.textContent == element.innerHTML) {
      const fontWeight = style.fontWeight;
      const fontSize = style.fontSize;
      const fontFamily = style.fontFamily;
      this.context.font = fontWeight + ' '  + fontSize + ' ' + fontFamily;
      this.context.fillStyle = style.color || style['color'];
      this.context.textBaseline = 'top';

      var letterSpacing = this.parseLength(style.letterSpacing);
      if (letterSpacing != 0) {
        var offsetY = 0;
        if (navigator.userAgent.indexOf('Firefox')!=-1) {
          offsetY = -letterSpacing
        }
        this.renderText(element.textContent, 0, offsetY, letterSpacing);
      } else {
        var paddingTop = this.parseLength(style.paddingTop);
        var paddingLeft = this.parseLength(style.paddingLeft);
        this.context.fillText(element.textContent, paddingLeft, paddingTop, element.clientWidth);
      }
    }

    this.context.restore();

    for (var i = 0; i < element.children.length; ++i) {
      const child = element.children[i];
      this.draw(child as HTMLElement);
    }
  }

  private getRelativeOffset(element: HTMLElement) {
    const offset = this.getOffset(element);
    return {
      x: offset.x - this.baseOffset.x,
      y: offset.y - this.baseOffset.y
    };
  }

  private renderBackground(element: HTMLElement, style: CSSStyleDeclaration, width: number, height: number) {
    this.context.fillStyle = style.backgroundColor;
    this.context.fillRect(0, 0, width, height);

    var backgroundImage = style.backgroundImage;
    if (backgroundImage && backgroundImage.length > 0 && backgroundImage != 'none') {
      if (backgroundImage.indexOf('linear-gradient(') > 0) {
        var stopsText = backgroundImage.substring(
            backgroundImage.indexOf('(') + 1,
            backgroundImage.lastIndexOf(')'));

        var stops = this.parseStops(stopsText);
        var gradient = this.context.createLinearGradient(0, 0, 0, height);
        for (var i = 0; i < stops.length; ++i) {
          gradient.addColorStop(i / (stops.length - 1), stops[i]);
        }
        this.context.fillStyle = gradient;
        this.context.fillRect(0, 0, width, height);
      }
    }
  }

  parseStops(text: string): string[] {
    const stops = [];
    while(text.length > 0) {
      if (text.indexOf('top') == 0) {
        text = text.substr(5);
      } else if (text.indexOf('rgba(') == 0 || text.indexOf('rgb(') == 0) {
        stops.push(text.substr(0, text.indexOf(')') + 1));
        text = text.substr(text.indexOf(')') + 3);
      }
    }
    return stops;
  }

  private renderBorder(element: HTMLElement, style: CSSStyleDeclaration, width: number, height: number) {
    var borderWidth = this.parseLength(style.borderLeftWidth);
    var borderColor = style.borderLeftColor;
    if (borderWidth > 0) {
      this.context.lineWidth = borderWidth;
      this.context.strokeStyle = borderColor;
      this.context.strokeRect(1, 1, width + borderWidth * 2 - 2, height + borderWidth * 2 - 2);

      this.context.translate(borderWidth, borderWidth * 2);
    }
  }

  private parseLength(val: string) {
    const pxIndex = val.indexOf('px');
    if (pxIndex != -1) {
      return parseInt(val.substr(0, pxIndex), 10);
    }
    return 0;
  }

  // Using code from below to implement letterSpacing in canvas.
  // http://davidhong.co/blog/2011/07/26/on-html5-canvas-filltext/
  renderText(text: string, x: number, y: number, letterSpacing: number) {
    if (!text || typeof text !== 'string' || text.length === 0) {
      return;
    }

    if (typeof letterSpacing === 'undefined') {
      letterSpacing = 0;
    }
    let characters =text.split('');
    let index = 0;
    let current;
    let currentPosition = x;
    let align = 1;

    if (this.context.textAlign === 'right') {
        characters = characters.reverse();
        align = -1;
    } else if (this.context.textAlign === 'center') {
        var totalWidth = 0;
        for (var i = 0; i < characters.length; i++) {
            totalWidth += (this.context.measureText(characters[i]).width + letterSpacing);
        }
        currentPosition = x - (totalWidth / 2);
    }

    while (index < text.length) {
        current = characters[index++];
        this.context.fillText(current, currentPosition, y);
        currentPosition += (align * (this.context.measureText(current).width + letterSpacing));
    }
  }

  private drawIMG(element: HTMLImageElement) {
    this.context.drawImage(element, 0, 0);
  }
}
