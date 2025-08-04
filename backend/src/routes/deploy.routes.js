import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import { deployProject } from "../controllers/deploy.controller.js";

const deployRouter = express.Router();

deployRouter.post("/", authMiddleware, deployProject);

export default deployRouter;
