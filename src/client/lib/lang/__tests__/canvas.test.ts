import { describe, it, expect } from "@jest/globals";
import { MockCanvas, Point, Color } from "../canvas.js";

describe("MockCanvas", () => {
  let canvas: MockCanvas;

  beforeEach(() => {
    canvas = new MockCanvas(800, 600);
  });

  describe("constructor", () => {
    it("should create canvas with default dimensions", () => {
      const defaultCanvas = new MockCanvas();
      expect(defaultCanvas.width).toBe(800);
      expect(defaultCanvas.height).toBe(600);
    });

    it("should create canvas with custom dimensions", () => {
      const customCanvas = new MockCanvas(1200, 900);
      expect(customCanvas.width).toBe(1200);
      expect(customCanvas.height).toBe(900);
    });

    it("should initialize with empty operations", () => {
      expect(canvas.getOperations()).toEqual([]);
    });
  });

  describe("drawLine", () => {
    it("should record line drawing operation", () => {
      const start: Point = { x: 0, y: 0 };
      const end: Point = { x: 100, y: 100 };
      const color: Color = { r: 255, g: 0, b: 0 };

      canvas.drawLine(start, end, color, 2);

      const operations = canvas.getOperations();
      expect(operations).toHaveLength(1);
      expect(operations[0]).toEqual({
        type: 'drawLine',
        args: [start, end, color, 2]
      });
    });

    it("should use default thickness when not specified", () => {
      const start: Point = { x: 10, y: 20 };
      const end: Point = { x: 30, y: 40 };
      const color: Color = { r: 0, g: 255, b: 0 };

      canvas.drawLine(start, end, color);

      const operations = canvas.getOperations();
      expect(operations[0].args[3]).toBe(1);
    });
  });

  describe("drawRectangle", () => {
    it("should record rectangle drawing operation", () => {
      const topLeft: Point = { x: 50, y: 60 };
      const color: Color = { r: 0, g: 0, b: 255 };

      canvas.drawRectangle(topLeft, 100, 80, color, true);

      const operations = canvas.getOperations();
      expect(operations).toHaveLength(1);
      expect(operations[0]).toEqual({
        type: 'drawRectangle',
        args: [topLeft, 100, 80, color, true]
      });
    });

    it("should use default filled value when not specified", () => {
      const topLeft: Point = { x: 0, y: 0 };
      const color: Color = { r: 128, g: 128, b: 128 };

      canvas.drawRectangle(topLeft, 50, 50, color);

      const operations = canvas.getOperations();
      expect(operations[0].args[4]).toBe(false);
    });
  });

  describe("drawCircle", () => {
    it("should record circle drawing operation", () => {
      const center: Point = { x: 200, y: 200 };
      const color: Color = { r: 255, g: 255, b: 0 };

      canvas.drawCircle(center, 50, color, true);

      const operations = canvas.getOperations();
      expect(operations).toHaveLength(1);
      expect(operations[0]).toEqual({
        type: 'drawCircle',
        args: [center, 50, color, true]
      });
    });

    it("should use default filled value when not specified", () => {
      const center: Point = { x: 100, y: 100 };
      const color: Color = { r: 255, g: 0, b: 255 };

      canvas.drawCircle(center, 25, color);

      const operations = canvas.getOperations();
      expect(operations[0].args[3]).toBe(false);
    });
  });

  describe("drawText", () => {
    it("should record text drawing operation", () => {
      const position: Point = { x: 150, y: 300 };
      const color: Color = { r: 0, g: 0, b: 0 };

      canvas.drawText("Hello World", position, color, 16);

      const operations = canvas.getOperations();
      expect(operations).toHaveLength(1);
      expect(operations[0]).toEqual({
        type: 'drawText',
        args: ["Hello World", position, color, 16]
      });
    });

    it("should use default font size when not specified", () => {
      const position: Point = { x: 0, y: 0 };
      const color: Color = { r: 0, g: 0, b: 0 };

      canvas.drawText("Test", position, color);

      const operations = canvas.getOperations();
      expect(operations[0].args[3]).toBe(12);
    });
  });

  describe("clear", () => {
    it("should record clear operation with color", () => {
      const color: Color = { r: 255, g: 255, b: 255 };

      canvas.clear(color);

      const operations = canvas.getOperations();
      expect(operations).toHaveLength(1);
      expect(operations[0]).toEqual({
        type: 'clear',
        args: [color]
      });
    });

    it("should record clear operation without color", () => {
      canvas.clear();

      const operations = canvas.getOperations();
      expect(operations).toHaveLength(1);
      expect(operations[0]).toEqual({
        type: 'clear',
        args: [undefined]
      });
    });
  });

  describe("setPixel and getPixel", () => {
    it("should record setPixel operation", () => {
      const position: Point = { x: 42, y: 24 };
      const color: Color = { r: 128, g: 64, b: 192, a: 0.5 };

      canvas.setPixel(position, color);

      const operations = canvas.getOperations();
      expect(operations).toHaveLength(1);
      expect(operations[0]).toEqual({
        type: 'setPixel',
        args: [position, color]
      });
    });

    it("should record getPixel operation and return default color", () => {
      const position: Point = { x: 10, y: 20 };

      const result = canvas.getPixel(position);

      const operations = canvas.getOperations();
      expect(operations).toHaveLength(1);
      expect(operations[0]).toEqual({
        type: 'getPixel',
        args: [position]
      });
      expect(result).toEqual({ r: 0, g: 0, b: 0, a: 1 });
    });
  });

  describe("transformations", () => {
    it("should record translate operation", () => {
      const offset: Point = { x: 50, y: 100 };

      canvas.translate(offset);

      const operations = canvas.getOperations();
      expect(operations).toHaveLength(1);
      expect(operations[0]).toEqual({
        type: 'translate',
        args: [offset]
      });
    });

    it("should record rotate operation", () => {
      canvas.rotate(Math.PI / 4);

      const operations = canvas.getOperations();
      expect(operations).toHaveLength(1);
      expect(operations[0]).toEqual({
        type: 'rotate',
        args: [Math.PI / 4]
      });
    });

    it("should record scale operation", () => {
      canvas.scale(2.0);

      const operations = canvas.getOperations();
      expect(operations).toHaveLength(1);
      expect(operations[0]).toEqual({
        type: 'scale',
        args: [2.0]
      });
    });

    it("should record resetTransform operation", () => {
      canvas.resetTransform();

      const operations = canvas.getOperations();
      expect(operations).toHaveLength(1);
      expect(operations[0]).toEqual({
        type: 'resetTransform',
        args: []
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
        type: 'save',
        args: []
      });
      expect(operations[1]).toEqual({
        type: 'restore',
        args: []
      });
    });

    it("should manage transform stack on save/restore", () => {
      // Initial state
      expect(canvas['transformStack']).toHaveLength(0);

      canvas.save();
      expect(canvas['transformStack']).toHaveLength(1);

      canvas.save();
      expect(canvas['transformStack']).toHaveLength(2);

      canvas.restore();
      expect(canvas['transformStack']).toHaveLength(1);

      canvas.restore();
      expect(canvas['transformStack']).toHaveLength(0);
    });
  });

  describe("operation tracking", () => {
    it("should track multiple operations in order", () => {
      const color: Color = { r: 255, g: 0, b: 0 };
      const point: Point = { x: 10, y: 10 };

      canvas.clear();
      canvas.drawLine(point, { x: 20, y: 20 }, color);
      canvas.drawCircle(point, 5, color);

      const operations = canvas.getOperations();
      expect(operations).toHaveLength(3);
      expect(operations[0].type).toBe('clear');
      expect(operations[1].type).toBe('drawLine');
      expect(operations[2].type).toBe('drawCircle');
    });

    it("should clear operations when requested", () => {
      const color: Color = { r: 0, g: 255, b: 0 };
      const point: Point = { x: 0, y: 0 };

      canvas.drawLine(point, point, color);
      canvas.drawCircle(point, 10, color);
      expect(canvas.getOperations()).toHaveLength(2);

      canvas.clearOperations();
      expect(canvas.getOperations()).toHaveLength(0);

      canvas.drawRectangle(point, 10, 10, color);
      expect(canvas.getOperations()).toHaveLength(1);
    });

    it("should return copy of operations array", () => {
      const color: Color = { r: 0, g: 0, b: 255 };
      canvas.clear(color);

      const operations1 = canvas.getOperations();
      const operations2 = canvas.getOperations();

      expect(operations1).toEqual(operations2);
      expect(operations1).not.toBe(operations2); // Should be different object references
    });
  });

  describe("color handling", () => {
    it("should handle colors with alpha channel", () => {
      const position: Point = { x: 0, y: 0 };
      const colorWithAlpha: Color = { r: 255, g: 128, b: 64, a: 0.75 };

      canvas.setPixel(position, colorWithAlpha);

      const operations = canvas.getOperations();
      expect(operations[0].args[1]).toEqual(colorWithAlpha);
    });

    it("should handle colors without alpha channel", () => {
      const position: Point = { x: 0, y: 0 };
      const colorWithoutAlpha: Color = { r: 255, g: 128, b: 64 };

      canvas.setPixel(position, colorWithoutAlpha);

      const operations = canvas.getOperations();
      expect(operations[0].args[1]).toEqual(colorWithoutAlpha);
      expect(operations[0].args[1].a).toBeUndefined();
    });
  });
});
