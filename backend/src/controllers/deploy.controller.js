import fetch from "node-fetch";

export const deployProject = async (req, res) => {
  const { files } = req.body;

  if (!files || !Array.isArray(files)) {
    return res.status(400).json({ success: false, error: "No files provided." });
  }

  try {
    const vercelFiles = files.map(({ path, content }) => ({
      file: path.startsWith("/") ? path.slice(1) : path,
      data: content,
    }));

    const response = await fetch("https://api.vercel.com/v13/deployments", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.VERCEL_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "genify-project",
        files: vercelFiles,
         target: "production",
        projectSettings: {
          framework: null,
        },
      }),
    });

    const result = await response.json();

    if (response.ok && result?.url) {
      res.json({ success: true, url: `https://${result.url}` });
    } else {
      console.error("❌ Vercel API error:", result);
      res.status(500).json({ success: false, error: result });
    }
  } catch (err) {
    console.error("❌ Server Error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};
