import { GoogleGenAI, Content, FunctionCall } from "@google/genai";
import "dotenv/config";
import inquirer from "inquirer";
import { getWeatherDeclaration, getWeather } from "./tools/getWeather.js";

const config: any = {
  toolConfig: {
    functionCallingConfig: {
      mode: "auto",
    },
  },
  tools: [
    {
      functionDeclarations: [getWeatherDeclaration],
    },
  ],
};

if (!process.env.GEMINI_API_KEY) {
  console.log("GEMINI_API_KEY is not set in .env file");
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const model = "gemini-2.0-flash-001";

const contents: Content[] = [
  {
    role: "user",
    parts: [
      {
        text: `
You're a friendly AI running in a terminal.

1. Start by greeting the user with good vibes — ask how their day is going.
2. Then wait for the user's input.
        `.trim(),
      },
    ],
  },
];

const main = async () => {
  while (true) {
    const modelResponse = await ai.models.generateContent({
      model,
      config,
      contents,
    });

    if (modelResponse.text) {
      console.log("AI:", modelResponse.text);
      contents.push({
        role: "model",
        parts: [{ text: modelResponse.text }],
      });
    }

    if (modelResponse.functionCalls) {
      for (const func of modelResponse.functionCalls) {
        console.log("Function Call:", func.name, func.args);

        if (func.name === "getWeather") {
          const weather = await getWeather(func.args as { city: string });

          contents.push({
            role: "user",
            parts: [
              {
                text: `The function returned this: ${JSON.stringify(weather, null, 2)}`,
              },
            ],
          });

          // Re-run model after getting function result
          const followup = await ai.models.generateContent({
            model,
            config,
            contents,
          });

          if (followup.text) {
            console.log("AI:", followup.text);
            contents.push({
              role: "model",
              parts: [{ text: followup.text }],
            });
          }
        }
      }
    }

    const userInput = await inquirer.prompt<{ text: string }>([
      {
        type: "input",
        name: "text",
        message: "You: ",
      },
    ]);

    if (userInput.text.toLowerCase() === "exit") {
      console.log("Exiting...");
      process.exit(0);
    }

    contents.push({
      role: "user",
      parts: [{ text: userInput.text }],
    });
  }
};

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
