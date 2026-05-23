import type { Request, Response } from "express";
import { sendResponse } from "../../utils/sendResponse";
import { issueService } from "./issue.service";

export const createIssue = async (req: Request, res: Response) => {
  try {
    const { title, description, type } = req.body;
    const reporterId = req.user?.id;

    if (!reporterId) {
      return sendResponse(res, {
        statusCode: 401,
        success: false,
        message: "Unauthorized Access",
      });
    }

    const issue = await issueService.createIssue(
      { title, description, type },
      reporterId,
    );

    return sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Issue created successfully",
      data: issue,
    });
  } catch (error: any) {
    return sendResponse(res, {
      statusCode: 500,
      success: false,
      message: "An error occurred while creating issue",
      error: error.message,
    });
  }
};

export const getIssues = async (req: Request, res: Response) => {
  try {
    const { sort, type, status } = req.query;

    const issues = await issueService.getIssues({
      sort: sort as string,
      type: type as string,
      status: status as string,
    });

    return sendResponse(res, {
      statusCode: 200,
      success: true,
      data: issues,
    });
  } catch (error: any) {
    return sendResponse(res, {
      statusCode: 500,
      success: false,
      message: "An error occurred while retrieving issues",
      error: error.message,
    });
  }
};
