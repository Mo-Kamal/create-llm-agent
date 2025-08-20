import { z } from "zod";
import { ANIMAL_NAMES } from "../constants";
import { ToolFn } from "../types";

export const generateAnimalNameToolDefinition = {
  name: "generate_animal_name",
  parameters: z.object({}),
  description: "generate a random animal name",
};

type Args = z.infer<typeof generateAnimalNameToolDefinition.parameters>;

export const generateAnimalName: ToolFn<Args, string> = async ({
  toolArgs,
  userMessage,
}) => {
  const randomAnimalName =
    ANIMAL_NAMES[Math.floor(Math.random() * ANIMAL_NAMES.length)];
  return randomAnimalName;
};
