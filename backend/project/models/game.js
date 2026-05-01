import mongoose from "mongoose";
import { playerSchema } from "./subSchemas/player.js";

import {
    MIN_ID
} from "../config/constants.js";

const gameSchema = new mongoose.Schema({
    // Custom game ID, auto-generated in the same way as userId
    gameId: {
        type: Number,
        min: MIN_ID,
        max: Number.MAX_SAFE_INTEGER,
        index: true,
        required: true,
        unique: true
    },

    // References playerSchema to see which player it is and how many rounds they won
    playerOne: {
        type: playerSchema,
        required: true
    },

    // Not required because of waiting games doesn't have a player 2 yet
    playerTwo: {
        type: playerSchema
    },

    // References the GameVariant model to know the rules of this game
    variantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "GameVariant",
        required: true
    },

    // userId of the winner, null if the game is still ongoing or a draw
    // A controller sets it when the game finishes
    winnerId: {
        type: Number,
        default: null
    },

    // status of the game
    // included to make logic easier later
    status: {
        type: String,
        enum: ["waiting", "invited", "ongoing", "finished", "declined"],
        default: "waiting"
    },

    // Anon games are saved but hidden from platform activity
    isAnonymous: {
        type: Boolean,
        default: false
    },

    // The userId of the player who was invited to this game
    // null for matchmade games, set when playerOne invites someone directly
    invitedUserId: {
        type: Number,
        default: null
    },

    // When the game got started
    startedAt: {
        type: Date,
        default: null
    },

    // When the game got finished
    finishedAt: {
        type: Date,
        default: null
    }
},
{
    timestamps: true,
    toJSON: {
        transform: (gameDoc, gamePojo) => {
            delete gamePojo._id;
            return gamePojo;
        },
        // Used to keep track of the version of a document and helps with concurrent updates
        // Stops it from showing up in the JSON response sent to the frontend
        versionKey: false
    }
});

// Modified the code from inclass to fit the game schema, IDG2100 Fullstack 2026
// Checks if the gameId is modified, new or not undefined, and generates a new one or leaves if be
gameSchema.pre("validate", function() {
    if(this.isModified("gameId") || this.isNew) { 
        if(this.gameId !== undefined) {
            console.warn("Game IDs are supposed to be auto generated. Discarding the past value", this.gameId, ".");
        }
        this.gameId = Math.round(Math.random() * Number.MAX_SAFE_INTEGER);
    }
});

export const Game = mongoose.model("Game", gameSchema);