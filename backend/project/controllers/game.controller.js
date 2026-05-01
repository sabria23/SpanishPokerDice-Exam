import mongoose from "mongoose";
import { Game } from "../models/game.js";
import { GameVariant } from "../models/gameVariant.js";
import { User } from "../models/user.js";
import gameServices from "../services/game.services.js";

import {
    PAGE,
    LIMIT
} from "../config/constants.js";

// GET /api/games
// Public, returns a paginated, filterable list of non-anonymous games
export async function getAllGames(req, res) {
    try {
        const { page = PAGE, limit = LIMIT, status, variantId, sort = "createdAt", order = "desc", userId } = req.query;

        // Only show non-anonymous games in platform activity
        // Only provided values get added to the query
        const filter = { isAnonymous: false };
        if (status) filter.status = status;
        if (variantId) filter.variantId = new mongoose.Types.ObjectId(variantId);
        if (userId) filter.$or = [
            { "playerOne.userId": Number(userId) },
            { "playerTwo.userId": Number(userId) }
        ];

        // Ternary operator
        // asc = ascending order
        const sortOrder = order === "asc" ? 1 : -1;

        // Same logic for filtering, sorting and pagination as always
        const games = await Game.find(filter)
            .populate("variantId")
            .sort({ [sort]: sortOrder })
            .skip((page - 1) * limit)
            .limit(Number(limit));

        // Count all the documents in the collection
        const total = await Game.countDocuments(filter);

        // Enrich player data with ELO and username from User model
        const enrichedGames = await Promise.all(
            games.map(game => gameServices.enrichGameWithUserInfo(game.toObject()))
        );

        res.json({
            total,
            page: Number(page),
            totalPages: Math.ceil(total / limit),
            games: enrichedGames
        });
    } catch (err) {
        // Internal server error
        res.status(500).json({ msg: "Failed to get games", error: err.message });
    }
}

// GET /api/games/:id
// Public, returns a single game by gameId, anyone can spectate
export async function getGame(req, res) {
    try {
        const game = await Game.findOne({ gameId: Number(req.validData.id) })
            .populate("variantId");
        
        if (!game) {
            // Not found
            return res.status(404).json({ msg: "Game was not found" });
        }

        // Enrich player data with ELO from User model
        const g = game.toObject();
        await gameServices.enrichGameWithUserInfo(g);

        res.json(g);
    } catch(err) {
        // Internal server error
        res.status(500).json({ msg: "Failed to get game", error: err.message });
    }
}

// POST /api/games/matchmake
// All types of users enters the matchmaking queue
// Assigns to matchmakeAnonymous or matchmakeRegistered based on user type
export async function matchmakeGame(req, res) {
    try {
        const { variantId, waitingSince } = req.validData;

        if (!variantId) {
            // Bad request
            return res.status(400).json({ msg: "variantId is required" });
        }

        // Validate to see if the game variant exists
        const variant = await GameVariant.findById(variantId);
        if (!variant) {
            // Could probably be a 406 Not acceptable or 404 as well
            // Bad request
            return res.status(400).json({ msg: "Invalid game variant" });
        }

        // Checks if user is anonymous
        const isAnonymous = req.user.role === "anonymous";

        // Anonymous users can only be matched with other anonymous users
        if (isAnonymous) {
            const { matched, game } = await gameServices.matchmakeAnonymous(variantId);
            const msg = matched ? "Matched with anonymous opponent" : "Waiting for an anonymous opponent";

            // OK, else Created
            return res.status(matched ? 200 : 201).json({ msg, game });
        }

        // Registered user matchmaking, try to find a suitable ELO opponent
        const { matched, game } = await gameServices.matchmakeRegistered(
            req.user.userId,
            variantId,
            req.user.eloRating,
            waitingSince || new Date()
        );

        const msg = matched ? "Match found!" : "Waiting for a suitable opponent";
        // OK, else Created
        return res.status(matched ? 200 : 201).json({ msg, game });

    } catch (err) {
        // Internal server error
        res.status(500).json({ msg: "Could not matchmake, sorry", error: err.message });
    }
}

// POST /api/games/invite
// Registered users only, invites another user to a game directly
// Creates a game with status "invited" and stores the invitedUserId
export async function inviteToGame(req, res) {
    try {
        const { variantId, invitedUserId } = req.validData;

        // Check the variant exists
        const variant = await GameVariant.findById(variantId);
        if (!variant) {
            // Bad request
            return res.status(400).json({ msg: "Invalid game variant" });
        }

        // Check the invited user exists
        const invitedUser = await User.findOne({ userId: invitedUserId });
        if (!invitedUser) {
            // Not found
            return res.status(404).json({ msg: "Invited user was not found" });
        }

        // Can't invite yourself
        if (invitedUserId === req.user.userId) {
            // Bad request
            return res.status(400).json({ msg: "You can't invite yourself to a game" });
        }

        // Create the game with status "invited"
        const game = await gameServices.createGame({
            playerOne: { userId: req.user.userId, rounds: [], score: 0 },
            variantId,
            isAnonymous: false,
            status: "invited",
            invitedUserId
        });

        // Created
        res.status(201).json({ msg: `Invite sent to ${invitedUser.username}`, game });
    } catch (err) {
        // Internal server error
        res.status(500).json({ msg: "Failed to send invite", error: err.message });
    }
}

// POST /api/games/:id/accept
// Registered users only, accepts game invite
// Only the invited user can accept
export async function acceptInvite(req, res) {
    try {
        const game = await Game.findOne({ gameId: Number(req.validData.id) });

        if (!game) {
            // Not found
            return res.status(404).json({ msg: "Game was not found" });
        }

        // Only invited games can be accepted
        if (game.status !== "invited") {
            // Bad request
            return res.status(400).json({ msg: "This game is not an invite" });
        }

        // Only the invited user can accept
        if (game.invitedUserId !== req.user.userId) {
            // Forbidden
            return res.status(403).json({ msg: "You were not invited to this game" });
        }

        // Add playerTwo and start the game
        game.playerTwo = { userId: req.user.userId, rounds: [], score: 0 };
        game.status = "ongoing";
        game.startedAt = new Date();
        await game.save();

        res.json({ msg: "Invite accepted, game is starting!", game });
    } catch (err) {
        // Internal server error
        res.status(500).json({ msg: "Failed to accept invite", error: err.message });
    }
}

// POST /api/games/:id/decline
// Registered users only, declines game invite
// Only the invited user can decline
export async function declineInvite(req, res) {
    try {
        const game = await Game.findOne({ gameId: Number(req.validData.id) });

        if (!game) {
            // Not found
            return res.status(404).json({ msg: "Game was not found" });
        }

        // Only invited games can be declined
        if (game.status !== "invited") {
            // Bad request
            return res.status(400).json({ msg: "This game is not an invite" });
        }

        // Only the invited user can decline
        if (game.invitedUserId !== req.user.userId) {
            // Forbidden
            return res.status(403).json({ msg: "You were not invited to this game" });
        }

        // Set status to declined
        game.status = "declined";
        await game.save();

        res.json({ msg: "Invite declined" });
    } catch (err) {
        // Internal server error
        res.status(500).json({ msg: "Failed to decline invite", error: err.message });
    }
}

// PUT /api/games/:id/result
// Registered users only, submits the final result of a game and updates ELOs
export async function submitGameResult(req, res) {
    try {
        // Have to find a game
        const game = await Game.findOne({ gameId: Number(req.validData.id) });

        if (!game) {
            // Not found
            return res.status(404).json({ msg: "Game was not found" });
        }

        if (game.status === "finished") {
            // Bad request
            return res.status(400).json({ msg: "Can't change the results of a game after it's been finished" });
        }

        // Only players in the game can submit their results
        const isPlayerOne = game.playerOne.userId === req.user.userId; // Returns true or false
        const isPlayerTwo = game.playerTwo.userId === req.user.userId;
        if (!isPlayerOne && !isPlayerTwo) {
            // Forbidden
            return res.status(403).json({ msg: "You are not a player in this game" });
        }

        // The scores from the game get saved here
        const { playerOneScore, playerTwoScore } = req.validData;

        if (playerOneScore === undefined || playerTwoScore === undefined) {
            // Bad request
            return res.status(400).json({ msg: "The scores of each of the players are required" });
        }

        // Update scores and determine winner
        game.playerOne.score = playerOneScore;
        game.playerTwo.score = playerTwoScore;
        // Checks who has the highest score and is therefore the winner
        game.winnerId = gameServices.determineWinner(
            game.playerOne.userId, playerOneScore,
            game.playerTwo.userId, playerTwoScore
        );
        game.status = "finished";
        game.finishedAt = new Date();
        await game.save();

        // Update ELO ratings for both players (not for anonymous games)
        if (!game.isAnonymous) {
            await gameServices.updateELORatings(
                game.playerOne.userId,
                game.playerTwo.userId,
                playerOneScore,
                playerTwoScore,
                game._id
            );
        }

        res.json({ msg: "Game result submitted", game });

    } catch (err) {
        // Internal server error
        res.status(500).json({ msg: "Failed to submit game result", error: err.message });
    }
}

export default {
    getAllGames,
    getGame,
    matchmakeGame,
    inviteToGame,
    acceptInvite,
    declineInvite,
    submitGameResult
};