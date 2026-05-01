import { body, param, query } from "express-validator";

import { MIN_ID } from "../config/constants.js";

// Validates the gameId route parameter
// Used in getGame and submitGameResult
export function validateGameId() {
    return [
        param("id")
            .isInt({ min: MIN_ID, max: Number.MAX_SAFE_INTEGER })
            .withMessage("Game ID must be a valid integer")
            .bail() // stop checking if the above fails
            .toInt() // Convert to integer for all following checks
    ];
}

// GET /api/games?status=ongoing&variantId=123&sort=createdAt&order=desc&page=1&limit=20
// The limit for the pagination can be changed
export function validateGetGames() {
    return [
        query("page")
            .optional()
            .isInt({ min: 1 })
            .withMessage("page must be a positive integer")
            .toInt(),
        query("limit")
            .optional()
            .isInt({ min: 1, max: 100 })
            .withMessage("limit must be between 1 and 100")
            .toInt(),
        // any other filters specific to that resource
        query("status")
            .optional()
            .isIn(["waiting", "ongoing", "finished"])
            .withMessage("status must be waiting, ongoing or finished")
    ];
}

// POST /api/games/matchmake
// Validates the request body for matchmaking
export function validateMatchmake() {
    return [
        body("variantId")
            .notEmpty()
            .withMessage("variantId is required")
            .bail()
            .isMongoId()
            .withMessage("variantId must be a valid MongoDB ID"),
    
        // waitingSince is optional, only sent when polling for a match
        body("waitingSince")
            .optional()
            .isISO8601() // International standard for formatting dates and times
            .withMessage("waitingSince must be a valid date")
            .toDate() // Convert to a Date object
    
    ];
}

export function validateInvite() {
    return [
        body("variantId")
            .notEmpty()
            .withMessage("variantId is required")
            .bail()
            .isMongoId()
            .withMessage("variantId must be a valid MongoDB ID"),

        body("invitedUserId")
            .notEmpty()
            .withMessage("invitedUserId is required")
            .bail()
            .isInt({ min: 0 })
            .withMessage("invitedUserId must be a valid integer")
            .toInt()
    ];
}

// PUT /api/games/:id/result
// Validates the request body for submitting a game result
export function validateSubmitGameResult() {
    return [
        body("playerOneScore")
            .notEmpty()
            .withMessage("playerOneScore is required")
            .bail()
            .isInt({ min: 0 })
            .withMessage("playerOneScore can't be a negative integer")
            .toInt(),

        body("playerTwoScore")
            .notEmpty()
            .withMessage("playerTwoScore is required")
            .bail()
            .isInt({ min: 0 })
            .withMessage("playerTwoScore can't be a negative integer")
            .toInt()
    ];
}

export default {
    validateGameId,
    validateGetGames,
    validateMatchmake,
    validateInvite,
    validateSubmitGameResult
};