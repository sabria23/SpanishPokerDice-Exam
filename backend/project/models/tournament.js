import mongoose from "mongoose";
import { matchSchema } from "./subSchemas/match.js";

import { 
    MIN_ID,
    MIN_TITLE_LENGTH,
    MAX_TITLE_LENGTH,
    MIN_DESCRIPTION_LENGTH,
    MAX_DESCRIPTION_LENGTH,
    MIN_PLAYERS,
    LOW_RANGE_PLAYERS,
    HIGH_RANGE_PLAYERS,
    MAX_PLAYERS
} from "../config/constants.js";

const tournamentSchema = new mongoose.Schema({
    // Custom tournament ID, auto generated the same way as userId and gameId
    tournamentId: {
        type: Number,
        min: MIN_ID,
        max: Number.MAX_SAFE_INTEGER,
        index: true,
        required: true,
        unique: true
    },

    // Title for the tournament
    title: {
        type: String,
        required: true,
        trim: true,
        minLength: [MIN_TITLE_LENGTH, `Title must be at least ${MIN_TITLE_LENGTH} characters`],
        maxLength: [MAX_TITLE_LENGTH, `Title can't be longer than ${MAX_TITLE_LENGTH} characters`]
    },

    // Description of the tournament 
    description: {
        type: String,
        trim: true,
        minLength: [MIN_DESCRIPTION_LENGTH, `Description must be at least ${MIN_DESCRIPTION_LENGTH} characters`],
        maxLength: [MAX_DESCRIPTION_LENGTH, `Description can't be longer than ${MAX_DESCRIPTION_LENGTH} characters`]
    },

    // References the trophy awarded to the winner
    trophyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Trophy",
        required: true
    },

    // References the game variant used for all games in this tournament
    variantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "GameVariant",
        required: true
    },

    // The admin who created the tournament
    createdBy: {
        type: Number,
        required: true
    },

    // Maximum number of player per tournament
    maxPlayers: {
        type: Number,
        enum: [MIN_PLAYERS, LOW_RANGE_PLAYERS, HIGH_RANGE_PLAYERS, MAX_PLAYERS],
        required: true
    },

    // Pool of registered users who have joined the tournament
    // Stored as userIds, capped at maxPlayers
    players: {
        type: [Number],
        default: [],
        validate: {
            validator: function(arr) {
                return arr.length <= this.maxPlayers;
            },
            message: "Tournament has reached its maximum number of players"
        }
    },

    // All matches across all rounds of the tournament
    matches: [matchSchema],

    // Duration of breaks between rounds in minutes
    breakDuration: {
        type: Number,
        default: 0
    },

    // When the tournament is scheduled to start
    scheduledAt: {
        type: Date,
        required: true
    },

    // When the tournament actually started
    startedAt: {
        type: Date,
        default: null
    },

    // When the tournament finished
    finishedAt: {
        type: Date,
        default: null
    },

    // Status of the tournament
    status: {
        type: String,
        enum: ["upcoming", "ongoing", "finished"],
        default: "upcoming"
    },

    // userId of the tournament winner, null until the tournament is finished
    winnerId: {
        type: Number,
        default: null
    }
},
{
    timestamps: true, 
    toJSON: {
        transform: (tournamentDoc, tournamentPojo) => {
            delete tournamentPojo._id;
            return tournamentPojo;
        },
        versionKey: false
    }
});

// Modified inclass code from IDG2100 Fullstack 2026
tournamentSchema.pre("validate", function() {
    if(this.isModified("tournamentId") || this.isNew) { 
        if(this.tournamentId !== undefined) {
            console.warn("Tournament IDs are supposed to be auto generated. Discarding the past value", this.tournamentId, ".");
        }
        this.tournamentId = Math.round(Math.random() * Number.MAX_SAFE_INTEGER);
    }
});

export const Tournament = mongoose.model("Tournament", tournamentSchema);