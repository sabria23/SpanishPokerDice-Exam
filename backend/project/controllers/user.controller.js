import { User } from "../models/user.js";
import { checkPwd } from "../utils/hash.js";
import userServices, { findUserById } from "../services/user.services.js";

import {
    PAGE,
    LIMIT
} from "../config/constants.js";

// GET /api/users
// Admin only, returns a paginated, searchable list of all users
export async function getAllUsers(req, res) {
    try {
        // pagination
        const { page = PAGE, limit = LIMIT, search = "" } = req.query;

        // search filter, searches username and email
        const filter = userServices.buildSearchFilter(search);
        
        // find users using the filter
        const users = await User.find(filter)
            .skip((page - 1) * limit)
            .limit(Number(limit));

        // count all the user documents in the collection, using the filter
        const total = await User.countDocuments(filter);

        res.json({
            total,
            page: Number(page),
            totalPages: Math.ceil(total / limit),
            users
        });

    } catch(err) {
        // Internal server error
        res.status(500).json({ msg: "Failed to get users", error: err.message });
    }
}

// GET /api/users/:id
// Registered users, returns a single user profile by userId
export async function getUser(req, res) {

    try {
        // find the user based on userId
        const user = await userServices.findUserById(req.validData.id);

        // if the userId is not valid
        if(!user) {
            // Not found
            return res.status(404).json({ msg: "User was not found" });
        }

        // Populate recentGames and trophies with full documents
        await user.populate("recentGames"); // swap ObjectIds for full game documents
        await user.populate("trophies.trophyId"); // swap trophyIds for full trophy documents

        // otherwise show the user
        res.json(user);

    } catch(err) {
        // Internal server error
        res.status(500).json({ msg: "Failed to get user", error: err.message });
    }
}

// POST /api/users/register
// Public, creates a new user account
export async function registerUser(req, res) {
    try {
        // Request body contains
        const { username, email, pwd, age } = req.validData;

        // Check that all required fields are present 
        if (!username || !email || !pwd || !age) {
            // Bad request
            return res.status(400).json({ msg: "Username, email, password and age are required" });
        }

        // Check if username is already taken
        const existingUsername = await User.findOne({ username });
        if (existingUsername) {
            // Conflict
            return res.status(409).json({ msg: "Username is already taken" });
        }

        // Create the new user, userId is auto generated and pwd is hashed by the User model
        const user = new User({ username, email, pwd, age });
        await user.save();

        // User was successfully created yay
        // Created
        res.status(201).json(user);
    } catch(err) {
        // Mongoose validation errors (e.g. invalid email, age too low)
        if (err.name === "ValidationError") {
            // Bad request
            return res.status(400).json({ msg: err.message });
        }

        // Unprocessable content (everything is done right, but failed validation)
        // Feel like I could have gotten away with using 418 I'm a teapot as well
        res.status(422).json({ msg: "Failed to register user", error: err.message });
    }
}

// POST  /api/users/login
// Public, finds a user by email and checks their password
export async function loginUser(req, res) {
    try {
        // Request body contains 
        const { emailOrUsername, pwd } = req.validData;

        if (!emailOrUsername || !pwd) {
            // Bad request
            return res.status(400).json({ msg: "Email/username and password are required" });
        }

        // Check if input looks like an email or a username
        const isEmail = emailOrUsername.includes("@");
        // Explicitly select pwd field internally
        const user = await User.findOne(
            isEmail
                ? { email: emailOrUsername }
                : { username: emailOrUsername }
        ).select("+pwd");

        if (!user) {
            // Unauthorized, being vague because you don't need to know if that email or password exist
            return res.status(401).json({ msg: "Invalid email/username or password" });
        }

        // Checking the plain text password against the stored hash
        if (!checkPwd(pwd, user.pwd)) {
            // Unauthorized, being vague again
            return res.status(401).json({ msg: "invalid email/username or password" });
        }

        if (user.isBanned === true) {
            // Forbidden, because you are banned
            return res.status(403).json({ msg: "Your account has been banned..." });
        }

        // Return the userId so the client can use it in the x-user-id header
        res.json({ msg: "Login successful", userId: user.userId, username: user.username });
    } catch (err) {
        // Internal server error
        res.status(500).json({ msg: "Failed to login", error: err.message });
    }
}

// PUT /api/users/:id
// Registered users, they can update their own profile except for their username
export async function updateUser(req, res) {
    try {
        // Finding the user based on the userId
        const user = await userServices.findUserById(req.validData.id);
        
        if(!user) {
            // Not found 
            return res.status(404).json({ msg: "User was not found" });
        }

        // Users can only update their own profile
        if (user.userId !== req.user.userId) {
            // Forbidden
            return res.status(403).json({ msg: "Excuse you, you can only update your own profile" });
        }

        // Only updating fields that were actually sent
        userServices.applyUserUpdates(user, req.validData);

        // Saving the changes the user made
        await user.save();
        res.json(user); 

    } catch(err) {
        if (err.name === "ValidationError") {
            // Bad request
            return res.status(400).json({ msg: err.message });
        }

        // Internal server error 
        res.status(500).json({ msg: "Failed to update user", error: err.message });
    }
}

// PUT /api/users/:id/avatar
// Registered users, they can upload a profile picture for their own profile
// File validation is handled by multer middleware in the route
export async function uploadAvatar(req, res) {
    try {
        // Finding the user based on the userId
        const user = await findUserById(req.params.id);

        if (!user) {
            // Not found
            return res.status(404).json({ msg: "User was not found" });
        }

        // Users can only update their own avatar
        if (user.userId !== req.user.userId) {
            // Forbidden
            return res.status(403).json({ msg: "You can only update your own avatar" });
        }

        // req.file is set by multer middleware, if missing, no file was sent
        if (!req.file) {
            // Bad request
            return res.status(400).json({ msg: "No image provided" });
        }

        // Use updateOne to avoid triggering email uniqueness validator
        await User.updateOne(
            { userId: user.userId },
            { avatar: req.file.path }
        );

        // Return the new avatar path so the frontend can update immediatley
        res.json({ msg: "Avatar updated!", avatar: req.file.path });
    } catch (err) {
        // Internal server error
        res.status(500).json({ msg: "Failed to upload avatar", error: err.message });
    }
}

// PUT /api/users/:id/ban
// Admin only, they can ban an user
export async function banUser(req, res) {
    try {
        const user = await userServices.findUserById(req.validData.id);

        if(!user) {
            // Not found 
            return res.status(404).json({ msg: "User was not found. Need one to ban one" });
        }

        if (user.role === "admin") {
            // Forbidden
            return res.status(403).json({ msg: "Admins can't be banned" });
        }

        // sets the user to being banned
        await User.updateOne({ userId: user.userId }, { isBanned: true });

        res.json({ msg: `User ${user.username} has been banned` });
    } catch(err) {
        // Internal server error
        res.status(500).json({ msg: "Failed to ban user", error: err.message });
    }
}

export default {
    getAllUsers,
    getUser,
    registerUser,
    loginUser,
    updateUser,
    uploadAvatar,
    banUser
};