import { Game } from "../models/game.js";
import { User } from "../models/user.js";

// GET /api/activity
// Public, returns a snapshot of current platform activity
export async function getActivity(req, res) {
    try {
        // Number of ongoing games (non-anonymous only)
        const ongoingGames = await Game.countDocuments({
            status: "ongoing",
            isAnonymous: false
        });

        // Number of active users this week, 
        // user is considered active if they have played a game in the last 7 days
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        // Finds active users by searching through when someone was last active
        const activeUsersThisWeek = await User.countDocuments({
            updatedAt: { $gte: oneWeekAgo }, // Greater than or equal to, https://www.mongodb.com/docs/manual/reference/operator/aggregation/gte/
            role: { $ne: "anonymous" } // Not equal to, https://www.mongodb.com/docs/manual/reference/operator/query/ne/ 
        });

        // Last 10 finished games on the platform (non-anonymous users only)
        const lastGames = await Game.find({ status: "finished", isAnonymous: false })
            .populate("variantId")
            .sort({ finishedAt: -1 }) // Most recently finished first
            .limit(10);

        res.json({
            ongoingGames,
            activeUsersThisWeek,
            lastGames
        });
    } catch (err) {
        // Internal server error
        res.status(500).json({ msg: "Failed to get platform activity", error: err.message });
    }
}

export default {
    getActivity
};