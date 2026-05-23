import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import config from "../../config";
import { pool } from "../../db/db";
import type { IUser, JWTPayload } from "./auth.interface";

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

const login = async (email: string, password: string) => {
  if (!email || !password) {
    throw new Error("Email and password are required");
  }

  try {
    const result = await pool.query(`SELECT * FROM users WHERE email = $1`, [
      email,
    ]);

    const user = result.rows[0];
    if (!user) {
      throw new Error("Invalid email or password");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error("Invalid email or password");
    }

    const payload: JWTPayload = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      created_at: user.created_at,
      updated_at: user.updated_at,
    };

    // Generate JWT token
    const token = jwt.sign(payload, config.jwtSecret as string, {
      expiresIn: "1h",
    });

    return { token, user: payload };
  } catch (error: any) {
    throw error;
  }
};

export const authService = {
  signup,
  login,
};
