import express from "express";
import gameVariantController from "../../controllers/gameVariant.controller.js";

const gameVariantRouter = express.Router();

/* Public */
// GET /api/variants    Returns all 18 game variants
gameVariantRouter.get("/", gameVariantController.getAllVariants);

export default gameVariantRouter;
