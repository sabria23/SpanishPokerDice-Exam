import { Tournament } from "../models/tournament.js";
import { Trophy } from "../models/trophy.js";

// Finds a tournament by its custom tournamentId field
// Used in getTournament, joinTournament and updateTournament controllers
export async function findTournamentById(id) {
    return await Tournament.findOne({ tournamentId: Number(id) });
}

// Checks if a date is in the future
// Used in createTournament and updateTournament to validate scheduledAt
export function isDateInFuture(date) {
    return new Date(date) > new Date();
}

// Creates a trophy document for a tournament
// Trophy is created before the tournament so it can be referenced by trophyId
export async function createTrophy(trophyTitle, imagePath = null) {
    const trophy = new Trophy({
        title: trophyTitle,
        image: imagePath
    });
    await trophy.save();
    return trophy;
}

// Applies only the fields that were actually sent in the request body
// Validates scheduledAt and maxPlayers before applying
// Returns an error message string if validation fails, null if all is fine
export function applyTournamentUpdates(tournament, { title, description, scheduledAt, breakDuration, maxPlayers }) {
    if (title) tournament.title = title;
    if (description) tournament.description = description;
    if (breakDuration) tournament.breakDuration = breakDuration;

    if (scheduledAt) {
        // Make sure the new date is still in the future
        if (!isDateInFuture(scheduledAt)) {
            // would be funny to put 403 or 401 and tell them they're not authorized to change the past haha
            return "Tournament must be scheduled in the future";
        }
        tournament.scheduledAt = scheduledAt;
    }

    if (maxPlayers) {
        // Can't reduce maxPlayers below the current number of registered players
        if (maxPlayers < tournament.players.length) {
            return "Cannot reduce maxPlayers below current number of registered players";
        }
        tournament.maxPlayers = maxPlayers;
    }

    // null means no validation errors
    return null;
}

export default {
    findTournamentById,
    isDateInFuture,
    createTrophy,
    applyTournamentUpdates
};