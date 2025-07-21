import "./App.css";

import { useState, useCallback } from "react";
import * as React from "react";

import { parse } from "./lib/lang";
import { run } from "./lib/lang/interpreter";
import { debugPrint, isErr, isOk } from "./lib/lang/core";

function App() {
  const [input, setInput] = useState(
    '(+ 1 2) (* 10 2) (- 10 5 3) (/ 100 5) (< 1 2) (> 1 2) (= 1 1) (= "hello" "hello")',
  );
  const [results, setResults] = useState<string[]>([]);
  const [errors, setErrors] = useState<string[]>([]);

  const evaluateExpression = useCallback((expression: string) => {
    if (!expression.trim()) {
      setResults([]);
      setErrors([]);
      return;
    }

    const parseResult = parse(expression);

    if (isErr(parseResult)) {
      setErrors(parseResult.value.map((err) => err.message));
      setResults([]);
      return;
    }

    setErrors([]);
    const evaluated = run(parseResult.value);
    const resultStrings: string[] = [];
    const errorStrings: string[] = [];

    evaluated.forEach((res, index) => {
      if (isErr(res)) {
        errorStrings.push(`Expression ${index + 1}: ${res.value.message}`);
      } else if (!res.value) {
        errorStrings.push(`Expression ${index + 1}: No result`);
      } else {
        resultStrings.push(debugPrint(res.value));
      }
    });

    setResults(resultStrings);
    if (errorStrings.length > 0) {
      setErrors(errorStrings);
    }
  }, []);

  React.useEffect(() => {
    evaluateExpression(input);
  }, [input, evaluateExpression]);

  return (
    <div className="App">
      <h1>Art Language Interpreter</h1>

      <div
        className="interpreter-container"
        style={{
          maxWidth: "800px",
          margin: "0 auto",
          padding: "20px",
          textAlign: "left",
        }}
      >
        <div style={{ marginBottom: "20px" }}>
          <label
            htmlFor="expression-input"
            style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: "bold",
            }}
          >
            Enter Expression(s):
          </label>
          <textarea
            id="expression-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter your expressions here, e.g., (+ 1 2) (* 3 4)"
            style={{
              width: "100%",
              minHeight: "120px",
              padding: "12px",
              fontSize: "14px",
              fontFamily: "monospace",
              border: "2px solid #ccc",
              borderRadius: "4px",
              resize: "vertical",
            }}
          />
        </div>

        {errors.length > 0 && (
          <div
            style={{
              marginBottom: "20px",
              padding: "12px",
              backgroundColor: "#fee",
              border: "1px solid #fcc",
              borderRadius: "4px",
            }}
          >
            <h3 style={{ margin: "0 0 8px 0", color: "#c33" }}>Errors:</h3>
            {errors.map((error, index) => (
              <div
                key={index}
                style={{
                  fontFamily: "monospace",
                  fontSize: "14px",
                  color: "#c33",
                  marginBottom: "4px",
                }}
              >
                {error}
              </div>
            ))}
          </div>
        )}

        {results.length > 0 && (
          <div
            style={{
              padding: "12px",
              backgroundColor: "#efe",
              border: "1px solid #cfc",
              borderRadius: "4px",
            }}
          >
            <h3 style={{ margin: "0 0 8px 0", color: "#363" }}>Results:</h3>
            {results.map((result, index) => (
              <div
                key={index}
                style={{
                  fontFamily: "monospace",
                  fontSize: "14px",
                  color: "#363",
                  marginBottom: "4px",
                }}
              >
                {result}
              </div>
            ))}
          </div>
        )}

        <div
          style={{
            marginTop: "30px",
            padding: "15px",
            backgroundColor: "#f8f9fa",
            borderRadius: "4px",
            fontSize: "14px",
          }}
        >
          <h4 style={{ margin: "0 0 10px 0" }}>Available Operations:</h4>
          <div style={{ fontFamily: "monospace" }}>
            <div>
              <strong>Arithmetic:</strong> + - * /
            </div>
            <div>
              <strong>Comparison:</strong> &gt; &gt;= &lt; &lt;= =
            </div>
            <div>
              <strong>Literals:</strong> numbers, "strings", true, false
            </div>
            <div>
              <strong>Example:</strong> (+ 1 2) (* 3 4) (&gt; 5 3) (= "hello"
              "world")
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
