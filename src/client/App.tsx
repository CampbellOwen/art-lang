import "./App.css";

import { useState, useCallback, useRef } from "react";
import * as React from "react";

import { parse } from "./lib/lang";
import { run } from "./lib/lang/interpreter";
import { debugPrint, isErr, LocatedError } from "./lib/lang/core";
import { Canvas } from "./lib/lang/canvas";

interface ErrorDisplayInfo {
  message: string;
  location?: number;
  length?: number;
  line: number;
  column: number;
}

// Adapter to wrap CanvasRenderingContext2D to match our Canvas interface
class CanvasAdapter implements Canvas {
  private ctx: CanvasRenderingContext2D;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  get canvas() {
    return { width: this.ctx.canvas.width, height: this.ctx.canvas.height };
  }

  get fillStyle() {
    return this.ctx.fillStyle;
  }
  set fillStyle(value) {
    this.ctx.fillStyle = value;
  }

  get strokeStyle() {
    return this.ctx.strokeStyle;
  }
  set strokeStyle(value) {
    this.ctx.strokeStyle = value;
  }

  get lineWidth() {
    return this.ctx.lineWidth;
  }
  set lineWidth(value) {
    this.ctx.lineWidth = value;
  }

  get font() {
    return this.ctx.font;
  }
  set font(value) {
    this.ctx.font = value;
  }

  beginPath() {
    this.ctx.beginPath();
  }
  moveTo(x: number, y: number) {
    this.ctx.moveTo(x, y);
  }
  lineTo(x: number, y: number) {
    this.ctx.lineTo(x, y);
  }
  closePath() {
    this.ctx.closePath();
  }
  rect(x: number, y: number, width: number, height: number) {
    this.ctx.rect(x, y, width, height);
  }
  arc(
    x: number,
    y: number,
    radius: number,
    startAngle: number,
    endAngle: number,
    counterclockwise?: boolean,
  ) {
    this.ctx.arc(x, y, radius, startAngle, endAngle, counterclockwise);
  }
  fill() {
    this.ctx.fill();
  }
  stroke() {
    this.ctx.stroke();
  }
  fillText(text: string, x: number, y: number) {
    this.ctx.fillText(text, x, y);
  }
  strokeText(text: string, x: number, y: number) {
    this.ctx.strokeText(text, x, y);
  }
  clearRect(x: number, y: number, width: number, height: number) {
    this.ctx.clearRect(x, y, width, height);
  }
  fillRect(x: number, y: number, width: number, height: number) {
    this.ctx.fillRect(x, y, width, height);
  }
  strokeRect(x: number, y: number, width: number, height: number) {
    this.ctx.strokeRect(x, y, width, height);
  }
  translate(x: number, y: number) {
    this.ctx.translate(x, y);
  }
  rotate(angle: number) {
    this.ctx.rotate(angle);
  }
  scale(x: number, y: number) {
    this.ctx.scale(x, y);
  }
  resetTransform() {
    this.ctx.resetTransform();
  }
  save() {
    this.ctx.save();
  }
  restore() {
    this.ctx.restore();
  }
}

function App() {
  const [input, setInput] = useState(
    `; Black background
(fill "black")
(rect 0 0 width height)

; Pink diagonal lines from top
(stroke (rgb 255 50 100))
(let ((i 0))
  (while (< i 20)
    (line (* i 15) 0 (- width (* i 15)) height)
    (set i (+ i 1))))

; Blue diagonal lines from left
(stroke (rgb 100 200 255))
(let ((i 0))
  (while (< i 20)
    (line 0 (* i 15) width (- height (* i 15)))
    (set i (+ i 1))))

; Yellow sun in center
(fill (rgb 255 255 100))
(noStroke)
(rect (- (/ width 2) 25) (- (/ height 2) 25) 50 50)`,
  );
  const [results, setResults] = useState<string[]>([]);
  const [errors, setErrors] = useState<ErrorDisplayInfo[]>([]);
  const [showResults, setShowResults] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Helper function to convert character position to line/column
  const getLineColumn = useCallback((input: string, position: number) => {
    const lines = input.substring(0, position).split("\n");
    const line = lines.length;
    const column = lines[lines.length - 1].length + 1;
    return { line, column };
  }, []);

  const evaluateExpression = useCallback(
    (expression: string) => {
      if (!expression.trim()) {
        setResults([]);
        setErrors([]);
        // Clear canvas when input is empty
        if (canvasRef.current) {
          const ctx = canvasRef.current.getContext("2d");
          if (ctx) {
            ctx.clearRect(0, 0, 300, 300);
          }
        }
        return;
      }

      const parseResult = parse(expression);

      if (isErr(parseResult)) {
        const errorInfos: ErrorDisplayInfo[] = parseResult.value.map(
          (err: LocatedError) => {
            const { line, column } = getLineColumn(
              expression,
              err.location || 0,
            );
            return {
              message: err.message,
              location: err.location,
              length: err.length,
              line,
              column,
            };
          },
        );
        setErrors(errorInfos);
        setResults([]);
        return;
      }

      setErrors([]);

      // Clear canvas before drawing
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext("2d");
        if (ctx) {
          ctx.clearRect(0, 0, 300, 300);
          // Set default styles
          ctx.fillStyle = "#000000";
          ctx.strokeStyle = "#000000";
        }
      }

      // Create canvas adapter for the interpreter
      let canvasAdapter: Canvas | undefined;
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext("2d");
        if (ctx) {
          canvasAdapter = new CanvasAdapter(ctx);
        }
      }

      const evaluated = run(parseResult.value, canvasAdapter, 300, 300);
      const resultStrings: string[] = [];
      const errorInfos: ErrorDisplayInfo[] = [];

      evaluated.forEach((res, index) => {
        if (isErr(res)) {
          const { line, column } = getLineColumn(
            expression,
            res.value.location || 0,
          );
          errorInfos.push({
            message: `Expression ${index + 1}: ${res.value.message}`,
            location: res.value.location,
            length: res.value.length,
            line,
            column,
          });
        } else {
          // Handle successful evaluations, including undefined results from side-effect functions
          if (res.value !== undefined) {
            resultStrings.push(debugPrint(res.value));
          } else {
            // For side-effect functions that return undefined, show a placeholder
            resultStrings.push("(no return value)");
          }
        }
      });

      setResults(resultStrings);
      if (errorInfos.length > 0) {
        setErrors(errorInfos);
      }
    },
    [getLineColumn],
  );

  React.useEffect(() => {
    evaluateExpression(input);
  }, [input, evaluateExpression]);

  const highlightErrorInInput = (
    errorLocation?: number,
    errorLength?: number,
  ) => {
    if (!textareaRef.current || errorLocation === undefined) return;

    textareaRef.current.focus();
    const start = errorLocation;
    const end = errorLocation + (errorLength || 1);
    textareaRef.current.setSelectionRange(start, end);
  };

  return (
    <div className="App">
      <h1>Art Language Interpreter</h1>

      <div className="interpreter-container">
        <div className="input-container">
          <label htmlFor="expression-input" className="input-label">
            Enter Expression(s):
          </label>
          <textarea
            ref={textareaRef}
            id="expression-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter your expressions here, e.g., (+ 1 2) (* 3 4)"
            className={`expression-input ${errors.length > 0 ? "has-errors" : ""}`}
          />
        </div>

        <div className="canvas-container">
          <h3 className="canvas-title">Canvas Output:</h3>
          <canvas
            ref={canvasRef}
            width={300}
            height={300}
            className="art-canvas"
          />
        </div>

        {errors.length > 0 && (
          <div className="errors-container">
            <h3 className="errors-title">Errors:</h3>
            {errors.map((error, index) => (
              <div
                key={index}
                className="error-item"
                onClick={() =>
                  highlightErrorInInput(error.location, error.length)
                }
                title="Click to highlight error location in input"
              >
                <div className="error-location">
                  Line {error.line}, Column {error.column}:
                </div>
                <div className="error-message">{error.message}</div>
                {error.location !== undefined && (
                  <div className="error-details">
                    Position: {error.location}
                    {error.length &&
                      error.length > 1 &&
                      ` (${error.length} chars)`}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {results.length > 0 && showResults && (
          <div className="results-container">
            <div className="results-header">
              <h3 className="results-title">Results:</h3>
              <button
                onClick={() => setShowResults(false)}
                className="toggle-button"
              >
                Hide
              </button>
            </div>
            {results.map((result, index) => (
              <div key={index} className="result-item">
                {result}
              </div>
            ))}
          </div>
        )}

        {!showResults && (
          <div className="results-toggle">
            <button
              onClick={() => setShowResults(true)}
              className="toggle-button show-results-button"
              disabled={results.length === 0}
            >
              {results.length > 0
                ? `Show Results (${results.length})`
                : "Results (hidden by default)"}
            </button>
          </div>
        )}

        <div className="help-section">
          <h4 className="help-title">Available Operations:</h4>
          <div className="help-content">
            <div>
              <strong>Arithmetic:</strong> + - * /
            </div>
            <div>
              <strong>Comparison:</strong> &gt; &gt;= &lt; &lt;= =
            </div>
            <div>
              <strong>Control Flow:</strong> if, while
            </div>
            <div>
              <strong>Variables:</strong> let, set, width, height
            </div>
            <div>
              <strong>Canvas:</strong> stroke, fill, noStroke, noFill, rgb,
              rect, line
            </div>
            <div>
              <strong>Literals:</strong> numbers, "strings", true, false
            </div>
            <div>
              <strong>Built-in Variables:</strong> width (300), height (300)
            </div>
            <div style={{ marginTop: "10px" }}>
              <strong>If Statement Syntax:</strong>
            </div>
            <div style={{ marginLeft: "10px", fontSize: "12px" }}>
              (if condition true_expr false_expr)
            </div>
            <div style={{ marginLeft: "10px", fontSize: "12px" }}>
              • Numbers: 0 is false, others true
            </div>
            <div style={{ marginLeft: "10px", fontSize: "12px" }}>
              • Strings: "" is false, others true
            </div>
            <div style={{ marginLeft: "10px", fontSize: "12px" }}>
              • Booleans: true/false as expected
            </div>
            <div style={{ marginTop: "10px" }}>
              <strong>While Loop Syntax:</strong>
            </div>
            <div style={{ marginLeft: "10px", fontSize: "12px" }}>
              (while condition expr1 expr2 ...)
            </div>
            <div style={{ marginTop: "10px" }}>
              <strong>Canvas Functions:</strong>
            </div>
            <div style={{ marginLeft: "10px", fontSize: "12px" }}>
              • (stroke "color") - Set stroke color for outlines
            </div>
            <div style={{ marginLeft: "10px", fontSize: "12px" }}>
              • (fill "color") - Set fill color for shapes
            </div>
            <div style={{ marginLeft: "10px", fontSize: "12px" }}>
              • (noStroke) - Disable stroke/outline for shapes
            </div>
            <div style={{ marginLeft: "10px", fontSize: "12px" }}>
              • (noFill) - Disable fill for shapes
            </div>
            <div style={{ marginLeft: "10px", fontSize: "12px" }}>
              • (rgb r g b) - Create RGB color string
            </div>
            <div style={{ marginLeft: "10px", fontSize: "12px" }}>
              • (rect x y width height) - Draw rectangle
            </div>
            <div style={{ marginLeft: "10px", fontSize: "12px" }}>
              • (line x1 y1 x2 y2) - Draw line from point to point
            </div>
            <div style={{ marginTop: "10px" }}>
              <strong>Examples:</strong> (+ 1 2) (if (&gt; 5 3) "big" "small")
              (rgb 255 128 0) (stroke "red") (fill "blue") (rect 10 20 100 50)
              (rect 0 0 width 20) (line 0 0 width height) (line 50 50 250 200)
            </div>
            <div
              style={{ marginLeft: "10px", fontSize: "12px", marginTop: "5px" }}
            >
              <strong>Rectangle Examples:</strong>
            </div>
            <div style={{ marginLeft: "10px", fontSize: "12px" }}>
              • (stroke "red") (fill "blue") (rect 0 0 50 30) - Blue filled with
              red outline
            </div>
            <div style={{ marginLeft: "10px", fontSize: "12px" }}>
              • (noFill) (stroke "green") (rect 60 0 40 30) - Only green outline
            </div>
            <div style={{ marginLeft: "10px", fontSize: "12px" }}>
              • (noStroke) (fill "yellow") (rect 110 0 50 30) - Only yellow fill
            </div>
            <div style={{ marginLeft: "10px", fontSize: "12px" }}>
              • (rect 0 0 width 20) - Top border using canvas width
            </div>
            <div style={{ marginLeft: "10px", fontSize: "12px" }}>
              • (rect (- width 50) 0 50 height) - Right border using expressions
            </div>
            <div style={{ marginLeft: "10px", fontSize: "12px" }}>
              • (line 0 0 width height) - Diagonal line using canvas dimensions
            </div>
            <div style={{ marginLeft: "10px", fontSize: "12px" }}>
              • (line 50 50 250 200) - Line from (50,50) to (250,200)
            </div>
          </div>
        </div>

        <div className="examples-section">
          <h4 className="examples-title">Cool Art Examples:</h4>
          <div className="examples-buttons">
            <button
              onClick={() =>
                setInput(
                  `; Deep purple background
(fill (rgb 15 10 30))
(rect 0 0 width height)

; Create radiating lines from center
(stroke (rgb 255 150 200))
(let ((centerX (/ width 2)) (centerY (/ height 2)) (i 0))
  (while (< i 36)
    (let ((angle (* i 10))
          (x2 (+ centerX (* 120 1)))
          (y2 centerY))
      (line centerX centerY x2 y2))
    (set i (+ i 1))))

; Add concentric squares with gradient colors
(noFill)
(let ((size 30))
  (while (< size 150)
    (stroke (rgb (+ 100 size) (+ 50 (/ size 2)) 255))
    (rect (- (/ width 2) (/ size 2)) (- (/ height 2) (/ size 2)) size size)
    (set size (+ size 20))))

; Bright center dot
(fill (rgb 255 255 150))
(noStroke)
(rect (- (/ width 2) 8) (- (/ height 2) 8) 16 16)`,
                )
              }
              className="example-button"
            >
              Starburst Mandala
            </button>
            <button
              onClick={() =>
                setInput(
                  `(fill "black")
(rect 0 0 width height)

(stroke (rgb 255 50 100))
(let ((i 0))
  (while (< i 20)
    (line (* i 15) 0 (- width (* i 15)) height)
    (set i (+ i 1))))

(stroke (rgb 100 200 255))
(let ((i 0))
  (while (< i 20)
    (line 0 (* i 15) width (- height (* i 15)))
    (set i (+ i 1))))

(fill (rgb 255 255 100))
(noStroke)
(rect (- (/ width 2) 25) (- (/ height 2) 25) 50 50)`,
                )
              }
              className="example-button"
            >
              Crosshatch Sun
            </button>
            <button
              onClick={() =>
                setInput(
                  `; Gradient sky background
(fill (rgb 10 5 25))
(rect 0 0 width (/ height 2))
(fill (rgb 40 20 60))
(rect 0 (/ height 2) width (/ height 2))

; Draw mountain silhouette with triangles
(fill (rgb 25 15 35))
(noStroke)
(let ((i 0))
  (while (< i 8)
    (let ((x (* i 40)) (peakHeight (+ 80 (* (+ i 1) 15))))
      (line x height (+ x 20) (- height peakHeight))
      (line (+ x 20) (- height peakHeight) (+ x 40) height))
    (set i (+ i 1))))

; Add stars in the sky
(fill (rgb 255 255 200))
(let ((starCount 0))
  (while (< starCount 15)
    (let ((x (* starCount 19)) (y (+ 20 (* starCount 7))))
      (rect (+ x 10) (+ y 5) 3 3))
    (set starCount (+ starCount 1))))

; Large moon
(fill (rgb 255 255 180))
(rect (- width 80) 40 40 40)`,
                )
              }
              className="example-button"
            >
              Night Landscape
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
