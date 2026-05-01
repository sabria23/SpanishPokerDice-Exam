import { Tournament } from "../../models/tournament.js";
import { Trophy } from "../../models/trophy.js";
import { User } from "../../models/user.js";
import { GameVariant } from "../../models/gameVariant.js";

// Returns a random element from an array
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Seeds an upcoming tournament with a trophy
async function _seedUpcomingTournament(admin, variants) {
    const trophy = new Trophy({
        title: "Summer cup"
    });
    await trophy.save();

    const tournament = new Tournament({
        title: "Summer Championship 2026",
        description: "The biggest tournament of the summer!",
        variantId: pick(variants)._id,
        maxPlayers: 8,
        breakDuration: 10,
        scheduledAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 1 week from now
        trophyId: trophy._id,
        createdBy: admin.userId,
        status: "upcoming"
    });
    await tournament.save();

    console.log("Inserted upcoming tournament");
}

// Seeds an ongoing tournament withh some player already joined
async function _seedOngoingTournament(admin, users, variants) {
    const trophy = new Trophy({
        title: "Easter Trophy"
    });
    await trophy.save();

    // Add 4 players to the tournament pool
    const players = users.slice(0, 4).map(user =>user.userId);

    const tournament = new Tournament({
        title: "Easter Invitational",
        description: "An ongoing invitational tournament",
        variantId: pick(variants)._id,
        maxPlayers: 4,
        breakDuration: 5,
        scheduledAt: new Date(Date.now() - 1000 * 60 * 60), // started 1 hour ago
        startedAt: new Date(Date.now() - 1000 * 60 * 60),
        trophyId: trophy._id,
        createdBy: admin.userId,
        players,
        status: "ongoing"
    });
    await tournament.save();

    console.log("Inserted ongoing tournament");
}

// Seeds a finished tournament with a winner
async function _seedFinishedTournament(admin, users, variants) {
    const trophy = new Trophy({
        title: "Winter Break Champion Cup"
    });
    await trophy.save();

    // Wins just by being the first user in the array 
    // Only for seed purposes
    const winner = users[0];
    const players = users.slice(0, 4).map(user => user.userId);

    const tournament = new Tournament({
        title: "Winter Break Classic",
        description: "The winter break classic tournament, now finished",
        variantId: pick(variants)._id,
        maxPlayers: 4,
        breakDuration: 5,
        scheduledAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7), // 1 week ago
        startedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
        finishedAt: new Date(Date.now() - 1000 * 60 * 60), // finished 1 hour ago
        trophyId: trophy._id,
        createdBy: admin.userId,
        players,
        winnerId: winner.userId,
        status: "finished"
    });
    await tournament.save();

    // Award the trophy to the winner 
    await User.updateOne(
        { userId: winner.userId },
        { $push: { trophies: { trophyId: trophy._id, awardedAt: new Date() } } } 
        // $push appends an element to an arry field withoiut loading the full document
        // Makes it so the email validator doesn't get triggered
    );

    console.log("Inserted finished tournament and awarded trophy to winner");
}

// Clears exisiting tournaments and trophies and seeds new ones
export async function seedTournaments() {
    await Tournament.deleteMany({});
    console.log("Deleted existing tournaments");

    await Trophy.deleteMany({});
    console.log("Deleted existing trophies");

    // Fetch once and pass down to avoid multiple DB calls
    const admins = await User.find({ role: "admin" });
    const users = await User.find({ role: "user" });
    const variants = await GameVariant.find();

    // Pick a random admin
    const admin = pick(admins);

    await _seedUpcomingTournament(admin, variants);
    await _seedOngoingTournament(admin, users, variants);
    await _seedFinishedTournament(admin, users, variants);

    console.log("Inserted upcoming, ongoing and finished tournaments");
}