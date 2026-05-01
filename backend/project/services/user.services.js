import { User } from "../models/user.js";

// Finds a user by their custom userId field
// Used in getUser, updateUser and banUser controllers
export async function findUserById(id) {
    return await User.findOne({ userId: Number(id) });
}

// Builds a search filter for username and email
// Returns an empty object if no search term is provided (returns all users)
export function buildSearchFilter(search) {
    return search
        ? { $or: [ // https://www.mongodb.com/docs/manual/reference/operator/aggregation/or/ 
            { username: { $regex: search, $options: "i" } }, // $regex allows partial matching, "i" flag makes it case-insensitive
            { email: { $regex: search, $options: "i" } } // https://www.mongodb.com/docs/manual/reference/operator/query/regex/
        ]}
        : {};
}

// Applies only the fields that were actually sent in the request body
// Username is purposefully excluded - it cannot be changed per the brief
export function applyUserUpdates(user, { email, pwd, age, aboutMe }) {
    if (email) user.email = email;
    if (pwd) user.pwd = pwd; // Gets re-hashed by the pre("validate") hook
    if (age) user.age = age;
    if (aboutMe !== undefined) user.aboutMe = aboutMe; // Undefined check since empty string is valid
}

export default {
    findUserById,
    buildSearchFilter,
    applyUserUpdates
};