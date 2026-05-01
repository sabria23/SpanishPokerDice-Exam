import mongoose from "mongoose";

import { 
    MIN_COMMENT_LENGTH,
    MAX_COMMENT_LENGTH 
} from "../config/constants.js";

const commentSchema = new mongoose.Schema({
    // ID of the user who commented
    userId: {
        type: Number,
        required: true
    },

    // Which collection to look through
    targetType: {
        type: String,
        enum: ["game", "tournament"],
        required: true 
    },

    // Which document in the collection to look for
    targetId: {
        type: Number,
        required: true
    },

    // Rules for comment content
    content: {
        type: String,
        required: true,
        trim: true,
        minLength: [MIN_COMMENT_LENGTH, `Comment can't be shorter than ${MIN_COMMENT_LENGTH} characters`],
        maxLength: [MAX_COMMENT_LENGTH, `Comment can't be longer than ${MAX_COMMENT_LENGTH} characters`]
    },

    // Comment is soft deleted so admins can still see/view them, but regular users and anonymous users can't
    isDeleted: {
        type: Boolean,
        default: false
    }
},

{
    // The timestamp for when the comment got posted
    timestamps: true 
});

export const Comment = mongoose.model("Comment", commentSchema);