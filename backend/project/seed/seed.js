import "dotenv/config";
import { connectDB, disconnectDB } from "../config/db.js";
import { seedUsers } from "./seedFiles/user.seed.js";
import { seedVariants } from "./seedFiles/variant.seed.js";
import { seedGames } from "./seedFiles/game.seed.js";
import { seedTournaments } from "./seedFiles/tournament.seed.js";
import { seedComments } from "./seedFiles/comment.seed.js";

// connecting to the db
await connectDB();

await seedUsers(); // Has to come first, everything depends on users
await seedVariants(); // Games and tournaments depend on variants
await seedGames(); // Depends on users and variants
await seedTournaments(); // Depends on users and variants, awards trophies to users
await seedComments(); // Depends on games and tournaments

// closing connection to DB
await disconnectDB();
