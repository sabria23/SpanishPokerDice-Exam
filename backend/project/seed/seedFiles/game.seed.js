import { Game } from "../../models/game.js";
import { User } from "../../models/user.js";
import { GameVariant } from "../../models/gameVariant.js";

// Returns a random element from an array
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Seeds 10 finished games between seeded users with random scores and winners
async function _seedFinishedGames(users, variants) {
    const gameDocs = [];

    for (let i = 0; i < 10; i++) {
        // Pick two different players using modulo to cycle through the users array
        const p1 = users[i % users.length];
        const p2 = users[(i + 1) % users.length];
        const variant = pick(variants);

        // Random scores between 0 and 3
        const p1Score = Math.floor(Math.random() * 4);
        const p2Score = Math.floor(Math.random() * 4);

        gameDocs.push(new Game({
            playerOne: { userId: p1.userId, rounds: [], score: p1Score },
            playerTwo: { userId: p2.userId, rounds: [], score: p2Score },
            variantId: variant._id,
            // Determine winner based on scores, null if draw
            winnerId: p1Score > p2Score ? p1.userId : p2Score > p1Score ? p2.userId : null,
            status: "finished",
            isAnonymous: false,
            startedAt: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
            finishedAt: new Date()
        }));
    }

    await Promise.all(gameDocs.map(g => g.save()));
    console.log(`Inserted ${gameDocs.length} finished games`);
}

// Seeds 3 ongoing games between seeded users
async function _seedOngoingGames(users, variants) {
    const gameDocs = [];

    for (let i = 0; i < 3; i++) {
        // Offset by 2 and 3 to avoid same pairings as finished games
        const p1 = users[(i + 2) % users.length];
        const p2 = users[(i + 3) % users.length];
        const variant = pick(variants);

        gameDocs.push(new Game({
            playerOne: { userId: p1.userId, rounds: [], score: 0 },
            playerTwo: { userId: p2.userId, rounds: [], score: 0 },
            variantId: variant._id,
            status: "ongoing",
            isAnonymous: false,
            startedAt: new Date()
        }));
    }

    await Promise.all(gameDocs.map(g => g.save()));
    console.log(`Inserted ${gameDocs.length} ongoing games`);
}

// Seeds 2 waiting games with only playerOne set, waiting for an opponent
async function _seedWaitingGames(users, variants) {
    const gameDocs = [];

    for (let i = 0; i < 2; i++) {
        const p1 = users[i % users.length];
        const variant = pick(variants);

        gameDocs.push(new Game({
            playerOne: { userId: p1.userId, rounds: [], score: 0 },
            variantId: variant._id,
            status: "waiting",
            isAnonymous: false
        }));
    }

    await Promise.all(gameDocs.map(g => g.save()));
    console.log(`Inserted ${gameDocs.length} waiting games`);
}

// Clears existing games and seeds new ones
// Fetches users and variants once and passes them to each helper
export async function seedGames() {
    await Game.deleteMany({});
    console.log("Deleted existing games");

    // Fetch once and pass down to avoid multiple DB calls
    const insertedUsers = await User.find({ role: "user" });
    const insertedVariants = await GameVariant.find();

    await _seedFinishedGames(insertedUsers, insertedVariants);
    await _seedOngoingGames(insertedUsers, insertedVariants);
    await _seedWaitingGames(insertedUsers, insertedVariants);
    console.log("Added games");
}