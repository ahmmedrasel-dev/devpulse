import { Router } from "express";
import { authorize } from "../../middleware/auth";
import * as issueController from "./issue.controller";

const router = Router();

router.post(
  "/",
  authorize("contributor", "maintainer"),
  issueController.createIssue,
);

router.get(
  "/",
  issueController.getIssues,
);

router.get(
  "/:id",
  issueController.getIssueById,
);

router.patch(
  "/:id",
  authorize("contributor", "maintainer"),
  issueController.updateIssue,
);

export const issueRoutes: Router = router;
