import { GameVariant } from "../../models/gameVariant.js";

import {
    MIN_ROUNDS, 
    MIDRANGE_ROUNDS,
    MAX_ROUNDS,
    MIN_TIME,
    MIDRANGE_TIME,
    MAX_TIME 
} from "../../config/constants.js";

// Doing this instead of a json file, because I have the combinations as constants
export async function seedVariants() {
    await GameVariant.deleteMany({});
    console.log("Deleted the existing game variants");

    // Generate all 18 combinations; 3 round options x 2 straights options x 3 time control options
    const roundOptions = [MIN_ROUNDS, MIDRANGE_ROUNDS, MAX_ROUNDS];
    const timeOptions = [MIN_TIME, MIDRANGE_TIME, MAX_TIME];
    const straightsOptions = [true, false];

    // The flatMap() method maps all array elements and creates a new flat array https://www.w3schools.com/jsref/jsref_array_flatmap.asp
    const variants = roundOptions.flatMap(r =>
        timeOptions.flatMap(t =>
            straightsOptions.map(s => ({
                rounds: r,
                timeControl: t,
                straightsAllowed: s
            }))
        )
    );

    await GameVariant.insertMany(variants);
    console.log("Inserted all 18 game variants");
}