import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: "",
});

export const handleChat = async (req, res) => {
  const question = req.body.question || "";

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: question,
      config: {
        systemInstruction:
          "You are a coding assistant for students. Respond only in markdown with headings, lists, bold, and line breaks. Help students with programming questions by giving hints, explanations, and related CS concepts, but never provide full solutions or unrelated topics. Stay strictly within coding and programming context.",
      },
    });

    res.json({ answer: response.text });
  } catch (error) {
    console.error("Gemini API error:", error);
    res.status(500).json({ answer: "Sorry, error obtaining response." });
  }
};
