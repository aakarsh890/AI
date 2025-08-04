import express from "express";

import authMiddleware from "../middlewares/auth.middleware.js";
import {
  codeGenerate,
  deleteChatById,
  enhanceUserPrompt,
  getChatById,
  getUserChats,
  textGenerate,
} from "../controllers/chat.controller.js";

const chatRouter = express.Router();

chatRouter.get("/allChats", authMiddleware, getUserChats);
chatRouter.get("/info/:chatId", authMiddleware, getChatById);
chatRouter.delete("/:chatId", authMiddleware, deleteChatById);
chatRouter.post("/promptEnhance", authMiddleware, enhanceUserPrompt);
chatRouter.post("/explain", authMiddleware, textGenerate);
chatRouter.post("/explain/:chatId", authMiddleware, textGenerate);
chatRouter.post("/code/:chatId", authMiddleware, codeGenerate);

export default chatRouter;
