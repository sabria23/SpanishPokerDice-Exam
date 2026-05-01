import express from "express";
import { identifyUser, requireUser, requireAdmin } from "../../middleware/auth.js";
import validate from "../../middleware/validate.js";
import commentController from "../../controllers/comment.controller.js";
import commentValidator from "../../validators/comment.validator.js";

const commentRouter = express.Router();

commentRouter.use(identifyUser);

/* Public */
// GET /api/comments    Anyone can view comments
commentRouter.get("/", commentValidator.validateGetComments(), validate, commentController.getComments);

/* Registered users only */
// POST /api/comments
commentRouter.post("/", requireUser, commentValidator.validateCreateComment(), validate, commentController.createComment);

/* Admin only */
// DELETE /api/comments/:id    Soft deletes by setting isDeleted to true
commentRouter.delete("/:id", requireAdmin, commentValidator.validateCommentId(), validate, commentController.deleteComment);

export default commentRouter;