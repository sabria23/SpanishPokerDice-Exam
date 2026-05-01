import { User } from "../models/user.js";

// For identifying whether the user is anonymous, a regular user
export async function identifyUser(req, res, next) {
    // figuring out who's requesting
    const userId = Number(req.headers["x-user-id"]); // x = extended

    // If there's no header, then the user is anonymous
    if (isNaN(userId)) {
        req.user = { role: "anonymous" };
        return next();
    }

    // see if the user exist and isn't banned
    try {
        const user = await User.findOne({ userId });

        if (!user) {
            return res.status(404).json({ msg: "User was not found"});
        }

        if (user.isBanned) {
            return res.status(403).json({ msg: "Your account has been banned" });
        }

        // full user body for the controllers
        req.user = user;
        next();
    } catch (err) {
        // Catches malformed user IDs
        return res.status(401).json({ msg: "Invalid user ID", error: err.message });
    }
}

// For routes that anonymous users can't access
export function requireUser(req, res, next) {
    if (req.user.role === "anonymous") {
        return res.status(401).json({ msg: "You must be logged in to do this" });
    }

    next();
}

// For routes that only admins can access
export function requireAdmin(req, res, next) {
    if (req.user.role !== "admin") {
        return res.status(403).json({ msg: "You must be an admin to do this" });
    }
    next();
}

export default {
    identifyUser,
    requireUser,
    requireAdmin
};