import express from "express";
import { identifyUser, requireUser, requireAdmin } from "../../middleware/auth.js";
import validate from "../../middleware/validate.js";
import uploadMiddleware from "../../middleware/uploads.js";
import tournamentController from "../../controllers/tournament.controller.js";
import tournamentValidator from "../../validators/tournament.validator.js";

const tournamentRouter = express.Router();

tournamentRouter.use(identifyUser);

/* Public - anyone can view tournaments */
// GET /api/tournaments
tournamentRouter.get("/", tournamentValidator.validateGetTournaments(), validate, tournamentController.getAllTournaments);
// GET /api/tournaments/:id
tournamentRouter.get("/:id", tournamentValidator.validateTournamentId(), validate, tournamentController.getTournament);
// GET /api/tournaments/:id/standings
tournamentRouter.get("/:id/standings", tournamentValidator.validateTournamentId(), validate, tournamentController.getTournamentStandings);

/* Registered users only */
// POST /api/tournaments/:id/join
tournamentRouter.post("/:id/join", requireUser, tournamentValidator.validateTournamentId(), validate, tournamentController.joinTournament);

/* Admin only */
// POST /api/tournaments
tournamentRouter.post("/", 
    requireAdmin, 
    uploadMiddleware.upload.single("trophyImage"), 
    tournamentValidator.validateCreateTournament(), 
    validate,
    tournamentController.createTournament
);
// PUT /api/tournaments/:id
tournamentRouter.put("/:id", 
    requireAdmin, 
    tournamentValidator.validateTournamentId(),
    validate,
    tournamentValidator.validateUpdateTournament(),
    validate,
    tournamentController.updateTournament
);

export default tournamentRouter;