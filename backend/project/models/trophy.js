import mongoose from "mongoose";

import { 
    MIN_TITLE_LENGTH,
    MAX_TITLE_LENGTH
} from "../config/constants.js";

export const trophySchema = new mongoose.Schema({
    // Title of the trophy
    title: {
        type: String,
        required: true,
        trim: true,
        minLength: MIN_TITLE_LENGTH,
        maxLength: MAX_TITLE_LENGTH
    },

    // URL or file path to the trophy image
    image: {
        type: String,
        trim: true
    }
});

export const Trophy = mongoose.model("Trophy", trophySchema);