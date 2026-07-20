import type { NextFunction, Request, Response } from "express";
import type { ZodSchema } from "zod";

type Target = "body" | "query" | "params";

/** Validates req[target] against a Zod schema and replaces it with the parsed (typed, coerced) value. */
export function validate(schema: ZodSchema, target: Target = "body") {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      req[target] = schema.parse(req[target]);
      next();
    } catch (err) {
      next(err);
    }
  };
}
