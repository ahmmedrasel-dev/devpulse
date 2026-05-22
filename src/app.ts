import express, { type Application } from "express";
import { authRoutes } from "./modules/auth/auth.route";

const app: Application = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.text());

app.use("/api/auth", authRoutes);

export default app;
