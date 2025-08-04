import generateCode from "../config/generateWebsiteCode.js";
import generateText from "../config/generateGameText.js";
import Chat from "../models/chat.model.js";
import generateGameCode from "../config/generateGameCode.js";
import generateWebsiteCode from "../config/generateWebsiteCode.js";
import geminiClassification from "../config/geminiClassification.js";
import generateGameText from "../config/generateGameText.js";
import generateWebsiteText from "../config/generateWebsiteText.js";
import generatePrompt from "../config/generatePromptForWebsite.js";
import generatePromptForGame from "../config/generatePromptForGame.js";
import generatePromptWebsite from "../config/generatePromptForWebsite.js";
import generatePromptForWebsite from "../config/generatePromptForWebsite.js";

export const textGenerate = async (req, res) => {
  const { message } = req.body;
  const chatId = req.params.chatId;
  const userId = req.user._id;

  try {
    let chat;

    if (chatId) {
      chat = await Chat.findOne({ _id: chatId, userId });
      if (!chat) {
        return res
          .status(404)
          .json({ success: false, error: "Chat not found" });
      }
    } else {
      chat = new Chat({ userId, messages: [] });
      await chat.save();
    }

    const MAX_HISTORY = 10;
    const promptMessage = [
      ...chat.messages
        .slice(-MAX_HISTORY)
        .filter((m) => Array.isArray(m.parts) && m.parts.length > 0),
      { role: "user", parts: [{ text: message }] },
    ];

    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Transfer-Encoding", "chunked");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("X-Chat-Id", chat._id.toString());

    const classificationPrompt = `Classify this prompt as either "game" or "website". Only reply with a single word.\nPrompt: ${message}`;
    const classification = await geminiClassification(classificationPrompt);
    const type = classification.trim().toLowerCase();

    // Generate code
    const answer =
      type === "game"
        ? await generateGameText(promptMessage)
        : await generateWebsiteText(promptMessage);

    let streamedText = "";

    for await (const chunk of answer) {
      const text = chunk.text || "";
      streamedText += text;
      res.write(text);
    }

    chat.messages.push({ role: "user", parts: [{ text: message }] });
    chat.messages.push({
      role: "model",
      parts: [{ text: streamedText }],
      files: [],
    });

    await chat.save();
    res.end();
  } catch (error) {
    console.error("Chat error:", error);
    if (!res.headersSent) {
      res.status(500).json({ success: false, error: "Something went wrong." });
    } else {
      res.end();
    }
  }
};

// export const codeGenerate = async (req, res) => {
//   const { message } = req.body;

//   const { chatId } = req.params;
//   const userId = req.user._id;

//   try {
//     const chat = await Chat.findOne({ _id: chatId, userId });

//     const MAX_HISTORY = 10;
//     const promptMessage = [
//       ...chat.messages.slice(-MAX_HISTORY),
//       { role: "user", parts: [{ text: message }] },
//     ];

//     const filteredPrompt = promptMessage.filter(
//       (item) => item.parts && item.parts.length > 0
//     );

//     res.setHeader("Content-Type", "application/json; charset=utf-8");
//     res.setHeader("Transfer-Encoding", "chunked");

//     const classificationPrompt = `Classify this prompt as either "game" or "website". Only reply with a single word.\nPrompt: ${message}`;
//     const classification = await geminiClassification(classificationPrompt);
//     const type = classification.trim().toLowerCase();

//     const answer =
//       type === "game"
//         ? await generateGameCode(filteredPrompt)
//         : await generateWebsiteCode(filteredPrompt);

//     const text = answer?.candidates?.[0]?.content?.parts?.[0]?.text || "";

//     let files = [];
//     try {
//       const cleaned = text
//         .replace(/^```(?:json)?\s*/i, "")
//         .replace(/```$/, "")
//         .trim();

//       // ⛔ guard against invalid JSON
//       if (!cleaned.startsWith("[") && !cleaned.startsWith("{")) {
//         throw new Error("Response is not valid JSON");
//       }

//       const parsed = JSON.parse(cleaned);

//       // ✅ handle array format
//       if (Array.isArray(parsed)) {
//         files = parsed.map(({ path, content }) => ({ path, content }));
//       }
//       // ✅ handle legacy "files" object format (if used accidentally)
//       else if (parsed?.files) {
//         files = Object.entries(parsed.files).map(([path, { code }]) => ({
//           path,
//           content: code,
//         }));
//       }
//       for (const file of files) {
//         const streamChunk = JSON.stringify({
//           type: "file",
//           value: file,
//         });

//         res.write(streamChunk + "\n"); // newline-delimited chunks

//         // Optional: Simulate delay to observe frontend rendering
//         await new Promise((r) => setTimeout(r, 100));
//       }
//     } catch (err) {
//       console.warn("Could not parse files from response", err.message);
//       return res.status(500).json({
//         success: false,
//         error: "Invalid response format from AI. Expected JSON array of files.",
//       });
//     }

//     // Save chat message
//     chat.messages.push({
//       role: "model",
//       parts: [],
//       files,
//     });

//     await chat.save();

//     // ✅ End streaming
//     res.end();
//   } catch (error) {
//     console.error("Chat error:", error);
//     if (!res.headersSent) {
//       res.status(500).json({ success: false, error: "Something went wrong." });
//     } else {
//       res.end();
//     }
//   }
// };

export const codeGenerate = async (req, res) => {
  const { message } = req.body;

  const { chatId } = req.params;
  const userId = req.user._id;

  try {
    const chat = await Chat.findOne({ _id: chatId, userId });

    const MAX_HISTORY = 10;
    const promptMessage = [
      ...chat.messages.slice(-MAX_HISTORY),
      { role: "user", parts: [{ text: message }] },
    ];

    const filteredPrompt = promptMessage.filter(
      (item) => item.parts && item.parts.length > 0
    );

    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Transfer-Encoding", "chunked");

    const classificationPrompt = `Classify this prompt as either "game" or "website". Only reply with a single word.\nPrompt: ${message}`;
    const classification = await geminiClassification(classificationPrompt);
    const type = classification.trim().toLowerCase();

    const answer =
      type === "game"
        ? await generateGameCode(filteredPrompt)
        : await generateWebsiteCode(filteredPrompt);

    const text = answer?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    let files = [];
    try {
      const cleaned = text
        .replace(/^```(?:json)?\s*/i, "")
        .replace(/```$/, "")
        .trim();

      // ⛔ guard against invalid JSON
      if (!cleaned.startsWith("[") && !cleaned.startsWith("{")) {
        throw new Error("Response is not valid JSON");
      }

      const parsed = JSON.parse(cleaned);

      // ✅ handle array format
      if (Array.isArray(parsed)) {
        files = parsed.map(({ path, content }) => ({ path, content }));
      }
      // ✅ handle legacy "files" object format (if used accidentally)
      else if (parsed?.files) {
        files = Object.entries(parsed.files).map(([path, { code }]) => ({
          path,
          content: code,
        }));
      }
    } catch (err) {
      console.warn("Could not parse files from response", err.message);
      return res.status(500).json({
        success: false,
        error: "Invalid response format from AI. Expected JSON array of files.",
      });
    }

    // Save chat message
    chat.messages.push({
      role: "model",
      parts: [],
      files,
    });

    await chat.save();

    res.status(200).json({ success: true, files });
  } catch (error) {
    console.error("Chat error:", error);
    if (!res.headersSent) {
      res.status(500).json({ success: false, error: "Something went wrong." });
    } else {
      res.end();
    }
  }
};

export const enhanceUserPrompt = async (req, res) => {
  const { message } = req.body;

  if (!message || typeof message !== "string") {
    return res
      .status(400)
      .json({ success: false, error: "Invalid prompt message." });
  }

  try {
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Transfer-Encoding", "chunked");
    res.setHeader("Cache-Control", "no-cache");

    const classificationPrompt = `Classify this prompt as either "game" or "website". Only reply with a single word.\nPrompt: ${message}`;
    const classification = await geminiClassification(classificationPrompt);
    const type = classification.trim().toLowerCase();

    const answer =
      type === "game" ? await generatePromptForGame(message) : await generatePromptForWebsite(message);
    console.log(type);
    
    for await (const chunk of answer) {
      const text = chunk?.text || "";
      if (text) {
        res.write(text);
      }
    }

    res.end();
  } catch (error) {
    console.error("Prompt enhance error:", error);

    if (!res.headersSent) {
      res.status(500).json({ success: false, error: "Something went wrong." });
    } else {
      res.end();
    }
  }
};

export const getUserChats = async (req, res) => {
  try {
    const chats = await Chat.find({ userId: req.user._id }).sort({
      updatedAt: -1,
    });
    res.json({ success: true, chats });
  } catch (err) {
    console.error("Error fetching chats:", err.message);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

export const getChatById = async (req, res) => {
  const userId = req.user._id;
  const chatId = req.params.chatId;

  try {
    const chat = await Chat.findOne({ _id: chatId, userId });

    if (!chat) {
      return res.status(404).json({ success: false, error: "Chat not found" });
    }

    res.json({ success: true, chat });
  } catch (err) {
    console.error("Error fetching chat:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

export const deleteChatById = async (req, res) => {
  const userId = req.user._id;
  const chatId = req.params.chatId;

  try {
    const chat = await Chat.findOneAndDelete({ _id: chatId, userId });

    if (!chat) {
      return res.status(404).json({ success: false, error: "Chat not found" });
    }

    res.json({ success: true, message: "Delete successfully" });
  } catch (err) {
    console.error("Error deleting chat:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
};
