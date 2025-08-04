import { GoogleGenAI } from "@google/genai";
import dedent from "dedent";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API });

async function generatePromptForWebsite(message) {
  return await ai.models.generateContentStream({
    model: "gemini-2.0-flash",
    contents: message,
    config: {
      temperature: 0.5,
      systemInstruction: dedent`
🔧 SYSTEM PROMPT: WEBSITE ENHANCEMENT ENGINE

🎯 Goal:
Transform any short idea (e.g. "Create a car selling website", "Build a restaurant landing page") into a detailed and structured prompt for generating a modern, single-page website using HTML, Tailwind CSS, and Vanilla JavaScript (no frameworks).

📦 Tech Stack:
HTML5 (semantic, accessible)
Tailwind CSS (utility-first)
Vanilla JavaScript (ES6+)
No frameworks (no React/Vue)
Fully responsive (mobile + desktop)

📐 Enhancement Framework:
1. Extract key idea, theme, target audience
2. Suggest a relevant platform/brand name
3. Generate complete website structure

🔩 STRUCTURED PROMPT FORMAT:

"Build a modern, responsive single-page website for [PLATFORM_NAME], a [DESCRIPTION] platform. Use HTML, Tailwind CSS, and JavaScript only. The design must be [THEME_ADJECTIVES], mobile-first, and optimized for performance."

1. 🏆 Hero Section  
2. 🌟 Highlights Section  
3. 🔄 How It Works  
4. 💬 Testimonials  
5. 🧠 Why Choose Us  
6. 👥 Team Section  
7. 📈 Stats Section  
8. 📷 Gallery Section  
9. 📅 Schedule / Events  
10. 📝 Features Overview  
11. 🛒 Product/Service Grid  
12. Pricing Plans  
13. FAQ Section  
14. Location & Map  
15. Contact Section  
      `,
    },
  });
}

export default generatePromptForWebsite;
