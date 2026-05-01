// General idea taken from inclass code from IDG2100 Fullstack 2026
import express from "express";

const nonApiRouter = express.Router();

nonApiRouter.get("/", (req, res) => {
    res.send("To see content, go to for example http://localhost:yourport/api/users");
});

nonApiRouter.get("/api", (req, res) => {
    res.send("To see content, go to for example http://localhost:yourport/api/users.");
});

export default nonApiRouter;