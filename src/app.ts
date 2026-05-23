import express, { type Application } from "express";
import { authRoutes } from "./modules/auth/auth.route";
import { issueRoutes } from "./modules/issues/issue.route";

const app: Application = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.text());

app.use("/api/auth", authRoutes);
app.use("/api/issues", issueRoutes);

export default app;
