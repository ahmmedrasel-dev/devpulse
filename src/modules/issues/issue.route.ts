import { Router } from "express";
import { authorize } from "../../middleware/auth";
import * as issueController from "./issue.controller";

const router = Router();

router.post(
  "/",
  authorize("contributor", "maintainer"),
  issueController.createIssue,
);

export const issueRoutes: Router = router;
