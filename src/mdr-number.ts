import { Text, Ticker } from "pixi.js";
import { lerp } from "./common";
import { globalMousePosition, isDragging } from "./mdr-app";

export class MDRNumber extends Text {
  value: number;
  private isSelected: boolean = false;
  private baseX: number;
  private baseY: number;
  private desiredX: number;
  private desiredY: number;
  private direction: "x" | "y" | "none";
  private speed: number;
  private elapsed: number = 0;
  private distance = Math.random() * 10 + 5;
  private fadeDelay: number;

  constructor(value: number, x: number, y: number) {
    super({
      text: value.toString(),
      style: { fontSize: 48, fill: 0x8fb7d7, fontFamily: "Lato" },
    });

    this.alpha = 0;
    this.value = value;
    this.baseX = x;
    this.baseY = y;
    this.desiredX = x;
    this.desiredY = y;
    this.x = x;
    this.y = y;
    this.direction = this.randomizeDirection();
    this.speed = this.randomizeSpeed();
    this.anchor.set(0.5);
    this.fadeDelay = Math.random() * 4;

    this.eventMode = "static";
    this.cursor = "pointer";

    this.on("pointerdown", this.onClick);
    this.on("pointerover", this.onMouseHover);

    Ticker.shared.add(this.update, this);
  }

  private onMouseHover() {
    isDragging ? this.onClick() : null;
  }

  private onClick() {
    this.isSelected = !this.isSelected;
    this.scale.set(1.6);
  }

  private randomizeSpeed() {
    const MIN = 0.0125;
    const MAX = 0.025;

    return Math.random() * (MAX - MIN) + MIN;
  }

  private randomizeDirection(): "none" | "x" | "y" {
    const random = Math.random();
    if (random < 0.5) {
      return "none";
    } else if (random < 0.75) {
      return "x";
    } else {
      return "y";
    }
  }

  private update(ticker: Ticker) {
    this.fadeIn(ticker.deltaTime);
    this.float(ticker);
    this.updateScale();
  }

  private fadeIn(deltaTime: number) {
    if (this.elapsed >= this.fadeDelay) {
      this.alpha = lerp(this.alpha, 1, deltaTime * 0.1);
    }
  }

  private float = (ticker: Ticker) => {
    const deltaTime = ticker.deltaTime;
    this.elapsed += deltaTime * this.speed;

    if (this.direction === "x") {
      const offsetX = Math.cos(this.elapsed);
      this.desiredX = this.baseX + offsetX * this.distance;
    } else if (this.direction === "y") {
      const offsetY = Math.sin(this.elapsed);
      this.desiredY = this.baseY + offsetY * this.distance;
    }

    this.x = lerp(this.x, this.desiredX, 0.1 * deltaTime);
    this.y = lerp(this.y, this.desiredY, 0.1 * deltaTime);
    this.updateScale();
  };

  private updateScale() {
    if (this.isSelected) return;
    const distance = Math.hypot(
      this.baseX - globalMousePosition.x,
      this.baseY - globalMousePosition.y
    );

    const MAX_DISTANCE = 100;
    const MAX_SCALE = 1.5;
    const MIN_SCALE = 0.8;

    const scaleFactor =
      MIN_SCALE + (MAX_SCALE - MIN_SCALE) * Math.exp(-distance / MAX_DISTANCE);

    this.scale.set(scaleFactor);
  }
}
