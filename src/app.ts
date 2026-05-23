import cors from "cors";
import express, { type Application } from "express";
import globalErrorHandler from "./middleware/globalErrorHandeler";
import { authRoutes } from "./modules/auth/auth.route";
import { issueRoutes } from "./modules/issues/issue.route";

const app: Application = express();

// Middlewares
app.use(cors({ origin: ["http://localhost:3000", "https://devpulse-chi-ten.vercel.app"] }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.text());

app.use("/api/auth", authRoutes);
app.use("/api/issues", issueRoutes);

// Global Error Handler Middleware
app.use(globalErrorHandler);


export default app;
