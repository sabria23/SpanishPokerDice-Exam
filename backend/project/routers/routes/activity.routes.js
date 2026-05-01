import express from "express";
import activityController from "../../controllers/activity.controller.js";

const activityRouter = express.Router();

/* Public */
// GET /api/activity
activityRouter.get("/", activityController.getActivity);

export default activityRouter;