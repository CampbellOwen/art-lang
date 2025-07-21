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

// Canvas interface that matches CanvasRenderingContext2D subset we need
export interface Canvas {
  // Canvas dimensions
  readonly canvas: { width: number; height: number };

  // Path operations
  beginPath(): void;
  moveTo(x: number, y: number): void;
  lineTo(x: number, y: number): void;
  closePath(): void;

  // Shape primitives
  rect(x: number, y: number, width: number, height: number): void;
  arc(
    x: number,
    y: number,
    radius: number,
    startAngle: number,
    endAngle: number,
    counterclockwise?: boolean,
  ): void;

  // Drawing operations
  fill(): void;
  stroke(): void;

  // Text operations
  fillText(text: string, x: number, y: number): void;
  strokeText(text: string, x: number, y: number): void;

  // Clear operations
  clearRect(x: number, y: number, width: number, height: number): void;
  fillRect(x: number, y: number, width: number, height: number): void;
  strokeRect(x: number, y: number, width: number, height: number): void;

  // Style properties
  fillStyle: string | CanvasGradient | CanvasPattern;
  strokeStyle: string | CanvasGradient | CanvasPattern;
  lineWidth: number;
  font: string;

  // Transformation operations
  translate(x: number, y: number): void;
  rotate(angle: number): void;
  scale(x: number, y: number): void;
  resetTransform(): void;

  // State management
  save(): void;
  restore(): void;
}

export class MockCanvas implements Canvas {
  public readonly canvas: { width: number; height: number };
  private operations: Array<{ type: string; args: any[] }> = [];

  // Style properties
  public fillStyle: string | CanvasGradient | CanvasPattern = "#000000";
  public strokeStyle: string | CanvasGradient | CanvasPattern = "#000000";
  public lineWidth: number = 1;
  public font: string = "10px sans-serif";

  constructor(width: number = 800, height: number = 600) {
    this.canvas = { width, height };
  }

  // Method to inspect operations for testing
  getOperations(): Array<{ type: string; args: any[] }> {
    return [...this.operations];
  }

  clearOperations(): void {
    this.operations = [];
  }

  beginPath(): void {
    this.operations.push({ type: "beginPath", args: [] });
  }

  moveTo(x: number, y: number): void {
    this.operations.push({ type: "moveTo", args: [x, y] });
  }

  lineTo(x: number, y: number): void {
    this.operations.push({ type: "lineTo", args: [x, y] });
  }

  closePath(): void {
    this.operations.push({ type: "closePath", args: [] });
  }

  rect(x: number, y: number, width: number, height: number): void {
    this.operations.push({ type: "rect", args: [x, y, width, height] });
  }

  arc(
    x: number,
    y: number,
    radius: number,
    startAngle: number,
    endAngle: number,
    counterclockwise: boolean = false,
  ): void {
    this.operations.push({
      type: "arc",
      args: [x, y, radius, startAngle, endAngle, counterclockwise],
    });
  }

  fill(): void {
    this.operations.push({ type: "fill", args: [] });
  }

  stroke(): void {
    this.operations.push({ type: "stroke", args: [] });
  }

  fillText(text: string, x: number, y: number): void {
    this.operations.push({ type: "fillText", args: [text, x, y] });
  }

  strokeText(text: string, x: number, y: number): void {
    this.operations.push({ type: "strokeText", args: [text, x, y] });
  }

  clearRect(x: number, y: number, width: number, height: number): void {
    this.operations.push({ type: "clearRect", args: [x, y, width, height] });
  }

  fillRect(x: number, y: number, width: number, height: number): void {
    this.operations.push({ type: "fillRect", args: [x, y, width, height] });
  }

  strokeRect(x: number, y: number, width: number, height: number): void {
    this.operations.push({ type: "strokeRect", args: [x, y, width, height] });
  }

  translate(x: number, y: number): void {
    this.operations.push({ type: "translate", args: [x, y] });
  }

  rotate(angle: number): void {
    this.operations.push({ type: "rotate", args: [angle] });
  }

  scale(x: number, y: number): void {
    this.operations.push({ type: "scale", args: [x, y] });
  }

  resetTransform(): void {
    this.operations.push({ type: "resetTransform", args: [] });
  }

  save(): void {
    this.operations.push({ type: "save", args: [] });
  }

  restore(): void {
    this.operations.push({ type: "restore", args: [] });
  }
}

// Utility functions for common drawing patterns
export function drawLine(
  canvas: Canvas,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): void {
  canvas.beginPath();
  canvas.moveTo(x1, y1);
  canvas.lineTo(x2, y2);
  canvas.stroke();
}

export function drawCircle(
  canvas: Canvas,
  x: number,
  y: number,
  radius: number,
  filled: boolean = false,
): void {
  canvas.beginPath();
  canvas.arc(x, y, radius, 0, 2 * Math.PI);
  if (filled) {
    canvas.fill();
  } else {
    canvas.stroke();
  }
}

export function drawRectangle(
  canvas: Canvas,
  x: number,
  y: number,
  width: number,
  height: number,
  filled: boolean = false,
): void {
  if (filled) {
    canvas.fillRect(x, y, width, height);
  } else {
    canvas.strokeRect(x, y, width, height);
  }
}

export function colorToString(color: Color): string {
  const r = Math.floor(color.r);
  const g = Math.floor(color.g);
  const b = Math.floor(color.b);
  const a = color.a ?? 1.0;
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}
