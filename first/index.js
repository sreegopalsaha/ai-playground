import { GoogleGenAI } from "@google/genai";
import "dotenv/config";

// https://googleapis.github.io/js-genai/main/index.html

if (!process.env.GEMINI_API_KEY) {
  console.log("GOOGLE_API_KEY is not set in .env file");
  process.exit(1);
}

const model = "gemini-2.0-flash-001";
const contents = [
  {
    parts: [
      {
        text: "Hello, how are you?",
      },
    ],
    role: "user",
  },
];

const config = {};

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const main = async () => {
  const response = await ai.models.generateContent({
    model,
    config,
    contents,
  });

  console.log(response.text);
};

main()
