
// Valid target types for comments
const VALID_TARGET_TYPES = ["game", "tournament"];

// Checks if the targetType is valid
// Used in both getComments and createComment
export function isValidTargetType(targetType) {
    return VALID_TARGET_TYPES.includes(targetType);
}

// Builds the comment filter based on targetId, targetType and user role
// Admins can see soft-deleted comments, regular users cannot
export function buildCommentFilter(targetId, targetType, userRole) {
    return {
        targetId,
        targetType,
        // If you're a regular user, you can't see the soft-deleted comments,
        // but admins can
        ...(userRole !== "admin" && { isDeleted: false })
    };
}

export default {
    isValidTargetType,
    buildCommentFilter
};