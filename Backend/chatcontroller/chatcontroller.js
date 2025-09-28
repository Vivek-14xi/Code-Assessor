import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: "",
});

export const handleChat = async (req, res) => {
  const question = req.body.question || "";
  const code = req.body.code || "";       // Code from editor
  const output = req.body.output || "";   // Output from run

  try {
    // Combine question, code, output into a single prompt
    const prompt = `
User Question: ${question}

Code:
${code}

Output:
${output}

`;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
      config: {
        systemInstruction:
          "You are a coding assistant for students. Respond only in markdown with headings, lists, bold, and line breaks. Help students with programming questions by giving hints, explanations, and related CS concepts, but never provide full solutions or unrelated topics. Stay strictly within coding and programming context. also indicate the line if possible where error occurs but not give full code also try to explain in medium format whith if possible but not every time",
      },
    });

    res.json({ answer: response.text });
  } catch (error) {
    console.error("Gemini API error:", error);
    res.status(500).json({ answer: "Sorry, error obtaining response." });
  }
};
