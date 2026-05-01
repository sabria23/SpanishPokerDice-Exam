import express from "express";
import { identifyUser, requireUser } from "../../middleware/auth.js";
import { matchmakeLimiter } from "../../middleware/ratelimiter.js";
import gameValidator from "../../validators/game.validator.js";
import gameController from "../../controllers/game.controller.js";
import validate from "../../middleware/validate.js";

const gameRouter = express.Router();

gameRouter.use(identifyUser);

/* Public */
// GET /api/games/:id   Anyone can view a specific game
gameRouter.get("/:id", gameValidator.validateGameId(), validate, gameController.getGame);
// GET /api/games   Anyone can view all the games
gameRouter.get("/", gameValidator.validateGetGames(), validate, gameController.getAllGames);

// POST /api/games/matchmake
// Enter the matchmaking queue to either join existing games or create new games
gameRouter.post("/matchmake", matchmakeLimiter, gameValidator.validateMatchmake(), validate, gameController.matchmakeGame);


/* Registered users only */
// PUT /api/games/:id/result
gameRouter.put("/:id/result", 
    requireUser,  
    gameValidator.validateGameId(), 
    validate, 
    gameValidator.validateSubmitGameResult(),
    validate,
    gameController.submitGameResult
);

// POST /api/games/invite
gameRouter.post("/invite", requireUser, gameValidator.validateInvite(), validate, gameController.inviteToGame);
// POST /api/games/:id/accept
gameRouter.post("/:id/accept", requireUser, gameValidator.validateGameId(), validate, gameController.acceptInvite);
// POST /api/games/:id/decline
gameRouter.post("/:id/decline", requireUser, gameValidator.validateGameId(), validate, gameController.declineInvite);

export default gameRouter;