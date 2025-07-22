import { parse } from "../parser";
import { run } from "../interpreter";
import { isErr, isOk } from "../core";

describe("If conditional statement", () => {
  describe("Basic if functionality", () => {
    it("should evaluate true branch when condition is true", () => {
      const parseResult = parse("(if true 42 99)");
      expect(isOk(parseResult)).toBe(true);

      if (isOk(parseResult)) {
        const evalResults = run(parseResult.value);
        expect(evalResults).toHaveLength(1);

        const result = evalResults[0];
        expect(isOk(result)).toBe(true);

        if (isOk(result) && result.value) {
          expect(result.value.type).toBe("number");
          expect((result.value as any).value).toBe(42);
        }
      }
    });

    it("should evaluate false branch when condition is false", () => {
      const parseResult = parse("(if false 42 99)");
      expect(isOk(parseResult)).toBe(true);

      if (isOk(parseResult)) {
        const evalResults = run(parseResult.value);
        expect(evalResults).toHaveLength(1);

        const result = evalResults[0];
        expect(isOk(result)).toBe(true);

        if (isOk(result) && result.value) {
          expect(result.value.type).toBe("number");
          expect((result.value as any).value).toBe(99);
        }
      }
    });

    it("should handle boolean expressions as conditions", () => {
      const parseResult = parse("(if (> 5 3) 42 99)");
      expect(isOk(parseResult)).toBe(true);

      if (isOk(parseResult)) {
        const evalResults = run(parseResult.value);
        expect(evalResults).toHaveLength(1);

        const result = evalResults[0];
        expect(isOk(result)).toBe(true);

        if (isOk(result) && result.value) {
          expect(result.value.type).toBe("number");
          expect((result.value as any).value).toBe(42);
        }
      }
    });

    it("should handle false boolean expressions as conditions", () => {
      const parseResult = parse("(if (< 5 3) 42 99)");
      expect(isOk(parseResult)).toBe(true);

      if (isOk(parseResult)) {
        const evalResults = run(parseResult.value);
        expect(evalResults).toHaveLength(1);

        const result = evalResults[0];
        expect(isOk(result)).toBe(true);

        if (isOk(result) && result.value) {
          expect(result.value.type).toBe("number");
          expect((result.value as any).value).toBe(99);
        }
      }
    });
  });

  describe("Truthiness rules", () => {
    it("should treat non-zero numbers as truthy", () => {
      const parseResult = parse('(if 1 "true" "false")');
      expect(isOk(parseResult)).toBe(true);

      if (isOk(parseResult)) {
        const evalResults = run(parseResult.value);
        expect(evalResults).toHaveLength(1);

        const result = evalResults[0];
        expect(isOk(result)).toBe(true);

        if (isOk(result) && result.value) {
          expect(result.value.type).toBe("string");
          expect((result.value as any).value).toBe("true");
        }
      }
    });

    it("should treat zero as falsy", () => {
      const parseResult = parse('(if 0 "true" "false")');
      expect(isOk(parseResult)).toBe(true);

      if (isOk(parseResult)) {
        const evalResults = run(parseResult.value);
        expect(evalResults).toHaveLength(1);

        const result = evalResults[0];
        expect(isOk(result)).toBe(true);

        if (isOk(result) && result.value) {
          expect(result.value.type).toBe("string");
          expect((result.value as any).value).toBe("false");
        }
      }
    });

    it("should treat non-empty strings as truthy", () => {
      const parseResult = parse('(if "hello" 1 0)');
      expect(isOk(parseResult)).toBe(true);

      if (isOk(parseResult)) {
        const evalResults = run(parseResult.value);
        expect(evalResults).toHaveLength(1);

        const result = evalResults[0];
        expect(isOk(result)).toBe(true);

        if (isOk(result) && result.value) {
          expect(result.value.type).toBe("number");
          expect((result.value as any).value).toBe(1);
        }
      }
    });

    it("should treat empty strings as falsy", () => {
      const parseResult = parse('(if "" 1 0)');
      expect(isOk(parseResult)).toBe(true);

      if (isOk(parseResult)) {
        const evalResults = run(parseResult.value);
        expect(evalResults).toHaveLength(1);

        const result = evalResults[0];
        expect(isOk(result)).toBe(true);

        if (isOk(result) && result.value) {
          expect(result.value.type).toBe("number");
          expect((result.value as any).value).toBe(0);
        }
      }
    });
  });

  describe("Nested and complex expressions", () => {
    it("should handle nested if statements", () => {
      const parseResult = parse("(if true (if false 1 2) 3)");
      expect(isOk(parseResult)).toBe(true);

      if (isOk(parseResult)) {
        const evalResults = run(parseResult.value);
        expect(evalResults).toHaveLength(1);

        const result = evalResults[0];
        expect(isOk(result)).toBe(true);

        if (isOk(result) && result.value) {
          expect(result.value.type).toBe("number");
          expect((result.value as any).value).toBe(2);
        }
      }
    });

    it("should handle arithmetic expressions in branches", () => {
      const parseResult = parse("(if (> 10 5) (+ 1 2) (* 3 4))");
      expect(isOk(parseResult)).toBe(true);

      if (isOk(parseResult)) {
        const evalResults = run(parseResult.value);
        expect(evalResults).toHaveLength(1);

        const result = evalResults[0];
        expect(isOk(result)).toBe(true);

        if (isOk(result) && result.value) {
          expect(result.value.type).toBe("number");
          expect((result.value as any).value).toBe(3);
        }
      }
    });

    it("should only evaluate the chosen branch", () => {
      // This tests that the false branch isn't evaluated when condition is true
      // If it were evaluated, it would cause an undefined symbol error
      const parseResult = parse("(if true 42 undefined_symbol)");
      expect(isOk(parseResult)).toBe(true);

      if (isOk(parseResult)) {
        const evalResults = run(parseResult.value);
        expect(evalResults).toHaveLength(1);

        const result = evalResults[0];
        expect(isOk(result)).toBe(true);

        if (isOk(result) && result.value) {
          expect(result.value.type).toBe("number");
          expect((result.value as any).value).toBe(42);
        }
      }
    });
  });

  describe("Error handling", () => {
    it("should return error for wrong number of arguments - too few", () => {
      const parseResult = parse("(if true 42)");
      expect(isOk(parseResult)).toBe(true);

      if (isOk(parseResult)) {
        const evalResults = run(parseResult.value);
        expect(evalResults).toHaveLength(1);

        const result = evalResults[0];
        expect(isErr(result)).toBe(true);

        if (isErr(result)) {
          expect(result.value.message).toBe(
            "if requires exactly 3 arguments: (if condition true_expr false_expr)",
          );
        }
      }
    });

    it("should return error for wrong number of arguments - too many", () => {
      const parseResult = parse("(if true 42 99 extra)");
      expect(isOk(parseResult)).toBe(true);

      if (isOk(parseResult)) {
        const evalResults = run(parseResult.value);
        expect(evalResults).toHaveLength(1);

        const result = evalResults[0];
        expect(isErr(result)).toBe(true);

        if (isErr(result)) {
          expect(result.value.message).toBe(
            "if requires exactly 3 arguments: (if condition true_expr false_expr)",
          );
        }
      }
    });

    it("should propagate errors from condition evaluation", () => {
      const parseResult = parse("(if undefined_symbol 42 99)");
      expect(isOk(parseResult)).toBe(true);

      if (isOk(parseResult)) {
        const evalResults = run(parseResult.value);
        expect(evalResults).toHaveLength(1);

        const result = evalResults[0];
        expect(isErr(result)).toBe(true);

        if (isErr(result)) {
          expect(result.value.message).toBe(
            "Symbol undefined_symbol undefined",
          );
        }
      }
    });

    it("should propagate errors from true branch evaluation", () => {
      const parseResult = parse("(if true undefined_symbol 99)");
      expect(isOk(parseResult)).toBe(true);

      if (isOk(parseResult)) {
        const evalResults = run(parseResult.value);
        expect(evalResults).toHaveLength(1);

        const result = evalResults[0];
        expect(isErr(result)).toBe(true);

        if (isErr(result)) {
          expect(result.value.message).toBe(
            "Symbol undefined_symbol undefined",
          );
        }
      }
    });

    it("should propagate errors from false branch evaluation", () => {
      const parseResult = parse("(if false 99 undefined_symbol)");
      expect(isOk(parseResult)).toBe(true);

      if (isOk(parseResult)) {
        const evalResults = run(parseResult.value);
        expect(evalResults).toHaveLength(1);

        const result = evalResults[0];
        expect(isErr(result)).toBe(true);

        if (isErr(result)) {
          expect(result.value.message).toBe(
            "Symbol undefined_symbol undefined",
          );
        }
      }
    });

    it("should return error for unsupported condition types", () => {
      // This would test lists as conditions, but we need to create a list first
      // For now, we'll skip this test since we don't have list literals
    });
  });

  describe("Real world examples", () => {
    it("should work in mathematical computations", () => {
      const parseResult = parse("(if (> 10 5) (+ 1 2 3) (- 10 5))");
      expect(isOk(parseResult)).toBe(true);

      if (isOk(parseResult)) {
        const evalResults = run(parseResult.value);
        expect(evalResults).toHaveLength(1);

        const result = evalResults[0];
        expect(isOk(result)).toBe(true);

        if (isOk(result) && result.value) {
          expect(result.value.type).toBe("number");
          expect((result.value as any).value).toBe(6);
        }
      }
    });

    it("should work with string comparisons and results", () => {
      const parseResult = parse('(if (= "hello" "hello") "match" "no match")');
      expect(isOk(parseResult)).toBe(true);

      if (isOk(parseResult)) {
        const evalResults = run(parseResult.value);
        expect(evalResults).toHaveLength(1);

        const result = evalResults[0];
        expect(isOk(result)).toBe(true);

        if (isOk(result) && result.value) {
          expect(result.value.type).toBe("string");
          expect((result.value as any).value).toBe("match");
        }
      }
    });

    it("should work with multiple conditions in sequence", () => {
      const parseResult = parse(
        "(if (> 5 3) 1 0) (if (< 2 4) 2 0) (if (= 1 1) 3 0)",
      );
      expect(isOk(parseResult)).toBe(true);

      if (isOk(parseResult)) {
        const evalResults = run(parseResult.value);
        expect(evalResults).toHaveLength(3);

        // All should be successful
        expect(isOk(evalResults[0])).toBe(true);
        expect(isOk(evalResults[1])).toBe(true);
        expect(isOk(evalResults[2])).toBe(true);

        // Check the values
        if (isOk(evalResults[0]) && evalResults[0].value) {
          expect((evalResults[0].value as any).value).toBe(1);
        }
        if (isOk(evalResults[1]) && evalResults[1].value) {
          expect((evalResults[1].value as any).value).toBe(2);
        }
        if (isOk(evalResults[2]) && evalResults[2].value) {
          expect((evalResults[2].value as any).value).toBe(3);
        }
      }
    });
  });
});
