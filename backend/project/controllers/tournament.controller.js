import { Tournament } from "../models/tournament.js";
import tournamentServices from "../services/tournament.services.js";

import {
    PAGE,
    LIMIT
} from "../config/constants.js";

// GET /api/tournaments
// Public, returns a paginated list of tournaments 
// Supports filtering by status (upcoming, ongoing, finished)
export async function getAllTournaments(req, res) {
    try {
        const { page = PAGE, limit = LIMIT, status } = req.query;

        // Optionally filter by tournament status
        const filter = status ? { status } : {};

        const tournaments = await Tournament.find(filter)
            .populate("variantId") // Include full game variant details
            .populate("trophyId") // Include full trophy details
            .sort({ scheduledAt: 1 }) // Soonest first
            .skip((page - 1) * limit)
            .limit(Number(limit));

        const total = await Tournament.countDocuments(filter);

        res.json({
            total,
            page: Number(page),
            totalPages: Math.ceil(total / limit),
            tournaments
        });
    } catch (err) {
        // Internal server error
        res.status(500).json({ msg: "Failed to get tournaments", error: err.message });
    }
}

// GET /api/tournaments/:id
// Public, returns a single tournament by tournamentId
export async function getTournament(req, res) {
    try {
        const tournament = await tournamentServices.findTournamentById(req.validData.id);

        if (!tournament) {
            // Not found
            return res.status(404).json({ msg: "Tournament not found" });
        }

        // Populate full details for variant, trophy and match games
        await tournament.populate("variantId");
        await tournament.populate("trophyId");
        await tournament.populate("matches.gameId"); // Include full game details for each match

        // If/when all is clear, respond with the tournament
        res.json(tournament);
    } catch(err) {
        // Internal server error
        res.status(500).json({ msg: "Failed to get tournament", error: err.message });
    }
}

// GET /api/tournaments/:id/standings
// Public, returns the bracket standings for a tournament
// Groups matches by round and shows who played who and who won
export async function getTournamentStandings(req, res) {
    try {
        const tournament = await tournamentServices.findTournamentById(req.validData.id);

        if (!tournament) {
            // Not found
            return res.status(404).json({ msg: "Tournament not found" });
        }

        // Group matches by round number
        // Reduce builds an object where each key is a round number
        const rounds = tournament.matches.reduce((acc, match) => {
            if (!acc[match.round]) acc[match.round] = [];
            acc[match.round].push({
                playerOne: match.playerOne,
                playerTwo: match.playerTwo,
                gameId: match.gameId,
                winnerId: match.winnerId
            });
            return acc;
        }, {});

        res.json({
            tournamentId: tournament.tournamentId,
            title: tournament.title,
            status: tournament.status,
            players: tournament.players,
            rounds,
            winnerId: tournament.winnerId
        });
    } catch (err) {
        // Internal server error
        res.status(500).json({ msg: "Failed to get tournament standings", error: err.message });
    }
}

// POST /api/tournaments/:id/join
// Registered users only, adds the user to the tournament player pool
export async function joinTournament(req, res) {
    try {
        // Find a tournament 
        const tournament = await tournamentServices.findTournamentById(req.validData.id);

        if (!tournament) {
            // Not found
            return res.status(404).json({ msg: "Tournament not found" });
        }

        // Can only join upcoming tournaments
        if (tournament.status !== "upcoming") {
            // Could probably use 418 here as well
            // Bad request 
            return res.status(400).json({ msg: "You can only join upcoming tournaments" });
        }

        // Check if the tournament is already full 
        if (tournament.players.length >= tournament.maxPlayers) {
            // Bad request
            return res.status(400).json({ msg: "Tournament is full" });
        }

        // Check if the user has already joined 
        if (tournament.players.includes(req.user.userId)) {
            // Conflict
            return res.status(409).json({ msg: "You have already joined this tournament" });
        }

        tournament.players.push(req.user.userId);
        await tournament.save();

        // yay you joined
        res.json({ msg: "Successfully joined the tournament", tournament });
    } catch(err) {
        // Internal server error 
        res.status(500).json({ msg: "Failed to join tournament", error: err.message });
    }
}

// POST /api/tournaments
// Admins only, creates a new tournament and its associated trophy
export async function createTournament(req, res) {
    try {
        const {
            title,
            description,
            variantId,
            maxPlayers,
            breakDuration,
            scheduledAt,
            trophyTitle
        } = req.validData;

        // Check required fields
        if (!title || !variantId || !maxPlayers || !scheduledAt || !trophyTitle) {
            // Bad request
            return res.status(400).json({ msg: "title, variantId, maxPlayers, scheduledAt and trophyTitle are required" });
        }

        // Tournament must be scheduled in the future
        if (!tournamentServices.isDateInFuture(scheduledAt)) {
            // Bad request
            return res.status(400).json({ msg: "Tournament must be scheduled in the future" });
        }

        // Create the trophy first so it can be referenced in the tournament
        // req.file is set by the multer upload middleware in the route
        const trophy = await tournamentServices.createTrophy(trophyTitle, req.file ? req.file.path : null);

        // createdBy comes from the auth middleware
        const tournament = new Tournament({
            title,
            description,
            variantId,
            maxPlayers,
            breakDuration,
            scheduledAt,
            trophyId: trophy._id,
            createdBy: req.user.userId
        });

        await tournament.save();
        // Created
        res.status(201).json(tournament);

    } catch (err) { 
        if (err.name === "ValidationError") {
            // Bad request
            return res.status(400).json({ msg: err.message });
        }
        // Internal server error
        res.status(500).json({ msg: "Failed to create tournament", error: err.message });
    }
}

// PUT /api/tournaments/:id 
// Admins only, updates a tournament (only allowed if still upcoming)
export async function updateTournament(req, res) {
    try {
        const tournament = await tournamentServices.findTournamentById(req.validData.id);

        if (!tournament) {
            // Not found
            return res.status(404).json({ msg: "Tournament not found" });
        }

        // Can only edit/update upcoming tournaments
        if (tournament.status !== "upcoming") {
            // Bad request 
            return res.status(400).json({ msg: "Only upcoming tournaments can be updated" });
        }

        // Apply updates and check for validation errors
        // Returns an error message string if validation fails, null if all is fine
        const error = tournamentServices.applyTournamentUpdates(tournament, req.validData);
        if (error) {
            // Bad request
            return res.status(400).json({ msg: error });
        }

        await tournament.save();
        res.json(tournament);
    } catch(err) {
        if (err.name === "ValidationError") {
            // Bad request
            return res.status(400).json({ msg: err.message });
        }
        res.status(500).json({ msg: "Failed to update tournament", error: err.message });
    }
}

export default {
    getAllTournaments,
    getTournament,
    getTournamentStandings,
    joinTournament,
    createTournament,
    updateTournament
};