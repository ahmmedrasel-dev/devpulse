import type { Request, Response } from "express";
import { sendResponse } from "../../utils/sendResponse";
import { authService } from "./auth.service";

export const signup = async (req: Request, res: Response) => {
  try {
    const user = await authService.signup(req.body);

    return sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "User registered successfully",
      data: user,
    });
  } catch (error: any) {
    return sendResponse(res, {
      statusCode: 500,
      success: false,
      message: "An error occurred during signup",
      error: error.message,
    });
  }
};
