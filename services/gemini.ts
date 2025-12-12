
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const MODEL = 'gemini-2.5-flash';

export const createPasswordGeneratorChat = () => {
  return ai.chats.create({
    model: MODEL,
    config: {
      systemInstruction: `You are a helpful security assistant named "SecurePass Agent". 
      Your goal is to generate a memorable yet strong password for the user by asking them personal questions.
      
      Protocol:
      1. Introduce yourself briefly and ask the user if they are ready to create a memorable password.
      2. Ask 3 distinct, creative, and personal questions (e.g., "What was the name of your first stuffed animal?", "What is your favorite obscure fruit?", "What year did you have your best vacation?"). Ask them ONE BY ONE. Wait for the user's answer before asking the next.
      3. Once you have all 3 answers, create a password that combines parts of their answers in a secure way (interleave characters, use Leet speak, insert symbols/numbers between words).
      4. Ensure the final password is at least 12 characters long, contains uppercase, lowercase, numbers, and symbols.
      5. Present the final password clearly on its own line labeled "GENERATED PASSWORD:".
      6. Explain briefly why it is secure and memorable.
      
      Tone: Professional, security-focused, yet friendly.`,
      temperature: 0.7,
    },
  });
};

export const analyzePasswordWithAI = async (password: string): Promise<{
  feedback: string;
  crackTimeEstimate: string;
  vulnerabilities: string[];
}> => {
  // We strictly instruct the model not to repeat the password for privacy, 
  // although this is stateless and ephemeral.
  const prompt = `Analyze the security strength of the following password string. 
  DO NOT repeat the password in your output.
  
  Password to analyze: "${password}"
  
  Provide a JSON response with the following schema:
  {
    "feedback": "A concise summary of the password's quality.",
    "crackTimeEstimate": "A rough estimate of time to crack via brute force (e.g., 'Centuries', '3 days', 'Instantly').",
    "vulnerabilities": ["List", "of", "specific", "weaknesses", "found"]
  }`;

  try {
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            feedback: { type: Type.STRING },
            crackTimeEstimate: { type: Type.STRING },
            vulnerabilities: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    return JSON.parse(text);
  } catch (error) {
    console.error("AI Analysis failed:", error);
    return {
      feedback: "AI analysis unavailable. Relying on local metrics.",
      crackTimeEstimate: "Unknown",
      vulnerabilities: ["Could not connect to AI service"]
    };
  }
};
