import { body, param, query } from "express-validator";

import { MIN_COMMENT_LENGTH, MAX_COMMENT_LENGTH } from "../config/constants.js";

// Valid target types for comments 
const VALID_TARGET_TYPES = [ "game", "tournament"];

// Validates the commentId route parameter
// Used in deleteComment
export function validateCommentId() {
    return [
        param("id")
            .isMongoId()
            .withMessage("Comment ID must be a valid MongoDB ID")
    ];
}

// GET /api/comments?targetId=123&targetType=game
// Validates the query parameters for getting comments
export function validateGetComments() {
    return [
        query("targetId")
            .notEmpty()
            .withMessage("targetId is required"),
        
        query("targetType")
            .notEmpty()
            .withMessage("targetType is required")
            .bail()
            .isIn(VALID_TARGET_TYPES)
            .withMessage("targetType must be either 'game' or 'tournament'"),

        query("page")
            .optional()
            .isInt({ min: 1 })
            .withMessage("page must be a positive integer")
            .toInt(),

        query("limit")
            .optional()
            .isInt({ min: 1, max: 100 })
            .withMessage("limit must be between 1 and 100")
            .toInt()
    ];
}

// POST /api/comments
// Validates the request body for creating a comment
export function validateCreateComment() {
    return [
        body("targetId")
            .notEmpty()
            .withMessage("targetId is required"),
        
        body("targetType")
            .notEmpty()
            .withMessage("targetType is required")
            .bail()
            .isIn(VALID_TARGET_TYPES)
            .withMessage("targetType must be either 'game' or 'tournament'"),

        body("content")
            .trim()
            .isLength({ MIN_COMMENT_LENGTH, max: MAX_COMMENT_LENGTH })
            .withMessage(`Comment must be between ${MIN_COMMENT_LENGTH} and ${MAX_COMMENT_LENGTH} characters`)
    ];
}

export default {
    validateCommentId,
    validateGetComments,
    validateCreateComment
};