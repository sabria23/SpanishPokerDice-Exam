import mongoose from "mongoose";

import { 
    MIN_ROUNDS, 
    MIDRANGE_ROUNDS,
    MAX_ROUNDS,
    MIN_TIME,
    MIDRANGE_TIME,
    MAX_TIME
} from "../config/constants.js";

// Schema for the 18 different game variants 
// 3 round options x 2 straights options 2 x 3 time options
const gameVariantSchema = new mongoose.Schema({
    // Number of rounds in a game
    rounds: {
        type: Number,
        enum: [MIN_ROUNDS, MIDRANGE_ROUNDS, MAX_ROUNDS],
        required: true
    },

    // whether straights are included or not
    straightsAllowed: {
        type: Boolean,
        required: true
    },

    // how many seconds each round of the game is
    timeControl: {
        type: Number,
        enum: [MIN_TIME, MIDRANGE_TIME, MAX_TIME], 
        required: true
    }

},
{
    versionKey: false
});

export const GameVariant = mongoose.model("GameVariant", gameVariantSchema);