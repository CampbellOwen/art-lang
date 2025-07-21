import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import {
  MockCanvas,
  drawLine,
  drawCircle,
  drawRectangle,
  colorToString,
  Color,
  Canvas,
} from "../canvas.js";

describe("MockCanvas", () => {
  let canvas: MockCanvas;

  beforeEach(() => {
    canvas = new MockCanvas(800, 600);
  });

  describe("constructor", () => {
    it("should create canvas with default dimensions", () => {
      const defaultCanvas = new MockCanvas();
      expect(defaultCanvas.canvas.width).toBe(800);
      expect(defaultCanvas.canvas.height).toBe(600);
    });

    it("should create canvas with custom dimensions", () => {
      const customCanvas = new MockCanvas(1200, 900);
      expect(customCanvas.canvas.width).toBe(1200);
      expect(customCanvas.canvas.height).toBe(900);
    });

    it("should initialize with empty operations", () => {
      expect(canvas.getOperations()).toEqual([]);
    });
  });

  describe("path operations", () => {
    it("should record beginPath", () => {
      canvas.beginPath();

      const operations = canvas.getOperations();
      expect(operations).toHaveLength(1);
      expect(operations[0]).toEqual({
        type: "beginPath",
        args: [],
      });
    });

    it("should record moveTo", () => {
      canvas.moveTo(10, 20);

      const operations = canvas.getOperations();
      expect(operations).toHaveLength(1);
      expect(operations[0]).toEqual({
        type: "moveTo",
        args: [10, 20],
      });
    });

    it("should record lineTo", () => {
      canvas.lineTo(30, 40);

      const operations = canvas.getOperations();
      expect(operations).toHaveLength(1);
      expect(operations[0]).toEqual({
        type: "lineTo",
        args: [30, 40],
      });
    });

    it("should record closePath", () => {
      canvas.closePath();

      const operations = canvas.getOperations();
      expect(operations).toHaveLength(1);
      expect(operations[0]).toEqual({
        type: "closePath",
        args: [],
      });
    });
  });

  describe("shape primitives", () => {
    it("should record rect", () => {
      canvas.rect(10, 20, 100, 80);

      const operations = canvas.getOperations();
      expect(operations).toHaveLength(1);
      expect(operations[0]).toEqual({
        type: "rect",
        args: [10, 20, 100, 80],
      });
    });

    it("should record arc", () => {
      canvas.arc(100, 100, 50, 0, 2 * Math.PI, false);

      const operations = canvas.getOperations();
      expect(operations).toHaveLength(1);
      expect(operations[0]).toEqual({
        type: "arc",
        args: [100, 100, 50, 0, 2 * Math.PI, false],
      });
    });

    it("should use default counterclockwise value for arc", () => {
      canvas.arc(50, 50, 25, 0, Math.PI);

      const operations = canvas.getOperations();
      expect(operations[0].args[5]).toBe(false);
    });
  });

  describe("drawing operations", () => {
    it("should record fill", () => {
      canvas.fill();

      const operations = canvas.getOperations();
      expect(operations).toHaveLength(1);
      expect(operations[0]).toEqual({
        type: "fill",
        args: [],
      });
    });

    it("should record stroke", () => {
      canvas.stroke();

      const operations = canvas.getOperations();
      expect(operations).toHaveLength(1);
      expect(operations[0]).toEqual({
        type: "stroke",
        args: [],
      });
    });
  });

  describe("text operations", () => {
    it("should record fillText", () => {
      canvas.fillText("Hello World", 50, 100);

      const operations = canvas.getOperations();
      expect(operations).toHaveLength(1);
      expect(operations[0]).toEqual({
        type: "fillText",
        args: ["Hello World", 50, 100],
      });
    });

    it("should record strokeText", () => {
      canvas.strokeText("Hello World", 75, 125);

      const operations = canvas.getOperations();
      expect(operations).toHaveLength(1);
      expect(operations[0]).toEqual({
        type: "strokeText",
        args: ["Hello World", 75, 125],
      });
    });
  });

  describe("clear operations", () => {
    it("should record clearRect", () => {
      canvas.clearRect(0, 0, 800, 600);

      const operations = canvas.getOperations();
      expect(operations).toHaveLength(1);
      expect(operations[0]).toEqual({
        type: "clearRect",
        args: [0, 0, 800, 600],
      });
    });

    it("should record fillRect", () => {
      canvas.fillRect(10, 20, 100, 50);

      const operations = canvas.getOperations();
      expect(operations).toHaveLength(1);
      expect(operations[0]).toEqual({
        type: "fillRect",
        args: [10, 20, 100, 50],
      });
    });

    it("should record strokeRect", () => {
      canvas.strokeRect(5, 5, 90, 90);

      const operations = canvas.getOperations();
      expect(operations).toHaveLength(1);
      expect(operations[0]).toEqual({
        type: "strokeRect",
        args: [5, 5, 90, 90],
      });
    });
  });

  describe("style properties", () => {
    it("should have default style values", () => {
      expect(canvas.fillStyle).toBe("#000000");
      expect(canvas.strokeStyle).toBe("#000000");
      expect(canvas.lineWidth).toBe(1);
      expect(canvas.font).toBe("10px sans-serif");
    });

    it("should allow setting style properties", () => {
      canvas.fillStyle = "#ff0000";
      canvas.strokeStyle = "#00ff00";
      canvas.lineWidth = 3;
      canvas.font = "16px Arial";

      expect(canvas.fillStyle).toBe("#ff0000");
      expect(canvas.strokeStyle).toBe("#00ff00");
      expect(canvas.lineWidth).toBe(3);
      expect(canvas.font).toBe("16px Arial");
    });
  });

  describe("transformations", () => {
    it("should record translate", () => {
      canvas.translate(50, 100);

      const operations = canvas.getOperations();
      expect(operations).toHaveLength(1);
      expect(operations[0]).toEqual({
        type: "translate",
        args: [50, 100],
      });
    });

    it("should record rotate", () => {
      canvas.rotate(Math.PI / 4);

      const operations = canvas.getOperations();
      expect(operations).toHaveLength(1);
      expect(operations[0]).toEqual({
        type: "rotate",
        args: [Math.PI / 4],
      });
    });

    it("should record scale", () => {
      canvas.scale(2.0, 1.5);

      const operations = canvas.getOperations();
      expect(operations).toHaveLength(1);
      expect(operations[0]).toEqual({
        type: "scale",
        args: [2.0, 1.5],
      });
    });

    it("should record resetTransform", () => {
      canvas.resetTransform();

      const operations = canvas.getOperations();
      expect(operations).toHaveLength(1);
      expect(operations[0]).toEqual({
        type: "resetTransform",
        args: [],
      });
    });
  });

  describe("state management", () => {
    it("should record save and restore operations", () => {
      canvas.save();
      canvas.restore();

      const operations = canvas.getOperations();
      expect(operations).toHaveLength(2);
      expect(operations[0]).toEqual({
        type: "save",
        args: [],
      });
      expect(operations[1]).toEqual({
        type: "restore",
        args: [],
      });
    });
  });

  describe("operation tracking", () => {
    it("should track multiple operations in order", () => {
      canvas.beginPath();
      canvas.moveTo(0, 0);
      canvas.lineTo(100, 100);
      canvas.stroke();

      const operations = canvas.getOperations();
      expect(operations).toHaveLength(4);
      expect(operations[0].type).toBe("beginPath");
      expect(operations[1].type).toBe("moveTo");
      expect(operations[2].type).toBe("lineTo");
      expect(operations[3].type).toBe("stroke");
    });

    it("should clear operations when requested", () => {
      canvas.beginPath();
      canvas.rect(0, 0, 10, 10);
      canvas.fill();
      expect(canvas.getOperations()).toHaveLength(3);

      canvas.clearOperations();
      expect(canvas.getOperations()).toHaveLength(0);

      canvas.stroke();
      expect(canvas.getOperations()).toHaveLength(1);
    });

    it("should return copy of operations array", () => {
      canvas.beginPath();

      const operations1 = canvas.getOperations();
      const operations2 = canvas.getOperations();

      expect(operations1).toEqual(operations2);
      expect(operations1).not.toBe(operations2);
    });
  });
});

describe("Canvas interface compatibility", () => {
  it("should work with real CanvasRenderingContext2D type", () => {
    // This test demonstrates that the Canvas interface is compatible
    // with the real browser CanvasRenderingContext2D

    // Mock a real CanvasRenderingContext2D
    const mockContext: Canvas = {
      canvas: { width: 800, height: 600 },
      fillStyle: "#000000",
      strokeStyle: "#000000",
      lineWidth: 1,
      font: "10px sans-serif",
      beginPath: jest.fn(),
      moveTo: jest.fn(),
      lineTo: jest.fn(),
      closePath: jest.fn(),
      rect: jest.fn(),
      arc: jest.fn(),
      fill: jest.fn(),
      stroke: jest.fn(),
      fillText: jest.fn(),
      strokeText: jest.fn(),
      clearRect: jest.fn(),
      fillRect: jest.fn(),
      strokeRect: jest.fn(),
      translate: jest.fn(),
      rotate: jest.fn(),
      scale: jest.fn(),
      resetTransform: jest.fn(),
      save: jest.fn(),
      restore: jest.fn(),
    };

    // Use it like any Canvas
    mockContext.fillStyle = "#ff0000";
    mockContext.beginPath();
    mockContext.rect(10, 10, 100, 50);
    mockContext.fill();

    expect(mockContext.fillStyle).toBe("#ff0000");
    expect(mockContext.beginPath).toHaveBeenCalled();
    expect(mockContext.rect).toHaveBeenCalledWith(10, 10, 100, 50);
    expect(mockContext.fill).toHaveBeenCalled();
  });
});

describe("utility functions", () => {
  let canvas: MockCanvas;

  beforeEach(() => {
    canvas = new MockCanvas();
  });

  describe("drawLine", () => {
    it("should draw a line using path operations", () => {
      drawLine(canvas, 10, 20, 30, 40);

      const operations = canvas.getOperations();
      expect(operations).toHaveLength(4);
      expect(operations[0]).toEqual({ type: "beginPath", args: [] });
      expect(operations[1]).toEqual({ type: "moveTo", args: [10, 20] });
      expect(operations[2]).toEqual({ type: "lineTo", args: [30, 40] });
      expect(operations[3]).toEqual({ type: "stroke", args: [] });
    });
  });

  describe("drawCircle", () => {
    it("should draw filled circle", () => {
      drawCircle(canvas, 100, 100, 50, true);

      const operations = canvas.getOperations();
      expect(operations).toHaveLength(3);
      expect(operations[0]).toEqual({ type: "beginPath", args: [] });
      expect(operations[1]).toEqual({
        type: "arc",
        args: [100, 100, 50, 0, 2 * Math.PI, false],
      });
      expect(operations[2]).toEqual({ type: "fill", args: [] });
    });

    it("should draw outlined circle by default", () => {
      drawCircle(canvas, 50, 50, 25);

      const operations = canvas.getOperations();
      expect(operations).toHaveLength(3);
      expect(operations[2]).toEqual({ type: "stroke", args: [] });
    });
  });

  describe("drawRectangle", () => {
    it("should draw filled rectangle", () => {
      drawRectangle(canvas, 10, 20, 100, 80, true);

      const operations = canvas.getOperations();
      expect(operations).toHaveLength(1);
      expect(operations[0]).toEqual({
        type: "fillRect",
        args: [10, 20, 100, 80],
      });
    });

    it("should draw outlined rectangle by default", () => {
      drawRectangle(canvas, 5, 5, 50, 50);

      const operations = canvas.getOperations();
      expect(operations).toHaveLength(1);
      expect(operations[0]).toEqual({
        type: "strokeRect",
        args: [5, 5, 50, 50],
      });
    });
  });

  describe("colorToString", () => {
    it("should convert color without alpha", () => {
      const color: Color = { r: 255, g: 128, b: 64 };
      expect(colorToString(color)).toBe("rgba(255, 128, 64, 1)");
    });

    it("should convert color with alpha", () => {
      const color: Color = { r: 200, g: 150, b: 100, a: 0.5 };
      expect(colorToString(color)).toBe("rgba(200, 150, 100, 0.5)");
    });

    it("should floor color values", () => {
      const color: Color = { r: 255.9, g: 128.1, b: 64.7 };
      expect(colorToString(color)).toBe("rgba(255, 128, 64, 1)");
    });
  });
});
