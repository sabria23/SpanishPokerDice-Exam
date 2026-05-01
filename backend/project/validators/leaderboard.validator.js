import { query } from "express-validator";

export function validateGetLeaderboard() {
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

export default {
    validateGetLeaderboard
};