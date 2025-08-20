import type OpenAI from "openai";
import {
  generateAnimalName,
  generateAnimalNameToolDefinition,
} from "./generateAnimalName";
import {
  generateDadJoke,
  generateDadJokeToolDefinition,
} from "./generateDadJoke";

export const runTool = async (
  toolCall: OpenAI.Chat.Completions.ChatCompletionMessageToolCall,
  userMessage: string
) => {
  const input = {
    userMessage,
    toolArgs: JSON.parse(toolCall?.function?.arguments || "{}"),
  };

  switch (toolCall?.function?.name) {
    case generateAnimalNameToolDefinition.name:
      return generateAnimalName(input);

    case generateDadJokeToolDefinition.name:
      return generateDadJoke(input);

    default:
      return `Sorry, this tool is not available right now: ${toolCall?.function?.name}`;
  }
};
