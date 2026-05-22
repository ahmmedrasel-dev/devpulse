import { type NextFunction, type Request, type Response } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import config from "../config";
import { pool } from "../db/db";
import type { UserRole } from "../modules/auth/auth.interface";
import { sendResponse } from "../utils/sendResponse";

export const authorize = (...roles: UserRole[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.headers.authorization;

      if (!token) {
        return sendResponse(res, {
          statusCode: 401,
          success: false,
          message: "Unauthorized Access",
        });
      }
      const decodedToken = jwt.verify(
        token as string,
        config.jwtSecret as string,
      ) as JwtPayload;
      ``;
      const userDate = await pool.query(
        `
            SELECT * FROM users WHERE email=$1
        `,
        [decodedToken.email],
      );

      const user = userDate.rows[0];
      if (!user) {
        return sendResponse(res, {
          statusCode: 404,
          success: false,
          message: "Unauthorized Access",
        });
      }

      if (roles.length && !roles.includes(user.role)) {
        return sendResponse(res, {
          statusCode: 403,
          success: false,
          message: "Unauthorized Access",
        });
      }
      req.user = user;

      next();
    } catch (error) {
      next(error);
    }
  };
};
