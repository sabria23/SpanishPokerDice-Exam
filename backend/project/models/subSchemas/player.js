import mongoose from "mongoose";
import { roundSchema } from "./round.js";

/* Player sub-schema */
export const playerSchema = mongoose.Schema({
    // References the User model via the custom userId field
    userId: {
        type: Number
    },
    
    // Each array entry is one round played by this player
    rounds: [roundSchema],

    // Final score at the end of the game based on how many rounds the player won
    score: {
        type: Number,
        default: 0
    }
});