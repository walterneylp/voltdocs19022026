import express from "express";
import cors from "cors";
import { apiRouter } from "./routes/index.js";
import { z } from "zod";
export const createApp = () => {
    const app = express();
    app.use(cors());
    app.use(express.json({ limit: "2mb" }));
    app.use("/api", apiRouter);
    app.use((err, _req, res, _next) => {
        if (err instanceof z.ZodError) {
            res.status(400).json({ error: "Validation error", details: err.flatten() });
            return;
        }
        res.status(500).json({ error: err.message });
    });
    return app;
};
