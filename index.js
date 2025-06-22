const { GoogleGenAI } = require("@google/genai");
const dotenv = require("dotenv");
dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const express = require("express")
const fs = require("fs")
const multer = require("multer")
const path = require("path")
const port = 3000

const app = express()
app.use(express.json())
const model =  "gemini-2.5-flash"

const upload = multer({ dest: "uploads/"})
// async function main() {
//   const response = await ai.models.generateContent({
//     model: model,
//     contents: "Write story about ai and magic",
//   });
//   console.log(response.text);
// }

// main();

app.post("/generate-text", async (req, res) => {
  const { prompt } = req.body;
  try {
    const result = await ai.models.generateContent({
      model: model,
      contents: prompt
    });
    const text = result.candidates?.[0]?.content?.parts?.[0]?.text || "No output";

    console.log(text, "ok?");
    res.status(200).json({ output: text });
  } catch (error) {
    console.error("Error generating content:", error);
    res.status(500).json({ error: error.message });
  }
});

const imageGeneratePart = (filepath) => ({
  inlineData: {
    data: fs.readFileSync(filepath).toString("base64"),
    mimeType: "image/png",
  },
});

app.post("/generate-from-image", upload.single("image"), async (req, res) => {
  const prompt = req.body.prompt || "Describe the image";
  const image = imageGeneratePart(req.file.path);

  try {
    const result = await ai.models.generateContent({
      model: model,
      contents: [
        {
          role: "user",
          parts: [image, { text: prompt }],
        },
      ],
    });

    const text =
      result.candidates?.[0]?.content?.parts?.[0]?.text || "No output";

    console.log(text, "ok?");
    res.status(200).json({ output: text });
  } catch (error) {
    console.error("Error generating content:", error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
    console.log("This gemini app ai running")
})