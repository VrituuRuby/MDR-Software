import { Text, Ticker } from "pixi.js";
import { lerp } from "./common";
import { globalMousePosition } from "./mdr-app";

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

  constructor(value: number, x: number, y: number) {
    super({
      text: value.toString(),
      style: { fontSize: 48, fill: 0x8fb7d7 },
    });

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
    Ticker.shared.add(this.float, this);

    this.eventMode = "static";
    this.cursor = "pointer";

    this.on("pointerdown", this.onClick);
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
    if (random < 0.7) {
      return "none";
    } else if (random < 0.85) {
      return "x";
    } else {
      return "y";
    }
  }

  private float = (ticker: Ticker) => {
    const deltaTime = ticker.deltaTime;
    this.elapsed += deltaTime * this.speed;

    const DISTANCE = 12;
    const EPSILON = 0.1;

    if (this.direction === "x") {
      const offsetX = Math.cos(this.elapsed);
      if (Math.abs(offsetX) < EPSILON) {
        const random = Math.random();
        if (random < 0.1) {
          this.direction = "y";
          this.elapsed += Math.PI / 2;
        }
      } else {
        this.desiredX = this.baseX + offsetX * DISTANCE;
      }
    } else if (this.direction === "y") {
      const offsetY = Math.sin(this.elapsed);
      if (Math.abs(offsetY) < EPSILON) {
        const random = Math.random();
        if (random < 0.1) {
          this.direction = "x";
          this.elapsed += Math.PI / 2;
        }
      } else {
        this.desiredY = this.baseY + offsetY * DISTANCE;
      }
    }

    this.x = lerp(this.x, this.desiredX, 0.1);
    this.y = lerp(this.y, this.desiredY, 0.1);
    this.updateScale(deltaTime);
  };

  private updateScale(deltaTime: number) {
    if (this.isSelected) return;
    const distance = Math.hypot(
      this.x - globalMousePosition.x,
      this.y - globalMousePosition.y
    );

    const MAX_DISTANCE = 200;
    const MAX_SCALE = 1.2;
    const MIN_SCALE = 0.8;

    const scaleFactor =
      MIN_SCALE + (MAX_SCALE - MIN_SCALE) * Math.exp(-distance / MAX_DISTANCE);

    this.scale.set(scaleFactor);
  }
}
