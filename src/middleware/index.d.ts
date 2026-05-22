import type { JwtPayload } from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload; // You can replace 'any' with a more specific type if you have one
    }
  }
}
