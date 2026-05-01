import { GameVariant } from "../models/gameVariant.js";

// GET /api/variants
// (one example, 5 rounds, straigths allowed): GET /api/variants?rounds=5&straightsAllowed=true
// Public, returns all 18 game variants
export async function getAllVariants(req, res) {
    try {
        const { rounds, straightsAllowed, timeControl } = req.query;

        // Filter to get the exact game variant you want
        const filter = {};
        // Adding variants to the filter
        if (rounds) filter.rounds = Number(rounds);
        if (straightsAllowed !== undefined) filter.straightsAllowed = straightsAllowed === "true";
        if (timeControl) filter.timeControl = Number(timeControl);

        const variants = await GameVariant.find(filter);
        res.json(variants);
    } catch (err) {
        // Internal server error
        res.status(500).json({ msg: "Failed to get the game variants", error: err.message });
    }
}

export default {
    getAllVariants
};