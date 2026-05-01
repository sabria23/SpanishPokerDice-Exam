import { Comment } from "../models/comment.js";
import commentServices from "../services/comment.services.js";

import {
    PAGE,
    LIMIT
} from "../config/constants.js";

// GET /api/comments?targetId=123&targetType=game
// Public, returns all comments for a specific game or tournament
export async function getComments(req, res) {
    try {
        // Pagination related
        const { targetId, targetType, page = PAGE, limit = LIMIT } = req.validData;

        // Both required to identify what we're fetching comments for
        if (!targetId || !targetType) {
            // Bad request
            return res.status(400).json({ msg: "targetId and targetType are required" });
        }

        // Has to actually have a valid target type
        if (!commentServices.isValidTargetType(targetType)) {
            // Bad request
            return res.status(400).json({ msg: "targetType must be either 'game' or 'tournament'" });
        }

        // If you're a regular user, you can't see the soft-deleted comments,
        // but admins can
        const filter = commentServices.buildCommentFilter(targetId, targetType, req.user.role);

        // using the filter to filter through the comments
        const comments = await Comment.find(filter)
            .sort({ createdAt: -1 }) // newest first
            .skip((page - 1) * limit) // skips over comments from the previous page
            .limit(Number(limit)); // limits so it returns only 20 comments maximum per request

        const total = await Comment.countDocuments(filter);

        res.json({
            total,
            page: Number(page),
            totalPages: Math.ceil(total / limit),
            comments
        });

    } catch (err) {
        // Internal server error
        res.status(500).json({ msg: "Could not get comments", error: err.message });
    }
}

// POST /api/comments
// Registered users only, creates a new comment on a game or tournament
export async function createComment(req, res) {
    try {
        // request body contains
        const { targetId, targetType, content } = req.validData;

        // Check that all required fields are present
        if (!targetId || !targetType || !content) {
            // Bad request
            return res.status(400).json({ msg: "targetId, targetType and content are required" });
        }

        // Has to actually have a valid target type
        if (!commentServices.isValidTargetType(targetType)) {
            // Bad request
            return res.status(400).json({ msg: "targetType must be either 'game' or 'tournament'" });
        }

        // userId comes from the auth middleware, not the request body
        // Prevents users from posting comments as someone else 
        const comment = new Comment({
            userId: req.user.userId,
            targetId,
            targetType,
            content
        });

        // Saving the comment
        await comment.save();
        // Created comment successfully
        res.status(201).json(comment);
    } catch(err) {
        if (err.name === "ValidationError") {
            // Bad request
            return res.status(400).json({ msg: err.message });
        }
        // Internal server error
        res.status(500).json({ msg: "Failed to create comment", error: err.message });
    }
}

// DELETE /api/comments/:id
// Admin only, soft deletes a comment by setting isDeleted to true
export async function deleteComment(req, res) {
    try {
        // Finding the comment by the _id
        const comment = await Comment.findById(req.validData.id);

        if (!comment) {
            // Not found
            return res.status(404).json({ msg: "Comment not found" });
        }

        if (comment.isDeleted) {
            // Bad request
            return res.status(400).json({ msg: "Comment is already deleted" });
        }

        // Soft deletes, keeps the record in the db but hides it from regular users
        comment.isDeleted = true;
        // Save new comment status
        await comment.save();

        res.json({ msg: "Comment deleted successfully" });
    } catch (err) {
        // Internal server error
        res.status(500).json({ msg: "Failed to delete comment", error: err.message });
    }
}

export default {
    getComments,
    createComment,
    deleteComment
};