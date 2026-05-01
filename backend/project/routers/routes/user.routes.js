import express from "express";
import { identifyUser, requireUser, requireAdmin } from "../../middleware/auth.js";
import validate from "../../middleware/validate.js";
import { authLimiter } from "../../middleware/ratelimiter.js";
import userController from "../../controllers/user.controller.js";
import userValidator from "../../validators/user.validator.js";
import uploadMiddleware from "../../middleware/uploads.js";

const userRouter = express.Router();

// Apply identifyUser authentication to all routes in this file
userRouter.use(identifyUser);

/* Public */
// /api/users/register
userRouter.post("/register", authLimiter, userValidator.validateRegisterUser(), validate, userController.registerUser);
// /api/users/login
userRouter.post("/login", authLimiter, userValidator.validateLoginUser(), validate, userController.loginUser);

/* Registered users */
// /api/users/:id
userRouter.get("/:id", requireUser, userValidator.validateUserId(), validate, userController.getUser);
userRouter.put("/:id", 
    requireUser, 
    userValidator.validateUserId(), 
    validate, 
    userValidator.validateUpdateUser(), 
    validate, 
    userController.updateUser
);
// /api/users/:id/avatar
userRouter.put("/:id/avatar", requireUser, uploadMiddleware.uploadAvatar.single("avatar"), userController.uploadAvatar);

/* Admin users */
// /api/users
userRouter.get("/", requireAdmin, userValidator.validateGetUsers(), validate, userController.getAllUsers);
// /api/users/:id/ban
userRouter.put("/:id/ban", requireAdmin, userValidator.validateUserId(), validate, userController.banUser);

export default userRouter;