import "./App.css";

import { useState, useCallback, useRef } from "react";
import * as React from "react";

import { parse } from "./lib/lang";
import { run } from "./lib/lang/interpreter";
import { debugPrint, isErr, LocatedError } from "./lib/lang/core";

interface ErrorDisplayInfo {
  message: string;
  location?: number;
  length?: number;
  line: number;
  column: number;
}

function App() {
  const [input, setInput] = useState(
    '(+ 1 2) (* 10 2) (- 10 5 3) (/ 100 5) (< 1 2) (> 1 2) (= 1 1) (= "hello" "hello") (if true "yes" "no") (if (> 5 3) 42 99) (if 0 "truthy" "falsy") (rgb 255 128 0) (stroke "red") (fill "blue") (noStroke) (noFill)',
  );
  const [results, setResults] = useState<string[]>([]);
  const [errors, setErrors] = useState<ErrorDisplayInfo[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
      const evaluated = run(parseResult.value);
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

        {results.length > 0 && (
          <div className="results-container">
            <h3 className="results-title">Results:</h3>
            {results.map((result, index) => (
              <div key={index} className="result-item">
                {result}
              </div>
            ))}
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
              <strong>Variables:</strong> let, set
            </div>
            <div>
              <strong>Canvas:</strong> stroke, fill, noStroke, noFill, rgb
            </div>
            <div>
              <strong>Literals:</strong> numbers, "strings", true, false
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
            <div style={{ marginTop: "10px" }}>
              <strong>Examples:</strong> (+ 1 2) (if (&gt; 5 3) "big" "small")
              (rgb 255 128 0) (stroke "red") (fill "blue") (noStroke) (noFill)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
