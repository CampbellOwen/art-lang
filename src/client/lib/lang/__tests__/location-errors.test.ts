import { parse } from "../parser";
import { run } from "../interpreter";
import { isErr, isOk, LocatedError } from "../core";

describe("Location-aware error handling", () => {
  describe("Parser location errors", () => {
    it("should include location for invalid number format", () => {
      const result = parse("123.45.67");

      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        const errors = result.value as LocatedError[];
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toContain("Invalid number format");
        expect(errors[0].location).toBe(0);
        expect(errors[0].length).toBe(9);
      }
    });

    it("should include location for unterminated string", () => {
      const result = parse('"hello world');

      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        const errors = result.value as LocatedError[];
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toBe("Unterminated string literal");
        expect(errors[0].location).toBe(0);
        expect(errors[0].length).toBe(12);
      }
    });

    it("should include location for missing closing parenthesis", () => {
      const result = parse("(+ 1 2");

      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        const errors = result.value as LocatedError[];
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toBe(
          "Unexpected end of input - missing closing parenthesis",
        );
        expect(errors[0].location).toBe(0);
      }
    });

    it("should handle multiple expressions with errors", () => {
      const result = parse('(+ 1 2) "unclosed (- 3 4)');

      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        const errors = result.value as LocatedError[];
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0].message).toBe("Unterminated string literal");
        expect(errors[0].location).toBe(8);
      }
    });
  });

  describe("Interpreter location errors", () => {
    it("should include location for undefined symbol", () => {
      const parseResult = parse("undefined_symbol");
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
          expect(result.value.location).toBe(0);
        }
      }
    });

    it("should include location for type errors in arithmetic", () => {
      const parseResult = parse('(+ 1 "hello")');
      expect(isOk(parseResult)).toBe(true);

      if (isOk(parseResult)) {
        const evalResults = run(parseResult.value);
        expect(evalResults).toHaveLength(1);

        const result = evalResults[0];
        expect(isErr(result)).toBe(true);

        if (isErr(result)) {
          expect(result.value.message).toContain(
            "Addition requires numbers, got string",
          );
          expect(result.value.location).toBe(5); // Location of "hello"
        }
      }
    });

    it("should include location for division by zero", () => {
      const parseResult = parse("(/ 10 0)");
      expect(isOk(parseResult)).toBe(true);

      if (isOk(parseResult)) {
        const evalResults = run(parseResult.value);
        expect(evalResults).toHaveLength(1);

        const result = evalResults[0];
        expect(isErr(result)).toBe(true);

        if (isErr(result)) {
          expect(result.value.message).toBe("Division by zero");
          expect(result.value.location).toBe(6); // Location of the zero
        }
      }
    });

    it("should include location for comparison type errors", () => {
      const parseResult = parse('(> 5 "hello")');
      expect(isOk(parseResult)).toBe(true);

      if (isOk(parseResult)) {
        const evalResults = run(parseResult.value);
        expect(evalResults).toHaveLength(1);

        const result = evalResults[0];
        expect(isErr(result)).toBe(true);

        if (isErr(result)) {
          expect(result.value.message).toContain("Comparison requires numbers");
          expect(result.value.location).toBeDefined();
        }
      }
    });

    it("should handle empty list evaluation error", () => {
      const parseResult = parse("()");
      expect(isOk(parseResult)).toBe(true);

      if (isOk(parseResult)) {
        const evalResults = run(parseResult.value);
        expect(evalResults).toHaveLength(1);

        const result = evalResults[0];
        expect(isErr(result)).toBe(true);

        if (isErr(result)) {
          expect(result.value.message).toBe("Cannot evaluate empty list");
          expect(result.value.location).toBe(0);
        }
      }
    });
  });

  describe("Complex location scenarios", () => {
    it("should handle nested expressions with location errors", () => {
      const parseResult = parse("(+ (* 2 3) undefined_var (- 5 1))");
      expect(isOk(parseResult)).toBe(true);

      if (isOk(parseResult)) {
        const evalResults = run(parseResult.value);
        expect(evalResults).toHaveLength(1);

        const result = evalResults[0];
        expect(isErr(result)).toBe(true);

        if (isErr(result)) {
          expect(result.value.message).toBe("Symbol undefined_var undefined");
          expect(result.value.location).toBe(11); // Location of undefined_var
        }
      }
    });

    it("should handle multiple expressions with different error locations", () => {
      const input = "(+ 1 2)\n(* invalid)\n(- 5 3)";
      const parseResult = parse(input);
      expect(isOk(parseResult)).toBe(true);

      if (isOk(parseResult)) {
        const evalResults = run(parseResult.value);
        expect(evalResults).toHaveLength(3);

        // First expression should succeed
        expect(isOk(evalResults[0])).toBe(true);

        // Second expression should fail
        expect(isErr(evalResults[1])).toBe(true);
        if (isErr(evalResults[1])) {
          expect(evalResults[1].value.message).toBe("Symbol invalid undefined");
          expect(evalResults[1].value.location).toBe(11); // Location of "invalid"
        }

        // Third expression should succeed
        expect(isOk(evalResults[2])).toBe(true);
      }
    });
  });
});
