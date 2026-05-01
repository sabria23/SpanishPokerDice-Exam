import { getLeaderboardStats } from "../services/leaderboard.services.js";

import {
    PAGE,
    LIMIT
} from "../config/constants.js";

// GET /api/leaderboard 
// Public, returns a ranked list of users 
// Supports sorting by: ELO (default), wins, winPercentage, totalGames
// Supports filtering by variantId
export async function getLeaderBoard(req, res) {
    try {
        const { sort = "elo", page = PAGE, limit = LIMIT, variantId } = req.query;

        // Fetch stats for all users using the aggregation pipeline
        const leaderboard = await getLeaderboardStats(variantId);

        // Sort the leaderboard based on the requested category
        const sorted = leaderboard.sort((a, b) => {
            switch (sort) {
                case "wins":
                    return b.wins - a.wins;
                case "winPercentage":
                    return b.winPercentage - a.winPercentage;
                case "totalGames":
                    return b.totalGames - a.totalGames;
                case "elo":
                default:
                    return b.eloRating - a.eloRating;
            }
        });

        // Apply pagination after sorting
        const start = (page - 1) * limit;
        const paginated = sorted.slice(start, start + Number(limit));

        res.json({
            total: sorted.length,
            page: Number(page),
            totalPages: Math.ceil(sorted.length / limit),
            sort,
            leaderboard: paginated
        });
    } catch(err) {
        // Internal server error
        res.status(500).json({ msg: "Failed to get leaderboard", error: err.message });
    }
}

export default {
    getLeaderBoard
};