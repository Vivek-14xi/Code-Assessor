import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey:"AIzaSyAkItuP8tACs0Hx95Nd-jB3Z5EfvSR6BlI" });

export const handleChat = async (req, res) => {
  const question = req.body.question || "";

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: question,
      config: {
        systemInstruction: "Provide response in markdown format with proper headings, lists, bold, and line breaks.",
      },
    }); 
 
    res.json({ answer: response.text });
  } catch (error) {
    console.error("Gemini API error:", error);
    res.status(500).json({ answer: "Sorry, error obtaining response." });
  }
};
