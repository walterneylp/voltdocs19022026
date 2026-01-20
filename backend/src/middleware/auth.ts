import type { Request, Response, NextFunction } from "express";
import { getUserClient } from "../lib/supabase.js";

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const header = req.header("authorization");
  if (!header?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Missing Authorization header" });
    return;
  }

  const accessToken = header.replace("Bearer ", "").trim();
  if (!accessToken) {
    res.status(401).json({ error: "Empty access token" });
    return;
  }

  req.accessToken = accessToken;
  req.supabase = getUserClient(accessToken);
  next();
};
