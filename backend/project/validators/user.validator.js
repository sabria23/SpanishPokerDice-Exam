import { body, param, query } from "express-validator";
import { findUserById } from "../services/user.services.js";

import {
    MIN_ID,
    MIN_USERNAME_LENGTH,
    MAX_USERNAME_LENGTH,
    MIN_PWD_LENGTH,
    MAX_PWD_LENGTH,
    MIN_AGE,
    MAX_LENGTH_ABOUT_ME
} from "../config/constants.js";

// Validates the userId route parameter
// Used in getUser, updateUser and banUser
export function validateUserId() {
    return [
        param("id")
            .isInt({ min: MIN_ID, max: Number.MAX_SAFE_INTEGER})
            .withMessage("User ID must be a valid integer")
            .bail() // Stop checking if the above fails
            .toInt() // Convert to integer for all following checks
            .custom(async (id) => {
                const user = await findUserById(id);
                if (!user) throw new Error("The user was not found");
            })
    ];
}

// GET /api/users?search=alice&page=1&limit=20
// The limit for the pagination can be changed
export function validateGetUsers() {
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

// POST /api/users/register
// Validates the request body for user registration
export function validateRegisterUser() {
    return [
        body("username")
            .trim()
            .escape() // Replaces XSS-related characters with HTML equivalents
            .isLength({ min: MIN_USERNAME_LENGTH, max: MAX_USERNAME_LENGTH})
            .withMessage(`Username must be between ${MIN_USERNAME_LENGTH} and ${MAX_USERNAME_LENGTH} characters`)
            .matches(/^[a-zA-Z0-9_]+$/)
            .withMessage("Username can only contain letters, numbers and underscores"),

        body("email")
            .trim()
            .normalizeEmail() // Lowercases and normalizes the email
            .isEmail()
            .withMessage("You need to have a valid email"),

        body("pwd")
            .isLength({ min: MIN_PWD_LENGTH, max: MAX_PWD_LENGTH})
            .withMessage(`Password must be between ${MIN_PWD_LENGTH} and ${MAX_PWD_LENGTH} characters`),

        body("age")
            .isInt({ min: MIN_AGE })
            .withMessage(`You must be at least ${MIN_AGE} years old to register`)
            .toInt()
    ];
}

// POST /api/users/login
// Validates the request body for updating a user profile
export function validateLoginUser() {
    return [
        body("emailOrUsername")
            .trim()
            .notEmpty()
            .withMessage("Email or username is required"),
        
        body("pwd")
            .notEmpty()
            .withMessage("You actually have to have a password")
    ];
}

// PUT /api/users/:id
// Validates the request body for updating a user profile
// All fields are optional since the user can update one or more fields at a time
export function validateUpdateUser() {
    return [
        body("email")
            .optional({ values: "falsy" })
            .trim()
            .normalizeEmail()
            .isEmail()
            .withMessage("A valid email is required"),

        body("pwd")
            .optional()
            .isLength({ min: MIN_PWD_LENGTH, max: MAX_PWD_LENGTH })
            .withMessage(`Password must be between ${MIN_PWD_LENGTH} and ${MAX_PWD_LENGTH} characters`),

        body("age")
            .optional()
            .isInt({ min: MIN_AGE })
            .withMessage(`You must be at least ${MIN_AGE} years old`)
            .toInt(),

        body("aboutMe")
            .optional()
            .trim()
            .isLength({ max: MAX_LENGTH_ABOUT_ME })
            .withMessage(`About me can't be longer than ${MAX_LENGTH_ABOUT_ME} characters`)
    ];
}

export default {
    validateUserId,
    validateGetUsers,
    validateRegisterUser,
    validateLoginUser,
    validateUpdateUser
};