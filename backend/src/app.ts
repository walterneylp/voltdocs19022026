import express from "express";
import cors from "cors";
import { apiRouter } from "./routes/index.js";
import { z } from "zod";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

export const createApp = () => {
  const app = express();
  const currentDir = dirname(fileURLToPath(import.meta.url));
  const staticDir = join(currentDir, "../../frontend/dist");

  app.use(cors());
  app.use(express.json({ limit: "2mb" }));

  app.use("/api", apiRouter);
  app.use(express.static(staticDir));

  app.get("*", (req, res) => {
    if (req.path.startsWith("/api")) return res.status(404).json({ error: "Not found" });
    res.sendFile(join(staticDir, "index.html"));
  });

  app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: "Validation error", details: err.flatten() });
      return;
    }
    res.status(500).json({ error: err.message });
  });

  return app;
};
