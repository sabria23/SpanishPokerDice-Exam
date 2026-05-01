import express from "express";
import userRoutes from "./routes/user.routes.js";
import gameRoutes from "./routes/game.routes.js";
import gameVariantRoutes from "./routes/gameVariant.routes.js";
import tournamentRoutes from "./routes/tournament.routes.js";
import commentRoutes from "./routes/comment.routes.js"; 
import leaderboardRoutes from "./routes/leaderboard.routes.js";
import activityRoutes from "./routes/activity.routes.js";

const apiRouter = express.Router();

apiRouter.use(express.json());

apiRouter.use("/users", userRoutes);
apiRouter.use("/games", gameRoutes);
apiRouter.use("/variants", gameVariantRoutes);
apiRouter.use("/tournaments", tournamentRoutes);
apiRouter.use("/comments", commentRoutes);
apiRouter.use("/leaderboard", leaderboardRoutes);
apiRouter.use("/activity", activityRoutes);

export default apiRouter;