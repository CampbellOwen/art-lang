import "./App.css";

import { useState } from "react";
import * as React from "react";

import reactLogo from "./assets/react.svg";
import { parse } from "./lib/lang";
import { run } from "./lib/lang/interpreter";
import { debugPrint, isErr, isOk } from "./lib/lang/core";

function App() {
  const [count, setCount] = useState(0);

  const input =
    '(+ 1 2) (* 10 2) (- 10 5 3) (/ 100 5) (< 1 2) (> 1 2) (= 1 1) (= "hello" "hello")';
  React.useEffect(() => {
    const result = parse(input);

    if (isOk(result)) {
      console.log(`Parsed:\n${result.value.map(debugPrint).join("\n")}`);
      const evaluated = run(result.value);
      evaluated.forEach((res) => {
        if (isErr(res) || !res.value) {
          console.log(res.value);
        } else {
          console.log(debugPrint(res.value));
        }
      });
    } else {
      console.log(result.value);
    }
  }, [input]);

  return (
    <div className="App">
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src="/vite.svg" className="logo" alt="Vite logo" />
        </a>
        <a href="https://reactjs.org" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </div>
  );
}

export default App;
