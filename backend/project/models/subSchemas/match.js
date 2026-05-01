import mongoose from "mongoose";

// Single paiting in the knockout bracket
// Each round of the tournament produces a set of matches
export const matchSchema = new mongoose.Schema({
    // The two players paired against each other
    playerOne: {
        type: Number,
        required: true
    },
    playerTwo: {
        type: Number,
        required: true
    },

    // References the game played for this match 
    gameId: {
        type: Number
    },

    // Which round of the tournament this match belongs to
    round: {
        type: Number,
        required: true
    },

    // userId of the winner, null until the match is finished
    winnerId: {
        type: Number,
        default: null
    }
});