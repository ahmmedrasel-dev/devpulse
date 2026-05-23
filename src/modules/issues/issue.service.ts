import { pool } from "../../db/db";
import type { IIssue, IssueType } from "./issue.interface";

type TCreateIssueInput = Pick<IIssue, "title" | "description" | "type">;

const normalizeIssueType = (type: string): IssueType => {
  const normalized = type.trim().toLowerCase();
  if (normalized === "feature" || normalized === "feature request") {
    return "feature_request";
  }
  if (normalized === "feature_request") {
    return "feature_request";
  }
  return "bug";
};

const createIssue = async (
  issueData: TCreateIssueInput,
  reporterId: number,
) => {
  const { title, description, type } = issueData;

  if (!title || !description || !type) {
    throw new Error("Title, description, and type are required");
  }

  const issueType = normalizeIssueType(type);
  if (issueType !== "bug" && issueType !== "feature_request") {
    throw new Error("Invalid issue type");
  }

  const result = await pool.query(
    `INSERT INTO issues (title, description, type, reporter_id)
     VALUES ($1, $2, $3, $4)
     RETURNING id, title, description, type, status, reporter_id, created_at, updated_at`,
    [title, description, issueType, reporterId],
  );

  return result.rows[0];
};

export const issueService = {
  createIssue,
};
