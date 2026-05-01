import mongoose from "mongoose";
import { Game } from "../models/game.js";

// Aggregation pipeline for leaderboard stats
// Using MongoDB aggregation instead of JavaScript filtering for better performance
// Aggregation pipeline reference: https://www.mongodb.com/docs/manual/core/aggregation-pipeline/

/**
 * Builds and runs an aggregation pipeline to calculate leaderboard stats
 * for all registered, non-banned users
 * Inspired by the one we made inclass, IDG2100 Fullstack 2026
 * 
 * The pipeline:
 * a) Only looks at finished, non-anonymous games
 * b) Optionally filters by game variant
 * c) Groups stats per userId (wins, draws, total games)
 * d) Joins with the users collection to get full user info
 * e) Hides sensitive fields (pwd, _id)
 * f) Calculates win percentage and ELO change
 * 
 * @param {string|null} variantId - Optional MongoDB ID to filter by game variant
 * @returns {Array} Array of leaderboard entries with user stats
 */

export async function getLeaderboardStats(variantId = null) {
    // Stage 1
    // a) Only look at finished, non-anonymous games
    // b) Optionally filter by variant
    const matchStage = {
        $match: {
            status: "finished",
            isAnonymous: false,
            // If variantId is provided, filter by it
            ...(variantId && { variantId: new mongoose.Types.ObjectId(variantId) })
        }
    };

    // Stage 2
    // Need one record per player per game 
    // b) One record per player per game
    // c) Groups stats per userId (wins, draws, total games)
    const projectStage = {
        $project: {
            players: [
                {
                    userId: "$playerOne.userId",
                    // 1 if playerOne won, 0.5 if draw, 0 if loss
                    won: { $cond: [{ $eq: ["$winnerId", "$playerOne.userId"] }, 1, 0] },
                    draw: { $cond: [{ $eq: ["$winnerId", null] }, 1, 0] }
                },
                {
                    userId: "$playerTwo.userId",
                    won: { $cond: [{ $eq: ["$winnerId", "$playerTwo.userId"] }, 1, 0] },
                    draw: { $cond: [{ $eq: ["$winnerId", null] }, 1, 0] }
                }
            ]
        }
    };
    
    // Stage 3
    // Flatten the players array so each player gets their own document
    // Reference: https://www.mongodb.com/docs/manual/reference/operator/aggregation/unwind/
    const unwindStage = {
        $unwind: { path: "$players" }
    };

    // Stage 4 
    // Filter out null userIds, AKA anonymous players
    const filterNullStage = {
        $match: { "players.userId": { $ne: null} }
    };

    // Stage 5
    // Group by userId and calculate stats
    // Reference: https://www.mongodb.com/docs/manual/reference/operator/aggregation/group/
    const groupStage = {
        $group: {
            _id: "$players.userId",
            totalGames: { $sum: 1 },
            wins: { $sum: "$players.won" },
            draws: { $sum: "$players.draw" }
        }
    };

    // Stage 6
    // f) Calculates win percentage and losses
    const addFieldStage= {
        $addFields: {
            losses: { $subtract: ["$totalGames", { $add: ["$wins", "$draws"] }] },
            // Round to nearest integer
            winPercentage: {
                $cond: [
                    { $gt: ["$totalGames", 0] }, // is totalGames greater than 0
                    { $round: [{ $multiply: [{ $divide: ["$wins", "$totalGames"] }, 100] }, 0] }, // Calculate win percentage
                    0 // Return 0 if the player has no games
                ]
            }
        }
    };

    // Stage 7 
    // d) Joins with the users collection to get full user info
    // Reference: https://www.mongodb.com/docs/manual/reference/operator/aggregation/lookup/
    const lookupStage = {
        $lookup: {
            from: "users",
            localField: "_id", // userId from the grouped stats
            foreignField: "userId", // Matches userId in the users collection
            as: "user" // result stored in the "user" array
        }
    };

    // Stage 8
    // Flatten the user array into a single object
    const unwindUserStage = {
        $unwind: { path: "$user" }
    };

    // Stage 9
    // Filter out banned and anonymous users
    const filterUsersStage = {
        $match: {
            "user.isBanned": false,
            "user.role": { $ne: "anonymous" }
        }
    };

    // Stage 10 
    // Reshape the final output
    // e) Hides sensitive fields (pwd, _id)
    // f) Adds ELO change this week
    const finalProjectStage = {
        $project: {
            _id: 0, // exclude MongoDB's _id
            userId: "$_id",
            username: "$user.username",
            eloRating: "$user.eloRating",
            // Calculate ELO change this week from the user's stored values
            eloChangeThisWeek: { $subtract: ["$user.eloRating", "$user.eloRatingLastWeek"] },
            totalGames: 1,
            wins: 1,
            losses: 1,
            draws: 1,
            winPercentage: 1
        }
    };

    return await Game.aggregate([
        matchStage,
        projectStage,
        unwindStage,
        filterNullStage,
        groupStage,
        addFieldStage,
        lookupStage,
        unwindUserStage,
        filterUsersStage,
        finalProjectStage
    ]);
}

export default { 
    getLeaderboardStats
};