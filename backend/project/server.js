/* this is basically the same code as the inclass code we've been doing from IDG2100 Fullstack 2026*/
import dotenv from "dotenv";
import express from "express";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import cors from "cors";

import { apiLimiter } from "./middleware/ratelimiter.js";
import { errorHandler } from "./middleware/errorhandler.js";
import apiRouter from "./routers/api.router.js";
import nonApiRouter from "./routers/non.api.router.js";
import { connectDB, disconnectDB } from "./config/db.js";

// Sometimes it won't work if i don't include this
// might be a windows thing?
dotenv.config();

// awaiting mongoose to connect to mongodb
await connectDB();

// Creating an express app
const app = express();

// Allow requests from the frontend dev server
app.use(cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "x-user-id"]
}));

app.use(express.json());

// Apply rate limiter to all API routes
app.use("/api", apiLimiter);

// Mounting the routes
app.use("/", nonApiRouter);
app.use("/api", nonApiRouter);
app.use("/api", apiRouter);

// Absolute path
const __dirname = dirname(fileURLToPath(import.meta.url));
app.use("/uploads", express.static(join(__dirname, "uploads")));

app.use(errorHandler);

// listening on a port 
const httpServer = app.listen(process.env.BACKEND_PORT);
// Want to see it in the terminal
httpServer.on("listening", ()=> console.log("the app is listening on port", httpServer.address().port));

// Graceful shutdown handling
async function gracefulShutdown() {
    console.log("application is being shut down");

    await disconnectDB();
    httpServer.close(() => {
        process.exit(0);
    });
}

// Allows app to perform cleanup before shutting down
process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);