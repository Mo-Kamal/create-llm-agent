import { generateAnimalNameToolDefinition } from "./generateAnimalName";
import { generateDadJokeToolDefinition } from "./generateDadJoke";

export const tools = [
  generateDadJokeToolDefinition,
  generateAnimalNameToolDefinition,
];
