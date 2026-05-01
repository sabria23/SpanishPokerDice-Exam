import { User } from "../models/user.js";
import { Game } from "../models/game.js";

import {
    ELO_K_FACTOR,
    ELO_INITIAL_RANGE,
    ELO_RANGE_INCREMENT,
    MATCHMAKING_INTERVAL_MS,
    RECENT_GAMES
} from "../config/constants.js";

/* ELO calculation helper */
// Calculates the new ELO rating for a player after a game
// Based on the standard ELO formula used in chess
// Formula reference: https://en.wikipedia.org/wiki/Elo_rating_system#Mathematical_details 
// actualScore: 1 for win, 0 for loss, 0.5 for draw
export function calculateNewELO(playerElo, opponentElo, actualScore) {
    // Expected score based on the difference in ELO ratings
    const expected = 1 / (1 + Math.pow(10, (opponentElo - playerElo) / 400));

    return Math.round(playerElo + ELO_K_FACTOR * (actualScore - expected));
}

/* Winner determination helper */
// Returns the userId of the winner, or null for a draw
export function determineWinner(playerOneId, playerOneScore, playerTwoId, playerTwoScore) {
    if (playerOneScore > playerTwoScore) return playerOneId;
    if (playerTwoScore > playerOneScore) return playerTwoId;
    return null; // Draw
}

/* Recent games update helper */
// Adds a game to a player's recentGames and keeps only the latest entries
export async function updateRecentGames(player, gameId) {
    player.recentGames.unshift(gameId);
    player.recentGames = player.recentGames.slice(0, RECENT_GAMES);

    await User.updateOne(
        { userId: player.userId },
        { recentGames: player.recentGames, eloRating: player.eloRating }
    );
}

/* ELO update helper */
// Fetches both players and updates their ELO ratings after a game
export async function updateELORatings(playerOneId, playerTwoId, playerOneScore, playerTwoScore, gameId) {
    const playerOne = await User.findOne({ userId: playerOneId });
    const playerTwo = await User.findOne({ userId: playerTwoId });

    if (!playerOne || !playerTwo) return;

    // actualScore: 1 = win, 0 = loss, 0.5 = draw
    const p1Score = playerOneScore > playerTwoScore ? 1 : playerOneScore === playerTwoScore ? 0.5 : 0;
    const p2Score = 1 - p1Score;

    playerOne.eloRating = calculateNewELO(playerOne.eloRating, playerTwo.eloRating, p1Score);
    playerTwo.eloRating = calculateNewELO(playerTwo.eloRating, playerOne.eloRating, p2Score);

    // Update recent games for both players
    await updateRecentGames(playerOne, gameId);
    await updateRecentGames(playerTwo, gameId);
}

/* Create game helper */
// Helps create a game
export async function createGame({ playerOne, variantId, isAnonymous, status = "waiting", invitedUserId = null }) {

    // For all kinds of games
    const newGame = new Game({
        playerOne,
        variantId,
        isAnonymous,
        status,
        invitedUserId
    });
    await newGame.save();
    return newGame;
}

/* Anonymous matchmaking helper */
// Tries to find a waiting anonymous game, otherwise creates one
export async function matchmakeAnonymous(variantId) {
    const waitingGame = await Game.findOne({
        status: "waiting",
        isAnonymous: true,
        variantId
    });

    if (waitingGame) {
        // Join the existing anonymous game as playerTwo
        waitingGame.playerTwo = { userId: null, rounds: [], score: 0 };
        waitingGame.status = "ongoing";
        waitingGame.startedAt = new Date();
        await waitingGame.save();
        return { matched: true, game: waitingGame };
    }

    // No match found, create a new waiting anonymous game
    const newGame = await createGame({
        playerOne: { userId: null, rounds: [], score: 0 },
        variantId,
        isAnonymous: true
    });
    return { matched: false, game: newGame };
}

/* Registered user matchmaking helper */
// Tries to find a waiting game within ELO range, otherwise it creates one
// The longer a player waits, the more relaxed the ELO requirement becomes
export async function matchmakeRegistered(userId, variantId, eloRating, waitingSince) {
        const waitingMs = Date.now() - new Date(waitingSince).getTime();
    const intervals = Math.floor(waitingMs / MATCHMAKING_INTERVAL_MS);
    const eloRange = ELO_INITIAL_RANGE + intervals * ELO_RANGE_INCREMENT;

    // Find an opponent whose ELO is within the current range
    const opponent = await User.findOne({
        userId: { $ne: userId }, // Not equal, https://www.mongodb.com/docs/manual/reference/operator/query/ne/
        eloRating: {
            $gte: eloRating - eloRange, // Greater than or equal, https://www.mongodb.com/docs/manual/reference/operator/aggregation/gte/
            $lte: eloRating + eloRange // Less than or equal, https://www.mongodb.com/docs/manual/reference/operator/query/lte/ 
        }
    });

    if (opponent) {
        // Check if this opponent has a waiting game with the same variant
        const waitingGame = await Game.findOne({
            "playerOne.userId": opponent.userId,
            variantId,
            status: "waiting",
            isAnonymous: false
        });

        if (waitingGame) {
            waitingGame.playerTwo = { userId, rounds: [], score: 0 };
            waitingGame.status = "ongoing";
            waitingGame.startedAt = new Date();
            await waitingGame.save();
            return { matched: true, game: waitingGame };
        }
    }

    // No match found, create a new waiting game
    const newGame = await createGame({
        playerOne: { userId, rounds: [], score: 0 },
        variantId,
        isAnonymous: false
    });
    return { matched: false, game: newGame };
}

/* ELO enrichment helper */
// Enriches a plain game object with ELO ratings and username from the User model
// Used when returning games from the API so the frontend can display ELO and username
export async function enrichGameWithUserInfo(game) {
    if (game.playerOne?.userId) {
        const p1 = await User.findOne({ userId: game.playerOne.userId }).select("eloRating username");
        if (p1) {
            game.playerOne.eloRating = p1.eloRating;
            game.playerOne.username = p1.username;
        }
    }

    if (game.playerTwo?.userId) {
        const p2 = await User.findOne({ userId: game.playerTwo.userId }).select("eloRating username");
        if (p2) {
            game.playerTwo.eloRating = p2.eloRating;
            game.playerTwo.username = p2.username;
        }
    }

    return game;
}

export default {
    calculateNewELO,
    determineWinner,
    updateRecentGames,
    updateELORatings,
    createGame,
    matchmakeAnonymous,
    matchmakeRegistered,
    enrichGameWithUserInfo
};