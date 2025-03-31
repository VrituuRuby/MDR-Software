import { Application } from "pixi.js";
import { MDRNumber } from "./mdr-number";

export const globalMousePosition = { x: 0, y: 0 };

export class MDRApp {
  app: Application;

  constructor() {
    this.app = new Application();
    this.init();
  }

  private async init() {
    await this.app.init({ background: 0x101018, resizeTo: window });
    document.body.appendChild(this.app.canvas);

    this.trackMouse();
    this.createNumbers();
  }

  private trackMouse() {
    window.addEventListener("mousemove", (e) => {
      globalMousePosition.x = e.clientX;
      globalMousePosition.y = e.clientY;
    });
  }
  private createNumbers() {
    const GRID_SIZE = 2;
    const GAP = 64;
    for (let i = 0; i < 16 * GRID_SIZE; i++) {
      for (let j = 0; j < 9 * GRID_SIZE; j++) {
        const value = Math.floor(Math.random() * 10);
        const x = i * GAP;
        const y = j * GAP;
        const number = new MDRNumber(value, x, y);

        this.app.stage.addChild(number);
      }
    }
  }
}
