import mongoose from "mongoose";

/* Round sub-schema */
export const roundSchema = new mongoose.Schema({
    // The dice values rolled in this round (5 dice, values 1-6, the values will be related to the die faces)
    rolls: {
        // type has to be Number in an array, because there's 5 dice
        type: [Number],
        validate: {
            // Could use a for loop instead of every
            validator: (arr) => arr.every(die => die >= 1 && die <= 6),
            message: "Dice values must be between 1 and 6"
        }
    },

    // Which die were held (by index 0-4)
    holds: {
        type: [Number],
        validate: {
            validator: (arr) => arr.every(i => i >= 0 && i <= 4),
            message: "Held dice must have an index between 0 and 4"
        }
    },

    // Timestamp of when this round was played
    playedAt: {
        type: Date,
        default: Date.now
    }
});