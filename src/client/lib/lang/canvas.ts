export interface Point {
  x: number;
  y: number;
}

export interface Color {
  r: number;
  g: number;
  b: number;
  a?: number; // alpha channel, defaults to 1.0
}

export interface Canvas {
  // Canvas dimensions
  readonly width: number;
  readonly height: number;

  // Drawing operations
  drawLine(start: Point, end: Point, color: Color, thickness?: number): void;
  drawRectangle(
    topLeft: Point,
    width: number,
    height: number,
    color: Color,
    filled?: boolean,
  ): void;
  drawCircle(
    center: Point,
    radius: number,
    color: Color,
    filled?: boolean,
  ): void;
  drawText(
    text: string,
    position: Point,
    color: Color,
    fontSize?: number,
  ): void;

  // Canvas operations
  clear(color?: Color): void;
  setPixel(position: Point, color: Color): void;
  getPixel(position: Point): Color;

  // Transformation operations
  translate(offset: Point): void;
  rotate(angle: number): void;
  scale(factor: number): void;
  resetTransform(): void;

  // State management
  save(): void;
  restore(): void;
}

export class MockCanvas implements Canvas {
  public readonly width: number;
  public readonly height: number;
  private operations: Array<{ type: string; args: any[] }> = [];
  private transformStack: any[] = [];

  constructor(width: number = 800, height: number = 600) {
    this.width = width;
    this.height = height;
  }

  // Method to inspect operations for testing
  getOperations(): Array<{ type: string; args: any[] }> {
    return [...this.operations];
  }

  clearOperations(): void {
    this.operations = [];
  }

  drawLine(
    start: Point,
    end: Point,
    color: Color,
    thickness: number = 1,
  ): void {
    this.operations.push({
      type: "drawLine",
      args: [start, end, color, thickness],
    });
  }

  drawRectangle(
    topLeft: Point,
    width: number,
    height: number,
    color: Color,
    filled: boolean = false,
  ): void {
    this.operations.push({
      type: "drawRectangle",
      args: [topLeft, width, height, color, filled],
    });
  }

  drawCircle(
    center: Point,
    radius: number,
    color: Color,
    filled: boolean = false,
  ): void {
    this.operations.push({
      type: "drawCircle",
      args: [center, radius, color, filled],
    });
  }

  drawText(
    text: string,
    position: Point,
    color: Color,
    fontSize: number = 12,
  ): void {
    this.operations.push({
      type: "drawText",
      args: [text, position, color, fontSize],
    });
  }

  clear(color?: Color): void {
    this.operations.push({
      type: "clear",
      args: [color],
    });
  }

  setPixel(position: Point, color: Color): void {
    this.operations.push({
      type: "setPixel",
      args: [position, color],
    });
  }

  getPixel(position: Point): Color {
    this.operations.push({
      type: "getPixel",
      args: [position],
    });
    // Return a default color for testing
    return { r: 0, g: 0, b: 0, a: 1 };
  }

  translate(offset: Point): void {
    this.operations.push({
      type: "translate",
      args: [offset],
    });
  }

  rotate(angle: number): void {
    this.operations.push({
      type: "rotate",
      args: [angle],
    });
  }

  scale(factor: number): void {
    this.operations.push({
      type: "scale",
      args: [factor],
    });
  }

  resetTransform(): void {
    this.operations.push({
      type: "resetTransform",
      args: [],
    });
  }

  save(): void {
    this.transformStack.push({});
    this.operations.push({
      type: "save",
      args: [],
    });
  }

  restore(): void {
    this.transformStack.pop();
    this.operations.push({
      type: "restore",
      args: [],
    });
  }
}
