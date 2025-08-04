function parseAIResponse(raw) {
  try {
    const cleaned = raw.replace(/```json\s*|\s*```/g, "").trim();
    const parsed = JSON.parse(cleaned);

    const descriptionText = parsed.text;
    const files = parsed.files.map(file => ({
      path: file.path,
      content: file.content
        .replace(/\\n/g, "\n")        // Convert line breaks
        .replace(/\\"/g, '"')         // Convert escaped quotes
        .replace(/\\\\/g, "\\")       // Convert escaped backslashes
    }));

    return { text: descriptionText, files };
  } catch (err) {
    console.error("❌ Failed to parse AI response:", err);
    return { text: "", files: [] };
  }
}
