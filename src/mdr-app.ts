import { AdvancedBloomFilter, CRTFilter, PixelateFilter } from "pixi-filters";
import { Application, Container, Graphics, Ticker } from "pixi.js";
import { MDRNumber } from "./mdr-number";

export const globalMousePosition = { x: 0, y: 0 };
export let isDragging: boolean = false;

export class MDRApp {
  app: Application;
  gridContainer: Container;
  private navigationSpeed = 10;
  private backgroundWidth = 100 * 80 + 80;
  private backgroundHeight = 100 * 80 + 80;
  private crtFilter: CRTFilter;

  constructor() {
    this.app = new Application();
    this.gridContainer = new Container();
    this.app.stage.addChild(this.gridContainer);
    this.crtFilter = new CRTFilter({
      curvature: 3, // Distorção das bordas
      lineWidth: 3, // Espessura das scanlines
      lineContrast: 0.3, // Intensidade das scanlines
      noiseSize: 3,
      vignetting: 0.4, // Escurece as bordas (vinheta)
    });
    this.init();
  }

  private async init() {
    await this.app.init({ background: "0x000000", resizeTo: window });
    document.body.appendChild(this.app.canvas);

    this.createBackground();
    this.setupMouseTracking();
    this.createNumbers();

    this.setupKeyboardNavigation();

    this.applyCRTFilter();
    this.startCRTAnimation();
  }

  private createBackground() {
    const background = new Graphics();
    background
      .rect(0, 0, this.app.screen.width, this.app.screen.height)
      .fill({ color: 0x101018, alpha: 1 });
    this.app.stage.addChildAt(background, 0);
  }

  private setupMouseTracking() {
    this.gridContainer.interactive = true;
    this.gridContainer.eventMode = "static";

    const background = new Graphics();
    background
      .rect(-80, -80, this.backgroundWidth, this.backgroundHeight)
      .fill({
        color: 0xff0000,
        alpha: 0.0,
      });
    background.interactive = true;
    this.gridContainer.addChild(background);

    this.gridContainer.on("pointermove", (e) => {
      let localPosition = e.getLocalPosition(this.gridContainer);
      globalMousePosition.x = localPosition.x;
      globalMousePosition.y = localPosition.y;
    });

    window.addEventListener("pointerdown", () => {
      isDragging = true;
    });

    window.addEventListener("pointerup", () => {
      isDragging = false;
    });
  }

  private applyCRTFilter() {
    const pixelateFilter = new PixelateFilter(3);
    const bloomFilter = new AdvancedBloomFilter({
      bloomScale: 1,
    });

    this.app.stage.filters = [pixelateFilter, this.crtFilter, bloomFilter];
  }

  private startCRTAnimation() {
    Ticker.shared.add((delta) => {
      this.crtFilter.time += delta.deltaTime * 0.25; // Pequeno incremento para dar efeito animado
    });
  }

  private setupKeyboardNavigation() {
    window.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") {
        this.gridContainer.x += this.navigationSpeed;
      }
      if (e.key === "ArrowRight") {
        this.gridContainer.x -= this.navigationSpeed;
      }
      if (e.key === "ArrowUp") {
        this.gridContainer.y += this.navigationSpeed;
      }
      if (e.key === "ArrowDown") {
        this.gridContainer.y -= this.navigationSpeed;
      }

      this.clampMovement();
    });
  }

  private clampMovement() {
    if (this.gridContainer.x > 90) {
      this.gridContainer.x = 90;
    }
    if (this.gridContainer.x < -this.backgroundWidth + window.innerWidth) {
      this.gridContainer.x = -this.backgroundWidth + window.innerWidth; // Não deixar mover para a esquerda além do limite
    }

    // Limitar a posição de y dentro dos limites
    if (this.gridContainer.y > 90) {
      this.gridContainer.y = 90; // Não deixar mover para baixo além do limite
    }
    if (this.gridContainer.y < -this.backgroundHeight + window.innerHeight) {
      this.gridContainer.y = -this.backgroundHeight + window.innerHeight; // Não deixar mover para cima além do limite
    }
  }

  private createNumbers() {
    const GAP = 80;
    for (let i = 0; i < 100; i++) {
      for (let j = 0; j < 100; j++) {
        const value = Math.floor(Math.random() * 10);
        const x = i * GAP;
        const y = j * GAP;
        const number = new MDRNumber(value, x, y);

        this.gridContainer.addChild(number);
      }
    }

    this.gridContainer.x = -this.gridContainer.width / 2;
    this.gridContainer.y = -this.gridContainer.height / 2;
  }
}
