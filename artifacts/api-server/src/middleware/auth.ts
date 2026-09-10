import { verifyToken } from "@clerk/backend";
import type { NextFunction, Request, RequestHandler, Response } from "express";

export type AuthenticatedRequest = Request & {
  userId: string;
};

export const requireAuth: RequestHandler = async (
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  const authorization = request.header("authorization");
  const token = authorization?.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length).trim()
    : null;
  const secretKey = process.env.CLERK_SECRET_KEY;

  if (!token || !secretKey) {
    response.status(401).json({ message: "Authentication required." });
    return;
  }

  try {
    const payload = await verifyToken(token, { secretKey });
    if (!payload.sub) {
      response.status(401).json({ message: "Authentication required." });
      return;
    }

    (request as AuthenticatedRequest).userId = payload.sub;
    next();
  } catch {
    response.status(401).json({ message: "Authentication required." });
  }
};