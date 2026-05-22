import bcrypt from "bcrypt";
import { pool } from "../../db/db";
import type { IUser } from "./auth.interface";

export const signup = async (userData: IUser) => {
  const { name, email, password, role } = userData;

  // Basic validation
  if (!name || !email || !password) {
    throw new Error("Name, email, and password are required");
  }

  const userRole = role || "contributor";
  if (userRole !== "contributor" && userRole !== "maintainer") {
    throw new Error("Invalid role specified");
  }
  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Insert into DB using raw SQL
  try {
    const result = await pool.query(
      `INSERT INTO users (name, email, password, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, role, created_at, updated_at`,
      [name, email, hashedPassword, userRole],
    );

    return result.rows[0];
  } catch (error: any) {
    throw error;
  }
};

export const authService = {
  signup,
};
