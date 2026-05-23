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

const getIssues = async (filters: {
  sort?: string;
  type?: string;
  status?: string;
}) => {
  const { sort = "newest", type, status } = filters;

  // Base query to select all issues
  let queryText = "SELECT id, title, description, type, status, reporter_id, created_at, updated_at FROM issues";
  const queryParams: any[] = [];
  const whereClauses: string[] = [];

  // Filter by Type (bug / feature_request)
  if (type === "bug" || type === "feature_request") {
    queryParams.push(type);
    whereClauses.push(`type = $${queryParams.length}`);
  }

  // Filter by Status (open / in_progress / resolved)
  if (status === "open" || status === "in_progress" || status === "resolved") {
    queryParams.push(status);
    whereClauses.push(`status = $${queryParams.length}`);
  }

  // If we have filters, append "WHERE ... AND ..."
  if (whereClauses.length > 0) {
    queryText += ` WHERE ${whereClauses.join(" AND ")}`;
  }

  // Sort: default is newest (DESC), otherwise oldest (ASC)
  const sortDirection = sort === "oldest" ? "ASC" : "DESC";
  queryText += ` ORDER BY created_at ${sortDirection}`;

  // Execute issues query
  const issuesResult = await pool.query(queryText, queryParams);
  const issues = issuesResult.rows;

  // If no issues found, return empty array immediately
  if (issues.length === 0) {
    return [];
  }


  // Extract all unique reporter IDs from the fetched issues
  const reporterIds = Array.from(
    new Set(issues.map((issue) => issue.reporter_id).filter(Boolean))
  );

  // Map to hold reporter details: { [userId]: { id, name, role } }
  const reporterMap: Record<number, { id: number; name: string; role: string }> = {};

  if (reporterIds.length > 0) {
    // Generate parameterized placeholders ($1, $2, etc.) for SQL IN clause
    const placeholders = reporterIds.map((_, index) => `$${index + 1}`).join(", ");

    // Query users database for the reporters
    const usersResult = await pool.query(
      `SELECT id, name, role FROM users WHERE id IN (${placeholders})`,
      reporterIds
    );

    // Store user data in lookup map
    usersResult.rows.forEach((user) => {
      reporterMap[user.id] = {
        id: user.id,
        name: user.name,
        role: user.role,
      };
    });
  }

  return issues.map((issue) => ({
    id: issue.id,
    title: issue.title,
    description: issue.description,
    type: issue.type,
    status: issue.status,
    reporter: reporterMap[issue.reporter_id] || null,
    created_at: issue.created_at,
    updated_at: issue.updated_at,
  }));
};

const getIssueById = async (id: number) => {
  // Fetch issue details by ID
  const issueResult = await pool.query(
    "SELECT id, title, description, type, status, reporter_id, created_at, updated_at FROM issues WHERE id = $1",
    [id]
  );
  
  const issue = issueResult.rows[0];
  if (!issue) {
    return null;
  }

  // Fetch reporter details separately (No JOINs)
  let reporter = null;
  if (issue.reporter_id) {
    const userResult = await pool.query(
      "SELECT id, name, role FROM users WHERE id = $1",
      [issue.reporter_id]
    );
    reporter = userResult.rows[0] || null;
  }

  return {
    id: issue.id,
    title: issue.title,
    description: issue.description,
    type: issue.type,
    status: issue.status,
    reporter,
    created_at: issue.created_at,
    updated_at: issue.updated_at,
  };
};

export const issueService = {
  createIssue,
  getIssues,
  getIssueById,
};
