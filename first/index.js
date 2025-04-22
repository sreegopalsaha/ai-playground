import { GoogleGenAI } from "@google/genai";
import "dotenv/config";
import inquirer from "inquirer";

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
        text: `
You're a friendly AI running in a terminal. 

1. Start by greeting the user with good vibes — ask how their day is going.  
2. Then wait for the user's input.
        `.trim(),
      },
    ],
    role: "user",
  },
];

const config = {};

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const main = async () => {
  while (true) {
    const modelResponse = await ai.models.generateContent({
      model,
      config,
      contents,
    });

    console.log("AI: ", modelResponse.text);

    contents.push({
      parts: [
        {
          text: modelResponse.text,
        },
      ],
      role: "model",
    });

    const userInput = await inquirer.prompt([
      {
        type: "input",
        name: "text",
        message: "You: ",
      },
    ]);

    if (userInput.text === "exit") {
      console.log("Exiting...");
      process.exit(0);
    }

    contents.push({
      parts: [
        {
          text: userInput.text,
        },
      ],
      role: "user",
    });
  }
};

main();
